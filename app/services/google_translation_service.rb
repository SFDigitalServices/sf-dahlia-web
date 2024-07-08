require 'google/cloud/translate/v2'

# Translate
class GoogleTranslationService
  class TranslationError < StandardError; end

  def initialize(project_id:, key:)
    Rails.logger.info('Connecting to Google Cloud Translate...')
    @translate = Google::Cloud::Translate::V2.new(project_id:, key:)
    @cache = Rails.cache
  end

  def translate(text, to)
    to.map do |target|
      translation = @translate.translate(text, to: target)
      { to: target, translation: parse_translations(translation) }
    rescue StandardError => e
      Rails.logger.error("An error occured: #{e.message}")
      raise TranslationError, e.message
    end
  end

  def cache_listing_translations(listing_id, keys, translations)
    listing = transform_translations_for_caching(listing_id, keys, translations)
    if @cache.write("/ListingDetails/#{listing_id}", listing)
      Rails.logger.info(
        "Successfully cached listing translations for listing id: #{listing_id}",
      )
    else
      Rails.logger.error(
        "Error caching listing translations for listing id: #{listing_id}",
      )
    end
    listing
  end

  private

  def parse_translations(results)
    return [results.text] unless results.is_a?(Array)

    results.map(&:text)
  end

  def transform_translations_for_caching(listing_id, keys, translations)
    listing = Force::ListingService.cached_listing(listing_id)
    prev_cached_translations = listing[0][:translations] || {}
    # keys can come from updated_values.keys in the event_subscriber_translate_service
    # they will be in the same order as the translations because the translation service
    # uses the values from that object this would make the assumption that every value
    # comes back with 1 translation for each translation language (we would have a problem
    # if it came back with just 2 in the translation array but were expecting 3 fields)
    return_value = {}
    translations.each do |target|
      target[:translation].each_with_index do |value, i|
        field = keys[i].to_sym
        return_value[field] ||= {}
        return_value[field][target[:to].to_sym] = value
      end
    end
    # alternatively, we could splat translations into the listing object
    # so they aren't nested under the translations key, but instead under each key:
    # {**listing, **return_value}
    # gets complicated with nested translations (like listing image descriptions)
    listing[0][:translations] = { **prev_cached_translations, **return_value }
    listing
  end
end
