require 'rails_helper'

describe GoogleTranslationService do
  describe 'when an array of text and an array of target languages is passed' do
    fields = %w[Hello World]
    languages = %w[ES]
    mock_response = [OpenStruct.new(text: 'Hello'), OpenStruct.new(text: 'World')]
    expected_result = [{ to: 'ES', translation: %w[Hello World] }]
    listing_id = 'a0W0P00000F8YG4UAN'
    let(:single_listing) do
      VCR.use_cassette('listings/single_cached_listing') do
        Force::ListingService.send :cached_listing, listing_id
      end
    end

    it 'translates text to the target language' do
      mock_translate = instance_double('Google::Cloud::Translate::V2::Api')
      allow(Google::Cloud::Translate::V2).to receive(:new).and_return(mock_translate)
      service = GoogleTranslationService.new(project_id: 'testId', key: 'testKey')
      allow(mock_translate).to receive(:translate).with(
        fields,
        { to: 'ES' },
      ).and_return(mock_response)

      result = service.translate(fields, languages)
      expect(result).to eq(expected_result)
    end

    it 'caches translations for a listing' do
      service = GoogleTranslationService.new(project_id: 'testId', key: 'testKey')
      allow(Force::ListingService).to receive(:cached_listing).and_return(single_listing)

      result = service.transform_translations_for_caching(listing_id, fields,
                                                          expected_result)

      expect(result[0][:translations]).to eq({ Hello: { ES: 'Hello' },
                                               World: { ES: 'World' } })
    end

    it 'updates cached translations for a listing' do
      service = GoogleTranslationService.new(project_id: 'testId', key: 'testKey')
      # add translations
      single_listing[0][:translations] =
        { Hello: { ES: 'Hello' }, World: { ES: 'World' } }
      allow(Force::ListingService).to receive(:cached_listing).and_return(single_listing)

      fields_updated = %w[World]
      translations = [{ to: 'ES', translation: %w[Mundo] }]

      result = service.transform_translations_for_caching(
        listing_id,
        fields_updated,
        translations,
      )

      expect(result[0][:translations]).to eq({ Hello: { ES: 'Hello' },
                                               World: { ES: 'Mundo' } })
    end
  end
end
