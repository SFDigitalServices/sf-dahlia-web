require 'rails_helper'
require 'restforce'
require 'faye'
require 'ostruct'

describe Force::EventSubscriberTranslateService do
  let(:service) { Force::EventSubscriberTranslateService }
  let(:faye_client) { instance_double(Faye::Client) }
  let(:faye_subscription) { instance_double(Faye::Subscription) }
  let(:salesforce_client) { instance_double(Restforce::Client) }
  let(:request_client) { instance_double(Force::Request) }
  let(:salesforce_auth_obj) do
    OpenStruct.new(instance_url: 'test_url', access_token: 'test_token')
  end
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
        'Credit_Rating__c' => {
          'diff' =>
            "--- \n+++ 716e7fbcdb7de11a33487ab9e725acd742b2f79cacaf13e9e5bc48b6d09c85e8" \
            "\n@@ -1,1 +1,1 @@\n-Hello, world 2\n+Hello, world 3",
        },
      },
      'event' => { 'replayId' => 9_730_266 },
    }
  end
  let(:event_without_content) do
    {
      'payload' => {
        'ChangeEventHeader' => {
          'recordIds' => ['a0W4U00000KnjQuUAJ'],
          'entityName' => 'Listing__c',
          'changedFields' => %w[LastModifiedDate],
        },
        'LastModifiedDate' => '2024-06-29T19:09:24Z',
      },
      'event' => { 'replayId' => 9_730_266 },
    }
  end
  before do
    allow(Force::Request).to receive(:new).and_return(request_client)
    allow(request_client).to receive(:get).and_return(
      [
        { 'Credit_Rating' => 'Hello, world!' },
      ],
    )
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
  end

  describe '#listen_and_process_events when the GoogleCloudTranslate ff is enabled' do
    before do
      allow(Rails.configuration.unleash).to receive(:is_enabled?)
        .with('GoogleCloudTranslate')
        .and_return(true)
    end
    after do
      allow(Rails.configuration.unleash).to receive(:is_enabled?)
        .and_return(false)
    end

    describe 'when the service is initialized' do
      it 'initializes salesforce, faye client, and translation service' do
        expect(Restforce).to receive(:new).and_return(salesforce_client)
        expect(salesforce_client)
          .to receive(:authenticate!).and_return(salesforce_auth_obj)
        expect(Faye::Client).to receive(:new).and_return(faye_client)
        expect(faye_client).to receive(:set_header).with(
          'Authorization', "OAuth #{salesforce_auth_obj.access_token}"
        )
        expect(GoogleTranslationService).to receive(:new)
        service.new
      end
    end

    describe 'when listen_and_process_events is called' do
      it 'subscribes to and unsubscribes from Salesforce platform event channel' do
        EM.run do
          expect(faye_client).to receive(:subscribe).with('/data/Listing__ChangeEvent')
          expect(faye_subscription).to receive(:callback).and_yield
          expect(faye_subscription).to receive(:unsubscribe)
          expect(Rails.logger).to receive(:info).twice

          EM.add_timer(0.1) { EM.stop }

          service.new.listen_and_process_events
        end
      end
      it 'detects incoming events from Salesforce and calls translations service' do
        EM.run do
          expect(faye_client).to receive(:subscribe)
            .with('/data/Listing__ChangeEvent')
            .and_yield(event)
            .and_return(faye_subscription)
          expect(translation_service).to receive(:translate)
            .and_return([{ to: 'EN', translation: ['Hello World'] }])
          expect(translation_service).to receive(:cache_listing_translations)

          EM.add_timer(0.1) { EM.stop }

          service.new.listen_and_process_events
        end
      end
      it 'detects incoming events without content from Salesforce and calls translations service' do
        EM.run do
          expect(faye_client).to receive(:subscribe)
            .with('/data/Listing__ChangeEvent')
            .and_yield(event_without_content)
            .and_return(faye_subscription)
          expect(translation_service).not_to receive(:translate)
          expect(translation_service).to receive(:cache_listing_translations)

          EM.add_timer(0.1) { EM.stop }

          service.new.listen_and_process_events
        end
      end
    end
  end

  describe '#listen_and_process_events when the GoogleCloudTranslate ff is disabled' do
    # feature flag defaults to false
    describe 'when the service is initialized' do
      it 'initializes salesforce, faye client, and translation service' do
        expect(Restforce).to receive(:new).and_return(salesforce_client)
        expect(salesforce_client)
          .to receive(:authenticate!)
          .and_return(salesforce_auth_obj)
        expect(Faye::Client).to receive(:new).and_return(faye_client)
        expect(faye_client).to receive(:set_header).with(
          'Authorization', "OAuth #{salesforce_auth_obj.access_token}"
        )
        expect(GoogleTranslationService).to receive(:new)
        service.new
      end
    end

    describe 'when listen_and_process_events is called' do
      it 'does not subscribe to Salesforce platform event channel' do
        EM.run do
          expect(faye_client)
            .to_not receive(:subscribe).with('/data/Listing__ChangeEvent')

          EM.add_timer(0.1) { EM.stop }

          service.new.listen_and_process_events
        end
      end
    end
  end
end
