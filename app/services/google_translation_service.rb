require 'google/cloud/translate/v2'

module Translate
  # Translate
  class TranslationService
    puts 'Connecting to Google Cloud Translate...'

    translate = Google::Cloud::Translate::V2.new("project_id": 'housing-393518',
                                                 "key": ENV['GOOGLE_TRANSLATE_KEY'])

    translation = translate.translate 'Hello world!', to: 'la'
    puts translation.text #=> "Salve mundi!"
  end
end
