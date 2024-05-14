require 'google/cloud/translate/v2'

module GoogleTranslate
  # Translate
  class GoogleTranslationService
    puts 'Connecting to Google Cloud Translate...'

    translate = Google::Cloud::Translate::V2.new("project_id": 'housing-393518',
                                                 "key": ENV['GOOGLE_TRANSLATE_KEY'])

    translation = translate.translate 'Hello world!', 'Good Morning', to: 'es'
    puts translation #=> "Salve mundi!"
  end
end
