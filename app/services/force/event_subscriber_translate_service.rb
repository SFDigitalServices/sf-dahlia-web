require 'restforce'
require 'faye'

module Force
  # Create an event subscription using restforce and faye
  class EventSubscriberTranslateService
    Event = Struct.new(
      :listing_id,
      :last_modified_date,
      :entity_name,
      :changed_fields,
      :replay_id,
      :updated_values,
      keyword_init: true,
    )

    UNSUBSCRIBE_CACHE_KEY = 'unsubscribe_from_listing_updates'.freeze

    def initialize
      setup_salesforce_client
      setup_faye_client
    end

    def listen_and_process_events
      EM.error_handler do |error|
        logger(
          "Error while listening for Salesforce Platform Events: #{error.message}; " \
          "Backtrace: #{error.backtrace[0..5]}",
          error: true,
        )
      end

      EM.run do
        # available methods for the subscription instance:
        #   https://www.rubydoc.info/github/eventmachine/eventmachine/EventMachine/Deferrable
        #   https://www.rubydoc.info/gems/faye/Faye/Subscription
        subscription = subscribe_to_listing_updates
        subscription.callback do
          Rails.logger.info('Subscribed to Salesforce Platform Events')
        end
        subscription.errback do |error|
          logger(
            "Error subscribing to Salesforce Platform Events: #{error.inspect}",
            error: true,
          )
        end
        EM.add_periodic_timer(10, proc { check_for_unsubscribe(subscription) })
      end
    end

    private

    def setup_salesforce_client
      @salesforce_client = Restforce.new(
        username: ENV.fetch('SALESFORCE_USERNAME', nil),
        password: ENV.fetch('SALESFORCE_PASSWORD', nil),
        instance_url: ENV.fetch('SALESFORCE_INSTANCE_URL', nil),
        host: ENV.fetch('SALESFORCE_HOST', nil),
        client_id: ENV.fetch('SALESFORCE_CLIENT_ID', nil),
        client_secret: ENV.fetch('SALESFORCE_CLIENT_SECRET', nil),
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
        logger(
          'New Salesforce event via /data/Listing__ChangeEvent: ' \
          "#{platform_event.inspect}",
        )
        event = parse_event(platform_event)
        translate_and_log_event(event)
      end
    end

    def translate_and_log_event(event)
      translations = translate_event_values(event.updated_values)
      logger(
        "Event Translations: #{translations.inspect}",
      )
    end

    def translate_event_values(values)
      translation_service = GoogleTranslationService.new(
        project_id: ENV.fetch('GOOGLE_PROJECT_ID', nil),
        key: ENV.fetch('GOOGLE_TRANSLATE_KEY', nil),
      )
      languages = %w[ES ZH TL]
      translation_service.translate(values.values, languages)
    end

    def parse_event(platform_event)
      header = platform_event.dig('payload', 'ChangeEventHeader')
      Event.new(
        listing_id: header['recordIds'].try(:first),
        last_modified_date: platform_event.dig('payload', 'LastModifiedDate'),
        entity_name: header['entityName'],
        changed_fields: header['changedFields'],
        replay_id: platform_event.dig('event', 'replayId'),
        updated_values: extract_updated_values(header['changedFields'], platform_event),
      )
    end

    def extract_updated_values(changed_fields, event)
      changed_fields.each_with_object({}) do |field, values|
        values[field] = event.dig('payload', field) unless field == 'LastModifiedDate'
      end
    end

    def check_for_unsubscribe(subscription)
      return unless Rails.cache.fetch(UNSUBSCRIBE_CACHE_KEY)

      subscription.unsubscribe
      Rails.cache.delete(UNSUBSCRIBE_CACHE_KEY)
      logger('Unsubscribed to Salesforce Platform Events')
      EM.stop_event_loop
    end

    def logger(message, error: false)
      if error
        Rails.logger.error("EventSubscriberTranslateService #{message}")
      else
        Rails.logger.info("EventSubscriberTranslateService #{message}")
      end
    end
  end
end
