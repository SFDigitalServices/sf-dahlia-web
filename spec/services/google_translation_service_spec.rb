require 'rails_helper'

describe GoogleTranslationService do
  describe 'when an array of text and an array of target languages is passed' do
    fields = %w[Hello World]
    languages = %w[ES]
    mock_response = [OpenStruct.new(text: 'Hello'), OpenStruct.new(text: 'World')]
    expected_result = [
      { to: 'ES', translation: %w[Hello World] },
      { to: 'EN', translation: %w[Hello World] },
    ]
    listing_id = 'a0W0P00000F8YG4UAN'
    let(:mock_translate) { instance_double(Google::Cloud::Translate::V2::Api) }
    let(:mock_request) { instance_double(Force::Request) }

    before do
      allow(Google::Cloud::Translate::V2).to receive(:new).and_return(mock_translate)
      allow(Force::Request).to receive(:new).and_return(mock_request)
      allow(mock_request).to receive(:cached_get).and_return(true)
    end

    it 'translates text to the target language' do
      service = GoogleTranslationService.new
      allow(mock_translate).to receive(:translate).with(
        fields,
        { to: 'ES' },
      ).and_return(mock_response)

      result = service.translate(fields, languages)
      expect(result).to eq(expected_result)
    end

    it 'transforms translations from api to an object for a listing' do
      service = GoogleTranslationService.new
      allow(Rails.cache).to receive(:read).and_return(nil)

      result = service.cache_listing_translations(
        listing_id,
        fields,
        expected_result,
        '2021-07-01T00:00:00Z',
      )

      expect(result).to eq({ LastModifiedDate: '2021-07-01T00:00:00Z',
                             Hello: { EN: 'Hello', ES: 'Hello' }, World: { EN: 'World', ES: 'World' } })
    end

    it 'updates translation object for a listing' do
      service = GoogleTranslationService.new

      # mock cached translations
      allow(Rails.cache).to receive(:read)
        .and_return({ Hello: { ES: 'Hello' }, World: { ES: 'World' } })

      fields_updated = %w[World]
      translations = [{ to: 'ES', translation: %w[Mundo] }]

      result = service.cache_listing_translations(
        listing_id,
        fields_updated,
        translations,
        '2021-07-01T00:00:00Z',
      )

      expect(result).to eq({ LastModifiedDate: '2021-07-01T00:00:00Z',
                             Hello: { ES: 'Hello' }, World: { ES: 'Mundo' } })
    end
  end
end