require 'rails_helper'

describe GoogleTranslationService do
  describe 'when an array of text and an array of target languages is passed' do
    fields = %w[Hello World]
    languages = %w[ES]
    mock_response = [OpenStruct.new(text: 'Hello'), OpenStruct.new(text: 'World')]
    expected_result = [{ to: 'ES', translation: %w[Hello World] }]

    it 'translates text to the target language' do
      mock_translate = instance_double('Google::Cloud::Translate::V2::Api')
      allow(Google::Cloud::Translate::V2).to receive(:new).and_return(mock_translate)
      service = GoogleTranslationService.new(project_id: 'testId', key: 'testKey')
      allow(mock_translate).to receive(:translate).with(fields,
                                                        { to: 'ES' }).and_return(mock_response)

      result = service.translate(fields, languages)
      expect(result).to eq(expected_result)
    end
  end
end
