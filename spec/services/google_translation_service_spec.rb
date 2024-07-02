require 'rails_helper'

describe GoogleTranslationService do
  describe 'when an array of text and an array of target languages is passed' do
    fields = %w[Hello World]
    languages = %w[ES]
    mock_response = [OpenStruct.new(text: 'Hello'), OpenStruct.new(text: 'World')]
    expected_result = [{ to: 'ES', translation: %w[Hello World] }]
    listing_id = 'a0W0P00000F8YG4UAN'
    let(:single_listing) do
      VCR.use_cassette('listings/single_listing') do
        Force::ListingService.send :listing, listing_id
      end
    end

    it 'translates text to the target language' do
      mock_translate = instance_double('Google::Cloud::Translate::V2::Api')
      allow(Google::Cloud::Translate::V2).to receive(:new).and_return(mock_translate)
      service = GoogleTranslationService.new(project_id: 'testId', key: 'testKey')
      allow(mock_translate).to receive(:translate).with(fields,
                                                        { to: 'ES' }).and_return(mock_response)

      result = service.translate(fields, languages)
      expect(result).to eq(expected_result)
    end

    it 'appends translations to listing for caching' do
      mock_translate = instance_double('Google::Cloud::Translate::V2::Api')
      service = GoogleTranslationService.new(project_id: 'testId', key: 'testKey')
      allow(Force::ListingService).to receive(:listing).and_return(single_listing)

      result = service.transform_translations_for_caching(listing_id, fields, expected_result)

      expect(result[:translations]).to eq({:Hello=>{:ES=>"Hello"}, :World=>{:ES=>"World"}})
    end
  end
end
