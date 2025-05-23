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

    def initialize
      setup_salesforce_client
      setup_faye_client
      setup_translation_service
    end

    def listen_and_process_events
      subscription = nil

      EM.error_handler do |error|
        logger('Error while listening for Salesforce Platform Events', error)
      end

      EM.add_shutdown_hook do
        subscription&.unsubscribe
        logger(
          'Unsubscribed from Salesforce Platform Events due to EventMachine shutdown',
        )
      end

      EM.run do
        if Rails.configuration.unleash.is_enabled? 'GoogleCloudTranslate'
          subscription = subscribe_to_listing_updates
          subscription.callback do
            logger('Subscribed to Salesforce Platform Events')
          end
          subscription.errback do |error|
            logger('Error subscribing to Salesforce Platform Events', error)
          end
        else
          logger('GoogleCloudTranslate is disabled')
        end

        # cannot log in the trap block to improve observability,
        #  but we can rely on logs in EM.add_shutdown_hook
        Signal.trap('TERM') { EM.stop }
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
        api_version: ENV.fetch('SALESFORCE_API_VERSION', '43.0'),
      )
    end

    def setup_faye_client
      credentials = @salesforce_client.authenticate!
      @faye_client = Faye::Client.new(
        "#{credentials.instance_url}/cometd/" \
        "#{ENV.fetch('SALESFORCE_API_VERSION', '43.0')}/",
      )
      @faye_client.set_header('Authorization', "OAuth #{credentials.access_token}")
    end

    def setup_translation_service
      @translation_service = GoogleTranslationService.new
    end

    def subscribe_to_listing_updates
      @faye_client.subscribe('/data/Listing__ChangeEvent') do |platform_event|
        logger(
          "New Salesforce event via '/data/Listing__ChangeEvent': " \
          "#{platform_event.to_json}",
        )
        event = parse_event(platform_event)
        translate_and_cache(event)
      end
    end

    def translate_and_cache(event)
      if event.updated_values.blank?
        logger("No translations for event: #{event.to_json}")
        # we want to signal that the translations are still up-to-date,
        #  even when there is nothing to translate
        @translation_service.cache_listing_translations(
          event.listing_id, nil, [], event.last_modified_date
        )
        return []
      end

      translations = translate_event_values(event.listing_id, event.updated_values)
      translations.each do |target|
        next if target[:to] == 'EN'

        GoogleTranslationService.log_translations(
          msg: 'Translated text',
          caller_method: "#{self.class.name}##{__method__}",
          listing_id: event.listing_id,
          text: target[:translation],
        )
      end
      logger("Caching translations for event: #{event.to_json}")

      @translation_service.cache_listing_translations(
        event.listing_id,
        event.updated_values.keys,
        translations,
        event.last_modified_date,
      )
    end

    def process_event_values(listing_id, values)
      return [] unless values&.values

      listing = nil

      text_to_translate = []
      values.each do |key, value|
        if value.is_a?(String)
          text_to_translate.push(value)
        else
          if listing.nil?
            listing = Request.new(parse_response: true).get(
              "/ListingDetails/#{CGI.escape(listing_id)}",
            ).first
          end
          domain_key = ServiceHelper.convert_to_domain_field_name(key)
          text_to_translate.push(listing[domain_key])
        end
      end
      text_to_translate
    end

    def translate_event_values(listing_id, values)
      languages = %w[ES ZH TL]
      text_to_translate = process_event_values(listing_id, values)
      GoogleTranslationService.log_translations(
        msg: 'Text to translate',
        caller_method: "#{self.class.name}##{__method__}",
        listing_id:,
        text: text_to_translate,
        char_count: true,
      )
      @translation_service.translate(text_to_translate, languages)
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
      logger("Extracting updated values: #{changed_fields.to_json}")

      listing_field_names_salesforce = ServiceHelper.listing_field_names_salesforce
      filtered_fields = changed_fields.select do |field|
        listing_field_names_salesforce.include?(field)
      end

      filtered_fields.each_with_object({}) do |field, values|
        values[field] = event.dig('payload', field)
      end
    end

    def logger(message, error = nil)
      if error
        Rails.logger.error(
          "EventSubscriberTranslateService #{message}: #{error.try(:message)}, " \
          "backtrace: #{error.try(:backtrace)&.[](0..5)}",
        )
      else
        Rails.logger.info("EventSubscriberTranslateService #{message}")
      end
    end
  end
end
