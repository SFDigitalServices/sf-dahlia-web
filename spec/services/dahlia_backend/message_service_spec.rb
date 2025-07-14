require 'rails_helper'

RSpec.describe DahliaBackend::MessageService do
  let(:client) { instance_double(DahliaBackend::ApiClient) }
  let(:listing_id) { 'listing-123' }
  let(:listing) do
    double('Listing', Name: 'Test Listing', Lottery_Date: '2024-07-01T00:00:00Z',
                      RecordType: Hashie::Mash.new(Name: 'Rental'),
                      Leasing_Agent_Name: 'John Doe', Leasing_Agent_Email: 'email', Leasing_Agent_Phone: '123-456-7890', Office_Hours: '9am-5pm')
  end
  let(:application_params) do
    {
      listingID: listing_id,
      primaryApplicant: { email: 'test@example.com' },
    }
  end
  let(:application_response) { { 'lotteryNumber' => 'A123' } }
  let(:formatted_date) { 'July  1, 2024' }
  let(:fields) do
    {
      email: 'test@example.com',
      listingId: listing_id,
      lotteryNumber: 'A123',
      listingName: 'Test Listing',
      lotteryDate: formatted_date,
    }
  end

  before do
    allow(Rails.configuration).to receive_message_chain(:unleash,
                                                        :is_enabled?).and_return(true)
    allow(Force::ListingService).to receive(:listing).with(listing_id).and_return(listing)
    allow(Hashie::Mash).to receive(:new).and_return(listing)
    allow(Time.zone).to receive(:parse).and_return(Time.parse(listing.Lottery_Date))
  end

  describe '.service_enabled?' do
    it 'returns true when feature flag is enabled' do
      expect(described_class.service_enabled?).to be true
    end

    it 'returns false when feature flag is disabled' do
      allow(Rails.configuration.unleash).to receive(:is_enabled?).and_return(false)
      expect(described_class.service_enabled?).to be false
    end
  end

  describe '.send_application_confirmation' do
    it 'delegates to instance method' do
      expect_any_instance_of(described_class).to receive(:send_application_confirmation)
        .with(application_params, application_response, 'en')
      described_class.send_application_confirmation(application_params,
                                                    application_response, 'en')
    end
  end

  describe '#initialize' do
    it 'uses provided client' do
      service = described_class.new(client)
      expect(service.client).to eq(client)
    end

    it 'creates a new client when none provided' do
      expect(DahliaBackend::ApiClient).to receive(:new).and_return(client)
      service = described_class.new
      expect(service.client).to eq(client)
    end
  end

  describe '#send_application_confirmation' do
    subject { described_class.new(client) }

    context 'when service is disabled' do
      before do
        allow(Rails.configuration.unleash).to receive(:is_enabled?).and_return(false)
      end

      it 'does not send a message' do
        expect(client).not_to receive(:post)
        expect(subject.send_application_confirmation(application_params,
                                                     application_response)).to be_nil
      end
    end

    context 'with invalid params' do
      it 'returns nil if application_params missing' do
        expect(subject.send_application_confirmation(nil, application_response)).to be_nil
      end

      it 'returns nil if application_response missing' do
        expect(subject.send_application_confirmation(application_params, nil)).to be_nil
      end

      it 'returns nil if listingID missing' do
        params = application_params.dup
        params.delete(:listingID)
        expect(subject.send_application_confirmation(params,
                                                     application_response)).to be_nil
      end

      it 'returns nil if email missing' do
        params = application_params.dup
        params[:primaryApplicant].delete(:email)
        expect(subject.send_application_confirmation(params,
                                                     application_response)).to be_nil
      end
    end

    context 'when listing fetch fails' do
      it 'returns nil' do
        allow(Force::ListingService).to receive(:listing).and_return(nil)
        expect(subject.send_application_confirmation(application_params,
                                                     application_response)).to be_nil
      end

      it 'handles exceptions when fetching listing' do
        allow(Force::ListingService).to receive(:listing).and_raise(StandardError.new('API error'))
        expect(Rails.logger).to receive(:error).with('[DahliaBackend::MessageService:log_error] Error fetching listing listing-123: StandardError API error')
        expect(subject.send_application_confirmation(application_params,
                                                     application_response)).to be_nil
      end
    end

    context 'when date formatting fails' do
      it 'uses raw date string and continues' do
        allow(Time.zone).to receive(:parse).and_raise(ArgumentError.new('invalid date'))
        expect(Rails.logger).to receive(:warn).with(/Error parsing date: invalid date/)
        expect(client).to receive(:post).and_return('ok')
        expect(subject.send_application_confirmation(application_params,
                                                     application_response)).to eq('ok')
      end
    end

    context 'with valid params' do
      it 'sends a message and returns response' do
        expect(client).to receive(:post).with('/messages/application-submission',
                                              hash_including(email: 'test@example.com')).and_return('ok')
        expect(subject.send_application_confirmation(application_params,
                                                     application_response)).to eq('ok')
      end

      it 'returns nil and logs error if client.post fails' do
        expect(client).to receive(:post).and_return(nil)
        expect(Rails.logger).to receive(:error).with(/Failed to send message/)
        expect(subject.send_application_confirmation(application_params,
                                                     application_response)).to be_nil
      end

      it 'rescues and logs StandardError' do
        allow(client).to receive(:post).and_raise(StandardError.new('fail'))
        expect(Rails.logger).to receive(:error).with(/Error sending confirmation: StandardError fail/)
        expect(subject.send_application_confirmation(application_params,
                                                     application_response)).to be_nil
      end
    end
  end
end
