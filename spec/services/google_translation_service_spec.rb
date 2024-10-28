require 'rails_helper'

describe GoogleTranslationService do
  describe 'when an array of text and an array of target languages is passed' do
    fields = [
      'Hello',
      'World',
      'Long text that gets truncated in the logs, long text long text long text ' \
      'long text long text long text long text long text long text long text ',
    ]
    field_names = %w[hello_key world_key long_text_key]
    languages = %w[ES]
    mock_response = [
      OpenStruct.new(text: fields[0]),
      OpenStruct.new(text: fields[1]),
      OpenStruct.new(text: fields[2]),
    ]
    expected_result = [
      { to: 'ES', translation: fields },
      { to: 'EN', translation: fields },
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

      result = service.translate(
        text: fields, field_names:, targets: languages, caller_method: __method__,
      )
      expect(result).to eq(expected_result)
    end

    it 'transforms translations from api to an object for a listing' do
      service = GoogleTranslationService.new
      allow(Rails.cache).to receive(:read).and_return(nil)

      result = service.cache_listing_translations(
        listing_id,
        field_names,
        expected_result,
        '2021-07-01T00:00:00Z',
      )

      cache_object = {
        LastModifiedDate: '2021-07-01T00:00:00Z',
        hello_key: { EN: fields[0], ES: fields[0] },
        world_key: { EN: fields[1], ES: fields[1] },
        long_text_key: { EN: fields[2], ES: fields[2] },
      }

      expect(result).to eq(cache_object)
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
