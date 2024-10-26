require 'google/cloud/translate/v2'

# Translate
class GoogleTranslationService
  class TranslationError < StandardError; end

  MAX_TRANSLATION_LOG_LENGTH = 128

  def initialize
    google_translation_logger('Connecting to Google Cloud Translate...')
    @translate = Google::Cloud::Translate::V2.new(
      project_id: ENV.fetch('GOOGLE_PROJECT_ID', nil),
      key: ENV.fetch('GOOGLE_TRANSLATE_KEY',
                     nil),
    )
    @cache = Rails.cache
  end

  def translate(text:, field_names:, targets:, caller_method:, listing_id: nil)
    return [] if text.empty?

    log_text_to_translate(caller_method, targets, text, field_names, listing_id)
    translations = targets.map do |target|
      translation = @translate.translate(text, to: target)
      parsed_translations = parse_translations(translation)
      log_translated_text(
        caller_method,
        target,
        parsed_translations,
        field_names,
        listing_id,
      )
      { to: target, translation: parsed_translations }
    rescue StandardError => e
      google_translation_logger('Error translating text', e)
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
        "Error writing translations to cache with key '#{cache_key}'", error: true
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

  def log_text_to_translate(caller_method, targets, text, field_names, listing_id)
    to_translate_log = {
      caller_method:,
      targets:,
      listing_id:,
      to_translate: field_names.zip(truncate_translations(text)).to_h,
    }.to_json
    google_translation_logger("Translating text: #{to_translate_log}")
  end

  def log_translated_text(caller_method, target, translations, field_names, listing_id)
    translated_log = {
      caller_method:,
      target:,
      listing_id:,
      translated: field_names.zip(truncate_translations(translations)).to_h,
    }.to_json
    google_translation_logger("Translated text: #{translated_log}")
  end

  def truncate_translations(translations)
    translations.map do |translation|
      if translation.length > MAX_TRANSLATION_LOG_LENGTH
        "#{translation[0..MAX_TRANSLATION_LOG_LENGTH]}..."
      else
        translation
      end
    end
  end

  def google_translation_logger(message, error = nil)
    if error
      Rails.logger.error(
        "GoogleTranslationService #{message}: #{error&.message}, " \
        "backtrace: #{error&.backtrace&.[](0..5)}",
      )
    else
      Rails.logger.info("GoogleTranslationService #{message}")
    end
  end
end
