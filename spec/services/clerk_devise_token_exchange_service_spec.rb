# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ClerkDeviseTokenExchangeService do
  let(:clerk_user_id) { 'user_abc123' }
  let(:email) { 'test@example.com' }

  before do
    allow(ClerkService).to receive(:email_address).with(clerk_user_id).and_return(email)
    allow(ClerkService).to receive(:salesforce_contact_id).with(clerk_user_id).and_return('003ABC')
    allow(Rails.logger).to receive(:info)
  end

  describe '.exchange!' do
    it 'creates a shadow user and returns Devise headers when no user exists' do
      expect do
        result = described_class.exchange!(clerk_user_id: clerk_user_id)

        expect(result[:user]).to be_present
        expect(result[:user].clerk_user_id).to eq(clerk_user_id)
        expect(result[:user].email).to eq(email)
        expect(result[:auth_headers]).to include('access-token', 'client', 'uid')
      end.to change(User, :count).by(1)
    end

    it 'links an existing user found by email and reuses it' do
      user = create(:user, email: email, uid: email, clerk_user_id: nil)

      result = described_class.exchange!(clerk_user_id: clerk_user_id)

      expect(result[:user].id).to eq(user.id)
      expect(user.reload.clerk_user_id).to eq(clerk_user_id)
    end

    it 'reuses an existing linked user' do
      user = create(:user, email: email, uid: email, clerk_user_id: clerk_user_id)

      result = described_class.exchange!(clerk_user_id: clerk_user_id)

      expect(result[:user].id).to eq(user.id)
      expect(result[:auth_headers]).to include('access-token', 'client', 'uid')
    end

    it 'raises MissingEmailError when Clerk email is missing' do
      allow(ClerkService).to receive(:email_address)
        .with(clerk_user_id)
        .and_raise(StandardError, 'User user_abc123 has no email address')

      expect do
        described_class.exchange!(clerk_user_id: clerk_user_id)
      end.to raise_error(described_class::MissingEmailError, 'User user_abc123 has no email address')
    end

    it 'raises LinkConflictError when email belongs to a different Clerk user' do
      create(:user, email: email, uid: email, clerk_user_id: 'user_other')

      expect do
        described_class.exchange!(clerk_user_id: clerk_user_id)
      end.to raise_error(described_class::LinkConflictError, /different Clerk user/)
    end

    it 'continues when Clerk Salesforce contact id is missing' do
      allow(ClerkService).to receive(:salesforce_contact_id)
        .with(clerk_user_id)
        .and_raise(StandardError, 'User user_abc123 has no Salesforce contact id')

      result = described_class.exchange!(clerk_user_id: clerk_user_id)

      expect(result[:user].salesforce_contact_id).to be_nil
    end
  end
end
