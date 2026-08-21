# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ClerkService do
  let(:user_id) { 'user_abc123' }
  let(:sdk) { instance_double(Clerk::SDK, users: users) }
  let(:users) { instance_double('ClerkUsers') }

  before do
    described_class.instance_variable_set(:@sdk, nil)
    allow(Clerk::SDK).to receive(:new).and_return(sdk)
  end

  after { described_class.instance_variable_set(:@sdk, nil) }

  describe ClerkService::User do
    subject(:clerk_user) { described_class.new(user_id) }

    describe '#email' do
      it 'returns the email from ClerkService' do
        allow(ClerkService).to receive(:email_address).with(user_id).and_return('a@example.com')

        expect(clerk_user.email).to eq('a@example.com')
        expect(clerk_user.email).to eq('a@example.com')
        expect(ClerkService).to have_received(:email_address).once
      end
    end

    describe '#salesforce_contact_id' do
      it 'returns the contact id from ClerkService and memoizes it' do
        allow(ClerkService).to receive(:salesforce_contact_id).with(user_id).and_return('003ABC')

        expect(clerk_user.salesforce_contact_id).to eq('003ABC')
        expect(clerk_user.salesforce_contact_id).to eq('003ABC')
        expect(ClerkService).to have_received(:salesforce_contact_id).once
      end

      it 'returns nil and logs when ClerkService raises' do
        allow(ClerkService).to receive(:salesforce_contact_id)
          .and_raise(StandardError, 'missing contact')
        allow(Rails.logger).to receive(:info)

        expect(clerk_user.salesforce_contact_id).to be_nil
        expect(Rails.logger).to have_received(:info).with(
          "Clerk user #{user_id} has no Salesforce contact ID: missing contact",
        )
      end
    end
  end

  describe '.email_address' do
    let(:email) { instance_double('ClerkEmail', email_address: 'a@example.com') }
    let(:user) { instance_double('ClerkUser', email_addresses: [email]) }

    it 'returns the first email address' do
      allow(users).to receive(:get).with(user_id: user_id)
        .and_return(instance_double('GetUserResponse', user: user))

      expect(described_class.email_address(user_id)).to eq('a@example.com')
    end

    it 'raises when the user is missing' do
      allow(users).to receive(:get).with(user_id: user_id)
        .and_return(instance_double('GetUserResponse', user: nil))

      expect { described_class.email_address(user_id) }
        .to raise_error(StandardError, "User #{user_id} is missing")
    end

    it 'raises when the Clerk response is missing' do
      allow(users).to receive(:get).with(user_id: user_id).and_return(nil)

      expect { described_class.email_address(user_id) }
        .to raise_error(StandardError, "User #{user_id} is missing")
    end

    it 'raises when the user has no email address' do
      user_without_email = instance_double('ClerkUser', email_addresses: [])
      allow(users).to receive(:get).with(user_id: user_id)
        .and_return(instance_double('GetUserResponse', user: user_without_email))

      expect { described_class.email_address(user_id) }
        .to raise_error(StandardError, "User #{user_id} has no email address")
    end

    it 'raises when email_addresses is nil' do
      user_without_email = instance_double('ClerkUser', email_addresses: nil)
      allow(users).to receive(:get).with(user_id: user_id)
        .and_return(instance_double('GetUserResponse', user: user_without_email))

      expect { described_class.email_address(user_id) }
        .to raise_error(StandardError, "User #{user_id} has no email address")
    end
  end

  describe '.store_salesforce_contact_id' do
    it 'updates private metadata and logs success' do
      contact_id = '003XYZ'
      allow(users).to receive(:update_metadata)
      allow(Rails.logger).to receive(:info)

      described_class.store_salesforce_contact_id(user_id, contact_id)

      expect(users).to have_received(:update_metadata) do |args|
        expect(args[:user_id]).to eq(user_id)
        expect(args[:body].private_metadata).to eq('salesforce_contact_id' => contact_id)
      end
      expect(Rails.logger).to have_received(:info)
        .with("Salesforce contact id stored for user #{user_id}")
    end
  end

  describe '.salesforce_contact_id' do
    it 'returns the contact id from private metadata' do
      user = instance_double(
        'ClerkUser',
        private_metadata: { 'salesforce_contact_id' => '003ABC' },
      )
      allow(users).to receive(:get).with(user_id: user_id)
        .and_return(instance_double('GetUserResponse', user: user))

      expect(described_class.salesforce_contact_id(user_id)).to eq('003ABC')
    end

    it 'raises when the user is missing' do
      allow(users).to receive(:get).with(user_id: user_id)
        .and_return(instance_double('GetUserResponse', user: nil))

      expect { described_class.salesforce_contact_id(user_id) }
        .to raise_error(StandardError, "User #{user_id} is missing")
    end

    it 'raises when the contact id is blank' do
      user = instance_double('ClerkUser', private_metadata: {})
      allow(users).to receive(:get).with(user_id: user_id)
        .and_return(instance_double('GetUserResponse', user: user))

      expect { described_class.salesforce_contact_id(user_id) }
        .to raise_error(StandardError, "User #{user_id} has no Salesforce contact id")
    end

    it 'raises when private metadata is blank' do
      user = instance_double('ClerkUser', private_metadata: nil)
      allow(users).to receive(:get).with(user_id: user_id)
        .and_return(instance_double('GetUserResponse', user: user))

      expect { described_class.salesforce_contact_id(user_id) }
        .to raise_error(StandardError, "User #{user_id} has no Salesforce contact id")
    end
  end
end
