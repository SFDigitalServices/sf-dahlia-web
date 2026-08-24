# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ClerkService do
  let(:user_id) { 'user_abc123' }
  let(:sdk) { instance_double(Clerk::SDK) }
  let(:users_api) { instance_double(Clerk::Users) }

  before do
    described_class.instance_variable_set(:@sdk, nil)
    allow(Clerk::SDK).to receive(:new).and_return(sdk)
    allow(sdk).to receive(:users).and_return(users_api)
    allow(Rails.logger).to receive(:info)
  end

  after do
    described_class.instance_variable_set(:@sdk, nil)
  end

  describe ClerkService::User do
    subject(:user) { described_class.new(user_id) }

    describe '#id' do
      it 'returns the Clerk user id' do
        expect(user.id).to eq(user_id)
      end
    end

    describe '#email' do
      it 'returns the email from Clerk and memoizes it' do
        allow(ClerkService).to receive(:email_address)
          .with(user_id)
          .and_return('test@example.com')

        expect(user.email).to eq('test@example.com')
        expect(user.email).to eq('test@example.com')
        expect(ClerkService).to have_received(:email_address).once
      end
    end

    describe '#salesforce_contact_id' do
      it 'returns the Salesforce contact id from Clerk and memoizes it' do
        allow(ClerkService).to receive(:salesforce_contact_id)
          .with(user_id)
          .and_return('003ABC')

        expect(user.salesforce_contact_id).to eq('003ABC')
        expect(user.salesforce_contact_id).to eq('003ABC')
        expect(ClerkService).to have_received(:salesforce_contact_id).once
      end

      it 'errors when Clerk has no contact id' do
        allow(ClerkService).to receive(:salesforce_contact_id)
          .and_raise(StandardError, 'User has no Salesforce contact id')

        expect(user.salesforce_contact_id).to be_nil
        expect(Rails.logger).to have_received(:info).with(
          "Clerk user #{user_id} has no Salesforce contact ID: " \
          'User has no Salesforce contact id',
        )
      end
    end
  end

  describe '.email_address' do
    let(:email_record) do
      instance_double(
        Clerk::Models::Components::EmailAddress,
        email_address: 'test@example.com',
      )
    end
    let(:clerk_user) do
      instance_double(
        Clerk::Models::Components::User,
        email_addresses: [email_record],
      )
    end
    let(:get_response) do
      instance_double(Clerk::Models::Operations::GetUserResponse, user: clerk_user)
    end

    before do
      allow(users_api).to receive(:get).with(user_id: user_id).and_return(get_response)
    end

    it 'returns the email address' do
      expect(described_class.email_address(user_id)).to eq('test@example.com')
    end

    it 'errors when the Clerk user is missing' do
      allow(users_api).to receive(:get).and_return(nil)

      expect { described_class.email_address(user_id) }
        .to raise_error(StandardError, "User #{user_id} is missing")
    end

    it 'errors when the Clerk response has no user' do
      allow(get_response).to receive(:user).and_return(nil)

      expect { described_class.email_address(user_id) }
        .to raise_error(StandardError, "User #{user_id} is missing")
    end

    it 'errors when the user has no email address' do
      allow(clerk_user).to receive(:email_addresses).and_return([])

      expect { described_class.email_address(user_id) }
        .to raise_error(StandardError, "User #{user_id} has no email address")
    end

    it 'errors when email_addresses is nil' do
      allow(clerk_user).to receive(:email_addresses).and_return(nil)

      expect { described_class.email_address(user_id) }
        .to raise_error(StandardError, "User #{user_id} has no email address")
    end
  end

  describe '.store_salesforce_contact_id' do
    let(:contact_id) { '003ABC' }
    let(:expected_body) do
      Clerk::Models::Operations::UpdateUserMetadataRequestBody.new(
        private_metadata: { 'salesforce_contact_id' => contact_id },
      )
    end

    before do
      allow(users_api).to receive(:update_metadata)
    end

    it 'stores the contact id in Clerk private metadata' do
      described_class.store_salesforce_contact_id(user_id, contact_id)

      expect(users_api).to have_received(:update_metadata).with(
        user_id: user_id,
        body: expected_body,
      )
    end

    it 'logs that the contact id was stored' do
      described_class.store_salesforce_contact_id(user_id, contact_id)

      expect(Rails.logger).to have_received(:info).with(
        "Salesforce contact id stored for user #{user_id}",
      )
    end
  end

  describe '.salesforce_contact_id' do
    let(:clerk_user) do
      instance_double(
        Clerk::Models::Components::User,
        private_metadata: { 'salesforce_contact_id' => '003ABC' },
      )
    end
    let(:get_response) do
      instance_double(Clerk::Models::Operations::GetUserResponse, user: clerk_user)
    end

    before do
      allow(users_api).to receive(:get).with(user_id: user_id).and_return(get_response)
    end

    it 'returns the Salesforce contact id from private metadata' do
      expect(described_class.salesforce_contact_id(user_id)).to eq('003ABC')
    end

    it 'errors when the Clerk user is missing' do
      allow(users_api).to receive(:get).and_return(nil)

      expect { described_class.salesforce_contact_id(user_id) }
        .to raise_error(StandardError, "User #{user_id} is missing")
    end

    it 'errors when private metadata has no contact id' do
      allow(clerk_user).to receive(:private_metadata).and_return({})

      expect { described_class.salesforce_contact_id(user_id) }
        .to raise_error(StandardError, "User #{user_id} has no Salesforce contact id")
    end

    it 'errors when private metadata is missing' do
      allow(clerk_user).to receive(:private_metadata).and_return(nil)

      expect { described_class.salesforce_contact_id(user_id) }
        .to raise_error(StandardError, "User #{user_id} has no Salesforce contact id")
    end
  end
end
