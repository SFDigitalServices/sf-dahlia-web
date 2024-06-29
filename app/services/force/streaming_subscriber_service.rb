require 'restforce'
require 'faye'

module Force
  # Create an event subscription using restforce and faye
  class StreamingSubscriberService
    def initialize
      @client = Restforce.new(username: ENV['SALESFORCE_USERNAME'],
                              password: ENV['SALESFORCE_PASSWORD'],
                              instance_url: ENV['SALESFORCE_INSTANCE_URL'],
                              host: ENV['SALESFORCE_HOST'],
                              client_id: ENV['SALESFORCE_CLIENT_ID'],
                              client_secret: ENV['SALESFORCE_CLIENT_SECRET'],
                              api_version: '26.0')

      salesforce_credentials = @client.authenticate!

      server = salesforce_credentials.instance_url
      access_token  = salesforce_credentials.access_token
      token_type    = 'OAuth'

      @faye_client = Faye::Client.new("#{server}/cometd/31.0/")
      @faye_client.set_header('Authorization', "#{token_type} #{access_token}")
    end

    def subscribe
      listing_update_topic = '/data/Listing__ChangeEvent'

      EM.run do
        puts 'Waiting for Events...'
        @faye_client.subscribe listing_update_topic do |message|
          puts message.inspect
        end
      end
    end
  end
end
