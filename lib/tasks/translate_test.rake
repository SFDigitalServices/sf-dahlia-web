namespace :translate_test do
  desc 'Testing Translation Service'
  task translate: :environment do
    fields = %w[hello world]
    languages = %w[ES ZH TL]
    translation_service = GoogleTranslationService.new(project_id: 'housing-393518',
                                                       key: ENV['GOOGLE_TRANSLATE_KEY'])
    translations = translation_service.translate(fields, languages)
    Rails.logger.info("Test translation results #{translations}")
  end
end
