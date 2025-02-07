require 'google/cloud/translate/v2'

# Translate
class GoogleTranslationService
  class TranslationError < StandardError; end

  def initialize
    google_translation_logger('Connecting to Google Cloud Translate...')
    @translate = Google::Cloud::Translate::V2.new(
      project_id: ENV.fetch('GOOGLE_PROJECT_ID', nil),
      key: ENV.fetch('GOOGLE_TRANSLATE_KEY',
                     nil),
    )
    @cache = Rails.cache
  end

  def translate(text, to)
    return [] if text.empty?

    google_translation_logger('Translating text...')
    translations = to.map do |target|
      translation = @translate.translate(text, to: target)
      { to: target, translation: parse_translations(translation) }
    rescue StandardError => e
      google_translation_logger('Error translating', e)
      return []
    end
    # include original values on the response
    translations.push({ to: 'EN', translation: text })
    translations
  end

  # we should keep `keys` and `translations` in one hash instead of
  #   separating and recombining them across different methods
  def cache_listing_translations(listing_id, keys, translations, last_modified)
    translations = transform_translations_for_caching(listing_id, keys, translations,
                                                      last_modified)
    cache_key = Force::ListingService.listing_translations_cache_key(listing_id)
    if @cache.write(cache_key, translations)
      google_translation_logger(
        "Successfully wrote translations to cache with key '#{cache_key}'",
      )
    else
      google_translation_logger(
        "Error writing translations to cache with key '#{cache_key}'", true
      )
    end
    translations
  end

  def self.log_translations(msg:, caller_method:, text:, listing_id:)
    msg_hash = {
      caller_method:,
      listing_id:,
      text:,
    }.to_json
    Rails.logger.info("#{msg}: #{msg_hash}")
  end

  private

  def parse_translations(results)
    return [results.text] unless results.is_a?(Array)

    results.map(&:text)
  end

  def transform_translations_for_caching(listing_id, keys, translations, last_modified)
    prev_cached_translations = @cache.read(
      Force::ListingService.listing_translations_cache_key(listing_id),
    )

    # keys can come from updated_values.keys in the event_subscriber_translate_service
    # they will be in the same order as the translations because the translation service
    # uses the values from that object and the api returns 1 for each key
    return_value = { LastModifiedDate: last_modified }

    translations.each do |target|
      target[:translation].each_with_index do |value, i|
        field = keys[i].to_sym
        return_value[field] ||= {}
        return_value[field][target[:to].to_sym] = value
      end
    end

    return { **prev_cached_translations, **return_value } if prev_cached_translations

    return_value
  end

  def google_translation_logger(message, error = nil)
    if error
      Rails.logger.error(
        "GoogleTranslationService #{message}: #{error.try(:message)}, " \
        "backtrace: #{error.try(:backtrace)&.[](0..5)}",
      )
    else
      Rails.logger.info("GoogleTranslationService #{message}")
    end
  end
end
