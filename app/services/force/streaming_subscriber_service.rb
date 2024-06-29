require 'restforce'
require 'faye'

module Force
  # Create an event subscription using restforce and faye
  # Deprecated in favor of EventSubscriberTranslateService, will remove
  class StreamingSubscriberService
    Event = Struct.new(:listingId, :last_modified_date, :entity_name, :changedFields,
                       :replayId, :updated_values, keyword_init: true)

    def initialize
      @client = Restforce.new(username: ENV['SALESFORCE_USERNAME'],
                              password: ENV['SALESFORCE_PASSWORD'],
                              instance_url: ENV['SALESFORCE_INSTANCE_URL'],
                              host: ENV['SALESFORCE_HOST'],
                              client_id: ENV['SALESFORCE_CLIENT_ID'],
                              client_secret: ENV['SALESFORCE_CLIENT_SECRET'],
                              api_version: '31.0')

      salesforce_credentials = @client.authenticate!

      server = salesforce_credentials.instance_url
      access_token  = salesforce_credentials.access_token
      token_type    = 'OAuth'

      @faye_client = Faye::Client.new("#{server}/cometd/31.0/")
      @faye_client.set_header('Authorization', "#{token_type} #{access_token}")
    end

    def listen_and_process_events
      listing_update_topic = '/data/Listing__ChangeEvent'

      EM.run do
        puts 'Waiting for Events...'
        @faye_client.subscribe listing_update_topic do |platform_event|
          translate_event_fields(parse_event(platform_event))
        end
      end
    end

    private

    def translate_event_fields(event)
      translation_service = GoogleTranslationService.new(
        project_id: ENV['GOOGLE_PROJECT_ID'],
        key: ENV['GOOGLE_TRANSLATE_KEY'],
      )
      languages = %w[ES ZH TL]

      translations = translation_service.translate(
        values_to_translate(event.updated_values), languages
      )
      puts "Translations #{translations}"
    end

    def values_to_translate(values)
      values.values
    end

    def parse_event(event)
      listing_id = event['payload']['ChangeEventHeader']['recordIds'].first || undefined
      last_modified_date = event['payload']['LastModifiedDate']
      entity_name = event['payload']['ChangeEventHeader']['entityName']
      changed_fields = event['payload']['ChangeEventHeader']['changedFields']
      replay_id = event['event']['replayId']

      Force::StreamingSubscriberService::Event.new(
        listingId: listing_id,
        last_modified_date:,
        entity_name:,
        changedFields: changed_fields,
        replayId: replay_id,
        updated_values: updated_fields(changed_fields, event),
      )
    end

    def updated_fields(changed_fields, event)
      values = {}
      changed_fields.each do |field|
        field_value = event['payload'][field]
        values[field] = field_value
      end
      values
    end
  end
end
