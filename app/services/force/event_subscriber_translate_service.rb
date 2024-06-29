require 'restforce'
require 'faye'

module Force
  class EventSubscriberTranslateService
    Event = Struct.new(:listing_id, :last_modified_date, :entity_name, :changed_fields,
                       :replay_id, :updated_values, keyword_init: true)

    def initialize
      setup_salesforce_client
      setup_faye_client
    end

    def listen_and_process_events
      EM.run do
        puts 'Listening for Salesforce Platform Events...'
        subscribe_to_listing_updates
      end
    end

    private

    def setup_salesforce_client
      @salesforce_client = Restforce.new(
        username: ENV['SALESFORCE_USERNAME'],
        password: ENV['SALESFORCE_PASSWORD'],
        instance_url: ENV['SALESFORCE_INSTANCE_URL'],
        host: ENV['SALESFORCE_HOST'],
        client_id: ENV['SALESFORCE_CLIENT_ID'],
        client_secret: ENV['SALESFORCE_CLIENT_SECRET'],
        api_version: '31.0',
      )
    end

    def setup_faye_client
      credentials = @salesforce_client.authenticate!
      @faye_client = Faye::Client.new("#{credentials.instance_url}/cometd/31.0/")
      @faye_client.set_header('Authorization', "OAuth #{credentials.access_token}")
    end

    def subscribe_to_listing_updates
      @faye_client.subscribe('/data/Listing__ChangeEvent') do |platform_event|
        event = parse_event(platform_event)
        translate_and_log_event(event)
      end
    end

    def translate_and_log_event(event)
      translations = translate_event_values(event.updated_values)
      puts "Event Translations: #{translations}"
    end

    def translate_event_values(values)
      translation_service = GoogleTranslationService.new(
        project_id: ENV['GOOGLE_PROJECT_ID'],
        key: ENV['GOOGLE_TRANSLATE_KEY'],
      )
      languages = %w[ES ZH TL]
      translation_service.translate(values.values, languages)
    end

    def parse_event(platform_event)
      header = platform_event['payload']['ChangeEventHeader']
      Event.new(
        listing_id: header['recordIds'].first,
        last_modified_date: platform_event['payload']['LastModifiedDate'],
        entity_name: header['entityName'],
        changed_fields: header['changedFields'],
        replay_id: platform_event['event']['replayId'],
        updated_values: extract_updated_values(header['changedFields'], platform_event),
      )
    end

    def extract_updated_values(changed_fields, event)
      changed_fields.each_with_object({}) do |field, values|
        values[field] = event['payload'][field] unless field == 'LastModifiedDate'
      end
    end
  end
end
