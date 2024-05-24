require 'restforce'
require 'faye'

module Force
  # Subsribe
  class StreamingSubscriberService
    # attr_reader :client

    def initialize
      @client = Restforce.new(username: ENV['SALESFORCE_USERNAME'],
                              password: ENV['SALESFORCE_PASSWORD'],
                              instance_url: ENV['SALESFORCE_INSTANCE_URL'],
                              host: ENV['SALESFORCE_HOST'],
                              client_id: ENV['SALESFORCE_CLIENT_ID'],
                              client_secret: ENV['SALESFORCE_CLIENT_SECRET'],
                              api_version: '26.0',
                              ssl: { verify_peer: true })
      puts 'Client Connected ', @client
    end

    def subscribe
      listing_update_topic = '/data/Listing__ChangeEvent'

      puts 'Trying to get ', listing_update_topic
      EM.run do
        # Subscribe to the PushTopic.
        @client.subscription listing_update_topic do |message|
          puts message.inspect
        end
      end
    end
  end
end
