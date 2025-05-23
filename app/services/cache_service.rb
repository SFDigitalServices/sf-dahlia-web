# service class for pre-fetching + caching salesforce data
class CacheService
  def prefetch_listings(opts = {})
    # Refresh OAuth token, to avoid unauthorized errors in case it has expired
    Force::Request.new.refresh_oauth_token
    Rails.logger.info('CacheService Started')
    # Marshal.load(Marshal.dump(cached_listings)) is a hack to make a deep clone of cached_listings
    # so that prev_cached_listings isn't pointing to the same object as fresh_listings
    cached_listings = Force::ListingService.listings(subset: 'browse')
    @prev_cached_listings = Marshal.load(Marshal.dump(cached_listings))

    @fresh_listings = Force::ListingService.listings(subset: 'browse', force: true)

    if opts[:refresh_all]
      cache_all_listings
    else
      cache_only_updated_listings
    end
    Rails.logger.info('CacheService Finished')
  end

  def process_translations(listing)
    translation_service = GoogleTranslationService.new
    strings_to_translate = build_strings_to_translate(listing)
    languages = %w[ES ZH TL]

    GoogleTranslationService.log_translations(
      msg: 'Text to translate',
      caller_method: "#{self.class.name}##{__method__}",
      listing_id: listing['Id'],
      text: strings_to_translate.values,
      char_count: true,
    )
    translations = translation_service.translate(
      strings_to_translate.values,
      languages,
    )
    translations.each do |target|
      next if target[:to] == 'EN'

      GoogleTranslationService.log_translations(
        msg: 'Translated text',
        caller_method: "#{self.class.name}##{__method__}",
        listing_id: listing['Id'],
        text: target[:translation],
      )
    end

    translation_service.cache_listing_translations(
      listing['Id'],
      strings_to_translate.keys.map do |key|
        ServiceHelper.convert_to_salesforce_field_name(key)
      end,
      translations,
      listing['LastModifiedDate'],
    )
  end

  private

  attr_accessor :prev_cached_listings, :fresh_listings

  def build_strings_to_translate(listing)
    strings_to_translate = {}
    ServiceHelper.listing_field_names.each do |field|
      strings_to_translate[field] = listing[field].present? ? listing[field] : ''
    end
    [
      %w[Open_Houses Venue],
      %w[Information_Sessions Venue],
      %w[Listing_Images Image_Description],
      %w[Listing_Online_Details Listing_Online_Detail_Name],
    ].each do |key, nested_key|
      strings_to_translate =
        process_nested_translations(listing, strings_to_translate, key, nested_key)
    end
    strings_to_translate = translate_listing_preference_descriptions(
      listing,
      strings_to_translate,
    )
    translate_lottery_bucket_preference_names(
      listing,
      strings_to_translate,
    )
  end

  def process_nested_translations(listing, strings_to_translate, object_key, value)
    listing[object_key]&.each do |object|
      unless object[value].nil?
        strings_to_translate["#{object['Id']}.#{object_key}.#{value}"] ||= object[value]
      end
    end
    strings_to_translate
  end

  def translate_listing_preference_descriptions(listing, strings_to_translate)
    listing_preferences = Force::ListingService.preferences(listing['listingID'])
    return strings_to_translate if listing_preferences.blank?

    listing_preferences&.each do |preference|
      strings_to_translate["#{preference['listingPreferenceID']}.Description"] ||=
        preference['description']
    end
    strings_to_translate
  end

  # Lottery bucket preference names *may* be missing
  #   human translations, and *may* need to be machine translated
  # This is a workaround to address that, ahead of a future project
  #   to better integrate human and machine translations
  def translate_lottery_bucket_preference_names(listing, strings_to_translate)
    return strings_to_translate unless listing['Lottery_Status'] == 'Lottery Complete'

    lottery_buckets = Force::ListingService.lottery_buckets(listing['listingID'])
    return strings_to_translate unless lottery_buckets.try(:[], 'lotteryBuckets')

    lottery_buckets['lotteryBuckets'].each do |bucket|
      pref_name = bucket['preferenceName']
      pref_name_translation_key = "listings.lotteryPreference.#{pref_name}.title"
      strings_to_translate[pref_name_translation_key] ||= pref_name
    end
    strings_to_translate
  end

  def cache_all_listings
    fresh_listings.each do |l|
      cache_single_listing(l, rake_task: 'prefetch_daily')
    end
  end

  def cache_only_updated_listings
    fresh_listings.each do |fresh_listing|
      prev_cached_listing = prev_cached_listings.find do |l|
        l['Id'] == fresh_listing['Id']
      end

      next if listing_unchanged?(prev_cached_listing, fresh_listing) &&
              listing_images_unchanged?(prev_cached_listing, fresh_listing)

      cache_single_listing(fresh_listing, rake_task: 'prefetch_10min')
    end
  end

  def listing_unchanged?(prev_cached_listing, fresh_listing)
    prev_cached_listing.present? &&
      (prev_cached_listing['LastModifiedDate'] == fresh_listing['LastModifiedDate'])
  end

  def listing_images_equal?(prev_cached_listing_images, fresh_listing_images)
    fresh_li_slice = fresh_listing_images&.map { |li| li.slice('Id', 'Image_URL') }
    prev_li_slice = prev_cached_listing_images&.map { |li| li.slice('Id', 'Image_URL') }
    (fresh_li_slice - prev_li_slice).empty? && (prev_li_slice - fresh_li_slice).empty?
  end

  def listing_images_unchanged?(prev_cached_listing, fresh_listing)
    prev_cached_listing_images = prev_cached_listing&.dig('Listing_Images')
    fresh_listing_images = fresh_listing&.dig('Listing_Images')

    return true if fresh_listing_images.blank?

    listing_images_equal?(prev_cached_listing_images, fresh_listing_images)
  end

  def cache_single_listing(listing, rake_task: nil)
    Rails.logger.info("Calling cache_single_listing for #{listing['Id']}")

    id = listing['Id']
    # cache this listing from API
    Force::ListingService.listing(id, force: true, rake_task:)
    units = Force::ListingService.units(id, force: true)
    AmiCacheService.new.cache_ami_chart_data(units)
    Force::ListingService.preferences(id, force: true)
    Force::ListingService.lottery_buckets(id, force: true) if listing_closed?(listing)
    process_listing_images(listing)
  rescue Faraday::ClientError => e
    Sentry.capture_exception(e, tags: { 'listing_id' => listing['Id'] })
  end

  def process_listing_images(listing)
    multiple_listing_image_processor = MultipleListingImageService.new(listing).process_images
    return unless multiple_listing_image_processor&.errors.present?

    Rails.logger.error multiple_listing_image_processor.errors.join(',')
  end

  def listing_closed?(listing)
    begin
      due_date_passed = Date.parse(listing['Application_Due_Date']) < Date.today
    rescue ArgumentError => e
      raise e unless e.message == 'invalid date'

      # if date is invalid, assume we do need to get lottery results
      due_date_passed = true
    end
    due_date_passed
  end
end
