Event = Struct.new(
  :listing_id,
  :last_modified_date,
  :entity_name,
  :changed_fields,
  :replay_id,
  :updated_values,
  keyword_init: true,
)

namespace :translate_test do # rubocop:disable Metrics/BlockLength
  desc 'Testing Translation Service'
  task translate: :environment do
    fields = %w[hello world]
    languages = %w[ES ZH TL]
    translation_service = GoogleTranslationService.new(
      project_id: ENV.fetch('GOOGLE_PROJECT_ID', nil),
      key: ENV.fetch('GOOGLE_TRANSLATE_KEY', nil),
    )
    translations = translation_service.translate(fields, languages)
    Rails.logger.info("Test translation results #{translations}")
  end

  task cache: :environment do
    translation_service = GoogleTranslationService.new(
      project_id: ENV.fetch('GOOGLE_PROJECT_ID', nil),
      key: ENV.fetch('GOOGLE_TRANSLATE_KEY', nil),
    )

    # this is to mimic how the subscriber service will work
    event = Event.new(
      listing_id: 'a0W4U00000KnjQuUAJ',
      last_modified_date: '2024-06-29T19:09:24Z',
      entity_name: 'Listing__c',
      changed_fields: %w[Name Credit_Rating__c LastModifiedDate],
      replay_id: 9_730_266,
      updated_values: { 'Name' => '1075 Market St Unit 206 Update 3',
                        'Credit_Rating__c' => 'Test update again, again' },
    )

    languages = %w[ES ZH TL]
    translations = translation_service.translate(event.updated_values.values,
                                                 languages)

    response = translation_service.cache_listing_translations(
      event.listing_id,
      event.updated_values.keys,
      translations,
    )
    puts response
  end

  task subscribe: :environment do
    subscriber = Force::EventSubscriberTranslateService.new
    subscriber.listen_and_process_events
  end
  task unsubscribe: :environment do
    Rails.cache.write(Force::EventSubscriberTranslateService::UNSUBSCRIBE_CACHE_KEY, true)
  end
end
