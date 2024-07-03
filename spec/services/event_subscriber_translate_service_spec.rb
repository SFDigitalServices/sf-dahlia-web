require 'rails_helper'
require 'restforce'
require 'faye'
require 'ostruct'

describe Force::EventSubscriberTranslateService do
  let(:salesforce_client) { instance_double(Restforce::Client) }
  let(:salesforce_auth_obj) {
    OpenStruct.new(instance_url: 'test_url', access_token: 'test_token')
  }
  let(:faye_client) { instance_double(Faye::Client) }
  let(:faye_subscription) { instance_double(Faye::Subscription) }
  let(:cache) { instance_double(ActiveSupport::Cache::Store) }

  before do
    allow(Restforce).to receive(:new).and_return(salesforce_client)
    allow(salesforce_client).to receive(:authenticate!).and_return(salesforce_auth_obj)
    allow(Faye::Client).to receive(:new).and_return(faye_client)
    allow(faye_client).to receive(:set_header)
    allow(faye_client).to receive(:subscribe).and_return(faye_subscription)
    allow(faye_subscription).to receive(:callback)
    allow(faye_subscription).to receive(:errback)
    allow(faye_subscription).to receive(:unsubscribe)
    allow(Rails).to receive(:cache).and_return(cache)
    allow(cache).to receive(:fetch)
      .with(Force::EventSubscriberTranslateService::UNSUBSCRIBE_CACHE_KEY)
      .and_return(true)
    allow(cache).to receive(:delete)
  end

  describe '#listen_and_process_events' do
    it 'subscribes and unsubscribes to listing updates' do
      expect(faye_client).to receive(:set_header).with(
        'Authorization', "OAuth #{salesforce_auth_obj.access_token}"
      )
      expect(faye_client).to receive(:subscribe).with('/data/Listing__ChangeEvent')
      expect(faye_subscription).to receive(:unsubscribe)
      Force::EventSubscriberTranslateService.new.listen_and_process_events
    end

    # How to test subscription events? Maybe the Faye gem's test suite has clues:
    #   https://github.com/faye/faye/blob/master/spec/ruby/client_spec.rb
    # it 'detects events from Salesforce and translates changed fields' do
    #   Force::EventSubscriberTranslateService.new.listen_and_process_events
    # end
  end
end
