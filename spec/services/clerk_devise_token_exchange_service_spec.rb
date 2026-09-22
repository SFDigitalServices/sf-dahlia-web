# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ClerkDeviseTokenExchangeService do
  let(:clerk_user_id) { 'user_abc123' }
  let(:email) { 'test@example.com' }
  let(:salesforce_contact_id) { '003ABC' }

  before do
    allow(ClerkService).to receive(:email_address).with(clerk_user_id).and_return(email)
    allow(ClerkService).to receive(:salesforce_contact_id)
      .with(clerk_user_id)
      .and_return(salesforce_contact_id)
    allow(Rails.logger).to receive(:info)
  end

  describe '.exchange_token!' do
    it 'creates a shadow user and returns Devise headers when no user exists' do
      expect do
        result = described_class.exchange_token!(clerk_user_id: clerk_user_id)

        expect(result[:user]).to be_present
        expect(result[:user].clerk_user_id).to eq(clerk_user_id)
        expect(result[:user].email).to eq(email)
        expect(result[:user].salesforce_contact_id).to eq(salesforce_contact_id)
        expect(result[:auth_headers]).to include('access-token', 'client', 'uid')
      end.to change(User, :count).by(1)
    end

    it 'links an existing user found by Salesforce contact id and reuses it' do
      user = create(
        :user,
        email: 'old-email@example.com',
        uid: 'old-email@example.com',
        salesforce_contact_id: salesforce_contact_id,
        clerk_user_id: nil,
      )

      result = described_class.exchange_token!(clerk_user_id: clerk_user_id)

      expect(result[:user].id).to eq(user.id)
      expect(user.reload.clerk_user_id).to eq(clerk_user_id)
      expect(user.email).to eq('old-email@example.com')
      expect(user.unconfirmed_email).to eq(email)
    end

    it 'reuses an existing linked user' do
      user = create(
        :user,
        email: email,
        uid: email,
        clerk_user_id: clerk_user_id,
        salesforce_contact_id: salesforce_contact_id,
      )

      result = described_class.exchange_token!(clerk_user_id: clerk_user_id)

      expect(result[:user].id).to eq(user.id)
      expect(result[:auth_headers]).to include('access-token', 'client', 'uid')
    end

    it 'raises MissingClerkUserIdError when Clerk user id is missing' do
      expect do
        described_class.exchange_token!(clerk_user_id: nil)
      end.to raise_error(described_class::MissingClerkUserIdError, 'Missing Clerk user ID')
    end

    it 'raises StandardError when Clerk email lookup fails' do
      allow(ClerkService).to receive(:email_address)
        .with(clerk_user_id)
        .and_raise(StandardError, 'User user_abc123 has no email address')

      expect do
        described_class.exchange_token!(clerk_user_id: clerk_user_id)
      end.to raise_error(StandardError, 'User user_abc123 has no email address')
    end

    it 'raises StandardError when Clerk Salesforce contact id lookup fails' do
      allow(ClerkService).to receive(:salesforce_contact_id)
        .with(clerk_user_id)
        .and_raise(StandardError, 'User user_abc123 has no Salesforce contact id')

      expect do
        described_class.exchange_token!(clerk_user_id: clerk_user_id)
      end.to raise_error(StandardError, 'User user_abc123 has no Salesforce contact id')
    end

    it 'raises DeviseClerkUserConflictError when matching Salesforce contact id has a different Clerk user id' do
      create(
        :user,
        email: email,
        uid: email,
        clerk_user_id: 'user_other',
        salesforce_contact_id: salesforce_contact_id,
      )

      expect do
        described_class.exchange_token!(clerk_user_id: clerk_user_id)
      end.to raise_error(described_class::DeviseClerkUserConflictError, /Clerk User ID conflict/)
    end

    it 'raises MissingSalesforceContactIdError when existing linked user is missing a Salesforce contact id' do
      create(
        :user,
        email: email,
        uid: email,
        clerk_user_id: clerk_user_id,
        salesforce_contact_id: nil,
      )

      expect do
        described_class.exchange_token!(clerk_user_id: clerk_user_id)
      end.to raise_error(
        described_class::MissingSalesforceContactIdError,
        /Missing Salesforce Contact ID for user/,
      )
    end

    it 'raises DeviseClerkUserConflictError when Salesforce contact ids do not match for an existing linked user' do
      create(
        :user,
        email: email,
        uid: email,
        clerk_user_id: clerk_user_id,
        salesforce_contact_id: '003DIFFERENT',
      )

      expect do
        described_class.exchange_token!(clerk_user_id: clerk_user_id)
      end.to raise_error(
        described_class::DeviseClerkUserConflictError,
        /Salesforce Contact ID conflict/,
      )
    end
  end
end
