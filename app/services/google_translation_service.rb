require 'google/cloud/translate/v2'

# Translate
class GoogleTranslationService
  class TranslationError < StandardError; end

  def initialize(project_id:, key:)
    Rails.logger.info('Connecting to Google Cloud Translate...')
    @translate = Google::Cloud::Translate::V2.new("project_id": project_id, "key": key)
  end

  def translate(*text, to)
    to.map do |target|
      translation = @translate.translate(text, to: target)
      { to: target, translation: parse_translations(translation) }
    rescue StandardError => e
      Rails.logger.error("An error occured: #{e.message}")
      raise TranslationError, e.message
    end
  end

  def parse_translations(results)
    return [results.text] unless results.is_a?(Array)

    results.map(&:text)
  end
end
