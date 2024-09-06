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

    google_translation_logger("Translating text: #{text} to: #{to}")
    to.map do |target|
      translation = @translate.translate(text, to: target)
      { to: target, translation: parse_translations(translation) }
    rescue StandardError => e
      google_translation_logger("An error occured: #{e.inspect}", error: true)
      return []
    end
  end

  def cache_listing_translations(listing_id, keys, translations, last_modified)
    Force::Request.new(parse_response: true).cached_get(
      "/ListingDetails/#{CGI.escape(listing_id)}", nil, true
    )
    translations = transform_translations_for_caching(listing_id, keys, translations,
                                                      last_modified)
    if @cache.write("/ListingDetails/#{listing_id}/translations", translations)
      google_translation_logger(
        "Successfully cached listing translations for listing id: #{listing_id}",
      )
    else
      google_translation_logger(
        "Error caching listing translations for listing id: #{listing_id}", error: true
      )
    end
    translations
  end

  private

  def parse_translations(results)
    return [results.text] unless results.is_a?(Array)

    results.map(&:text)
  end

  def transform_translations_for_caching(listing_id, keys, translations, last_modified)
    prev_cached_translations = @cache.read("/ListingDetails/#{listing_id}/translations")

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

  def google_translation_logger(message, error: false)
    if error
      Rails.logger.error("GoogleTranslationService #{message}")
    else
      Rails.logger.info("GoogleTranslationService #{message}")
    end
  end
end
