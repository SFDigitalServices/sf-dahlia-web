require 'google/cloud/translate/v2'

module GoogleTranslate
  # Translate
  class GoogleTranslationService
    puts 'Connecting to Google Cloud Translate...'

    translate = Google::Cloud::Translate::V2.new("project_id": 'housing-393518',
                                                 "key": 'AIzaSyDezm2LJY4CY9wtUWcQsw7Ldu93kBfFjP4')

    translation = translate.translate 'Hello world!', 'Good Morning', to: 'es'
    puts translation #=> "Salve mundi!"
  end
end
