require 'rails_helper'

RSpec.describe DahliaBackend::MessageService do
  let(:client) { instance_double(DahliaBackend::ApiClient) }
  let(:service) { described_class.new(client) }

  let(:listing_id) { 'listing123' }
  let(:application_number) { 'APP123456' }
  let(:email) { 'test@example.com' }

  let(:listing_data) do
    {
      'Id' => listing_id,
      'Name' => 'Test Listing',
      'Address__c' => '123 Main St',
      'Neighborhood__c' => 'Downtown',
      'Lottery_Date' => '2024-12-31T10:00:00.000Z',
      'Leasing_Agent_Name' => 'John Doe',
      'Leasing_Agent_Email' => 'agent@example.com',
      'Leasing_Agent_Phone' => '555-1234',
      'Office_Hours' => '9-5 M-F',
      'RecordType' => { 'Name' => 'Rental' },
    }
  end

  let(:application_params) do
    {
      listingID: listing_id,
      primaryApplicant: {
        email: email,
        firstName: 'Test',
        lastName: 'User',
      },
    }
  end

  let(:application_response) do
    {
      'lotteryNumber' => '12345',
    }
  end

  let(:application_data) do
    {
      'primaryApplicant' => {
        'firstName' => 'John',
        'email' => 'john@example.com',
      },
      'alternateContact' => {
        'firstName' => 'Jane',
        'email' => 'jane@example.com',
      },
      'lotteryNumber' => '54321',
    }
  end

  before do
    allow(Rails.logger).to receive(:info)
    allow(Rails.logger).to receive(:warn)
    allow(Rails.logger).to receive(:error)
    allow(Force::ListingService).to receive(:listing).and_return(listing_data)
    allow(Force::ShortFormService).to receive(:get).and_return(application_data)
  end

  describe '.send_application_confirmation' do
    it 'creates a new instance and calls the instance method' do
      expect_any_instance_of(described_class).to receive(:send_application_confirmation)
        .with(application_params, application_response, 'en')

      described_class.send_application_confirmation(application_params,
                                                    application_response)
    end
  end

  describe '.send_invite_to_apply_response' do
    it 'creates a new instance and calls the instance method' do
      expect_any_instance_of(described_class).to receive(:send_invite_to_apply_response)
        .with('2024-12-31', application_number, 'yes', listing_id, nil)

      described_class.send_invite_to_apply_response('2024-12-31', application_number,
                                                    'yes', listing_id)
    end
  end

  describe '#send_application_confirmation' do
    context 'with valid parameters' do
      before do
        allow(client).to receive(:post).and_return({ success: true })
      end

      it 'sends the confirmation message' do
        expect(client).to receive(:post).with('/messages/application-submission', hash_including(
                                                                                    email: email,
                                                                                    listingId: listing_id,
                                                                                    lotteryNumber: '12345',
                                                                                    listingName: 'Test Listing',
                                                                                    isRental: true,
                                                                                    lang: 'en',
                                                                                  ))

        service.send_application_confirmation(application_params, application_response)
      end

      it 'formats the lottery date correctly' do
        expect(client).to receive(:post).with('/messages/application-submission', hash_including(
                                                                                    lotteryDate: '2024-12-31',
                                                                                  ))

        service.send_application_confirmation(application_params, application_response)
      end

      it 'includes leasing agent information' do
        expect(client).to receive(:post).with('/messages/application-submission', hash_including(
                                                                                    leasingAgent: {
                                                                                      name: 'John Doe',
                                                                                      email: 'agent@example.com',
                                                                                      phone: '555-1234',
                                                                                      officeHours: '9-5 M-F',
                                                                                    },
                                                                                  ))

        service.send_application_confirmation(application_params, application_response)
      end

      it 'uses the provided locale' do
        expect(client).to receive(:post).with('/messages/application-submission', hash_including(
                                                                                    lang: 'es',
                                                                                  ))

        service.send_application_confirmation(application_params, application_response,
                                              'es')
      end

      it 'determines rental type correctly for sales' do
        listing_data['RecordType']['Name'] = 'Sale'

        expect(client).to receive(:post).with('/messages/application-submission', hash_including(
                                                                                    isRental: false,
                                                                                  ))

        service.send_application_confirmation(application_params, application_response)
      end
    end

    context 'with invalid parameters' do
      it 'returns nil when application_params is nil' do
        result = service.send_application_confirmation(nil, application_response)
        expect(result).to be_nil
      end

      it 'returns nil when application_response is nil' do
        result = service.send_application_confirmation(application_params, nil)
        expect(result).to be_nil
      end

      it 'returns nil when listingID is missing' do
        application_params.delete(:listingID)
        result = service.send_application_confirmation(application_params,
                                                       application_response)
        expect(result).to be_nil
      end

      it 'returns nil when email is missing' do
        application_params[:primaryApplicant].delete(:email)
        result = service.send_application_confirmation(application_params,
                                                       application_response)
        expect(result).to be_nil
      end
    end

    context 'when listing cannot be fetched' do
      before do
        allow(Force::ListingService).to receive(:listing).and_return(nil)
      end

      it 'returns nil' do
        result = service.send_application_confirmation(application_params,
                                                       application_response)
        expect(result).to be_nil
      end
    end

    context 'when an error occurs' do
      before do
        allow(Force::ListingService).to receive(:listing).and_raise(StandardError,
                                                                    'API Error')
      end

      it 'logs the error and returns nil' do
        expect(Rails.logger).to receive(:error).with(/Error fetching listing.*API Error/)

        result = service.send_application_confirmation(application_params,
                                                       application_response)
        expect(result).to be_nil
      end
    end

    context 'with missing lottery date' do
      before do
        listing_data['Lottery_Date'] = nil
        allow(client).to receive(:post).and_return({ success: true })
      end

      it 'sends message with empty lottery date' do
        expect(client).to receive(:post).with('/messages/application-submission', hash_including(
                                                                                    lotteryDate: '',
                                                                                  ))

        service.send_application_confirmation(application_params, application_response)
      end
    end

    context 'with invalid lottery date format' do
      before do
        listing_data['Lottery_Date'] = 'invalid-date'
        allow(client).to receive(:post).and_return({ success: true })
      end

      it 'uses original date string when parsing fails' do
        expect(client).to receive(:post).with('/messages/application-submission', hash_including(
                                                                                    lotteryDate: 'invalid-date',
                                                                                  ))

        service.send_application_confirmation(application_params, application_response)
      end
    end
  end

  describe '#send_invite_to_apply_response' do
    let(:deadline) { '2024-12-31' }
    let(:response_type) { 'yes' }

    context 'with valid parameters' do
      before do
        allow(client).to receive(:post).and_return({ success: true })
      end

      it 'sends the invite response for "yes"' do
        expect(client).to receive(:post).with('/messages/invite-to-apply/response/yes', hash_including(
                                                                                          listingId: listing_id,
                                                                                          listingName: 'Test Listing',
                                                                                          deadlineDate: deadline,
                                                                                        ))

        service.send_invite_to_apply_response(deadline, application_number, 'yes',
                                              listing_id)
      end

      it 'sends the invite response for "no"' do
        expect(client).to receive(:post).with('/messages/invite-to-apply/response/no',
                                              anything)

        service.send_invite_to_apply_response(deadline, application_number, 'no',
                                              listing_id)
      end

      it 'sends the invite response for "contact"' do
        expect(client).to receive(:post).with(
          '/messages/invite-to-apply/response/contact', anything
        )

        service.send_invite_to_apply_response(deadline, application_number, 'contact',
                                              listing_id)
      end

      it 'includes applicant information' do
        expect(client).to receive(:post).with(anything, hash_including(
                                                          applicants: [{
                                                            lotteryNumber: '54321',
                                                            applicationNumber: application_number,
                                                            primaryContact: {
                                                              firstName: 'John',
                                                              email: 'john@example.com',
                                                            },
                                                            alternateContact: {
                                                              firstName: 'Jane',
                                                              email: 'jane@example.com',
                                                            },
                                                          }],
                                                        ))

        service.send_invite_to_apply_response(deadline, application_number, 'yes',
                                              listing_id)
      end

      it 'includes listing details' do
        expect(client).to receive(:post).with(anything, hash_including(
                                                          listingAddress: '123 Main St',
                                                          listingNeighborhood: 'Downtown',
                                                        ))

        service.send_invite_to_apply_response(deadline, application_number, 'yes',
                                              listing_id)
      end
    end

    context 'with invalid response type' do
      it 'returns nil for invalid response' do
        result = service.send_invite_to_apply_response(deadline, application_number,
                                                       'invalid', listing_id)
        expect(result).to be_nil
      end
    end

    context 'when application cannot be fetched' do
      before do
        allow(Force::ShortFormService).to receive(:get).and_return(nil)
      end

      it 'returns nil' do
        result = service.send_invite_to_apply_response(deadline, application_number,
                                                       'yes', listing_id)
        expect(result).to be_nil
      end
    end

    context 'when listing cannot be fetched' do
      before do
        allow(Force::ListingService).to receive(:listing).and_return(nil)
      end

      it 'returns nil' do
        result = service.send_invite_to_apply_response(deadline, application_number,
                                                       'yes', listing_id)
        expect(result).to be_nil
      end
    end

    context 'when an error occurs' do
      before do
        allow(Force::ShortFormService).to receive(:get).and_raise(StandardError,
                                                                  'Service Error')
      end

      it 'returns nil' do
        result = service.send_invite_to_apply_response(deadline, application_number,
                                                       'yes', listing_id)
        expect(result).to be_nil
      end
    end
  end

  describe '#get_invite_to_apply_response_endpoint' do
    it 'returns correct endpoint for "yes" response' do
      endpoint = service.get_invite_to_apply_response_endpoint('yes')
      expect(endpoint).to eq('/messages/invite-to-apply/response/yes')
    end

    it 'returns correct endpoint for "no" response' do
      endpoint = service.get_invite_to_apply_response_endpoint('no')
      expect(endpoint).to eq('/messages/invite-to-apply/response/no')
    end

    it 'returns correct endpoint for "contact" response' do
      endpoint = service.get_invite_to_apply_response_endpoint('contact')
      expect(endpoint).to eq('/messages/invite-to-apply/response/contact')
    end

    it 'returns nil for invalid response' do
      endpoint = service.get_invite_to_apply_response_endpoint('invalid')
      expect(endpoint).to be_nil
    end
  end
end
