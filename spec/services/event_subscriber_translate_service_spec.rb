require 'rails_helper'
require 'restforce'
require 'faye'
require 'ostruct'

describe Force::EventSubscriberTranslateService do
  describe '#listen_and_process_events' do
    let(:service) { Force::EventSubscriberTranslateService }
    let(:faye_client) { instance_double(Faye::Client) }
    let(:faye_subscription) { instance_double(Faye::Subscription) }
    let(:salesforce_client) { instance_double(Restforce::Client) }
    let(:salesforce_auth_obj) do
      OpenStruct.new(instance_url: 'test_url', access_token: 'test_token')
    end
    let(:cache) { instance_double(ActiveSupport::Cache::Store) }
    let(:translation_service) { instance_double(GoogleTranslationService) }

    let(:event) do
      {
        'payload' => {
          'ChangeEventHeader' => {
            'recordIds' => ['a0W4U00000KnjQuUAJ'],
            'entityName' => 'Listing__c',
            'changedFields' => %w[Name Credit_Rating__c LastModifiedDate],
          },
          'LastModifiedDate' => '2024-06-29T19:09:24Z',
          'Name' => '1075 Market St Unit 206 Update 3',
          'Credit_Rating__c' => 'Test update again, again',
        },
        'event' => { 'replayId' => 9_730_266 },
      }
    end
    let(:event_obj) do
      OpenStruct.new(
        listing_id: 'a0W4U00000KnjQuUAJ',
        last_modified_date: '2024-06-29T19:09:24Z',
        entity_name: 'Listing__c',
        changed_fields: %w[Name Credit_Rating__c LastModifiedDate],
        replay_id: 9_730_266,
        updated_values: {},
      )
    end
    before do
      allow(Restforce).to receive(:new).and_return(salesforce_client)
      allow(salesforce_client).to receive(:authenticate!).and_return(salesforce_auth_obj)
      allow(Faye::Client).to receive(:new).and_return(faye_client)
      allow(faye_client).to receive(:set_header)
      allow(faye_client).to receive(:subscribe).and_return(faye_subscription)
      allow(faye_subscription).to receive(:callback)
      allow(faye_subscription).to receive(:errback)
      allow(faye_subscription).to receive(:unsubscribe)
      allow(GoogleTranslationService).to receive(:new).and_return(translation_service)
      allow(translation_service).to receive(:translate).and_return([])
      allow(Rails).to receive(:cache).and_return(cache)
      allow(cache).to receive(:fetch)
        .with(Force::EventSubscriberTranslateService::UNSUBSCRIBE_CACHE_KEY)
        .and_return(true)
      allow(cache).to receive(:delete)
    end

    describe 'when the service is initialized' do
      it 'initializes salesforce and faye client' do
        expect(Restforce).to receive(:new).and_return(salesforce_client)
        expect(salesforce_client).to receive(:authenticate!).and_return(salesforce_auth_obj)
        expect(Faye::Client).to receive(:new).and_return(faye_client)
        expect(faye_client).to receive(:set_header).with(
          'Authorization', "OAuth #{salesforce_auth_obj.access_token}"
        )
        service.new
      end
    end
    describe 'when listen_and_process_events is called' do
      it 'subscribes and unsubscribes to Salesforce platform event channel' do
        expect(faye_client).to receive(:subscribe).with('/data/Listing__ChangeEvent')
        expect(faye_subscription).to receive(:unsubscribe)
        service.new.listen_and_process_events
      end
      it 'detects incoming events from Salesforce and calls translations service' do
        EM.run do
          expect(faye_client).to receive(:subscribe).with('/data/Listing__ChangeEvent').and_yield(event)
          expect(translation_service).to receive(:translate).and_return(['Hello World'])
          expect(translation_service).to receive(:cache_listing_translations)

          EM.add_timer(0.1) { EM.stop }

          service.new.listen_and_process_events
        end
      end
    end
  end
end
