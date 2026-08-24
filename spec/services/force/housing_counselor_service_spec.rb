# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Force::HousingCounselorService do
  let(:request_instance) { instance_double(Force::Request) }

  before do
    allow(Force::Request).to receive(:new).and_return(request_instance)
  end

  describe '.agencies' do
    it 'fetches housing counseling agencies from Salesforce' do
      agencies = [{ 'id' => '123', 'name' => 'Test Agency A', 'shortName' => 'A' }]
      expect(request_instance)
        .to receive(:cached_get)
        .with('/housingCounselingAgencies/')
        .and_return(agencies)

      expect(described_class.agencies).to eq(agencies)
    end
  end

  describe '.authorize_access' do
    let(:counselor_contact_id) { 'hc123' }
    let(:applicant_contact_id) { '003ABC' }
    let(:agency_id) { 'agency1' }
    let(:counselor_contact) do
      {
        'id' => counselor_contact_id,
        'isHousingCounselor' => true,
        'inactiveContact' => false,
      }
    end
    let(:applicant) { { 'housingCounselingAgencyId' => agency_id } }

    def stub_agencies(contact = counselor_contact)
      allow(request_instance).to receive(:get)
        .with("/housingCounselingAgencies/#{counselor_contact_id}")
        .and_return(
          [{ 'id' => agency_id, 'housingCounselors' => Array.wrap(contact) }],
        )
    end

    before do
      stub_agencies
      allow(Force::AccountService).to receive(:get)
        .with(applicant_contact_id).and_return(applicant)
    end

    it 'returns contact ids when the counselor has access to the applicant' do
      expect(
        described_class.authorize_access(applicant_contact_id:, counselor_contact_id:),
      ).to eq(applicant_contact_id:, counselor_contact_id:)
    end

    it 'returns nil when the applicant contact id is blank' do
      expect(
        described_class.authorize_access(
          applicant_contact_id: nil,
          counselor_contact_id:,
        ),
      ).to be_nil
    end

    it 'returns nil when the contact is missing from housingCounselors' do
      stub_agencies([])

      expect(
        described_class.authorize_access(applicant_contact_id:, counselor_contact_id:),
      ).to be_nil
    end

    it 'returns nil when the logged in user is not a housing counselor' do
      stub_agencies(counselor_contact.merge('isHousingCounselor' => false))

      expect(
        described_class.authorize_access(applicant_contact_id:, counselor_contact_id:),
      ).to be_nil
    end

    it 'returns nil when the housing counselor is inactive' do
      stub_agencies(counselor_contact.merge('inactiveContact' => true))

      expect(
        described_class.authorize_access(applicant_contact_id:, counselor_contact_id:),
      ).to be_nil
    end

    it 'returns nil when the applicant did not grant access to an agency' do
      allow(Force::AccountService).to receive(:get)
        .with(applicant_contact_id)
        .and_return('housingCounselingAgencyId' => nil)

      expect(
        described_class.authorize_access(applicant_contact_id:, counselor_contact_id:),
      ).to be_nil
    end

    it 'returns nil when agency ids do not match' do
      allow(Force::AccountService).to receive(:get)
        .with(applicant_contact_id)
        .and_return('housingCounselingAgencyId' => 'other-agency')

      expect(
        described_class.authorize_access(applicant_contact_id:, counselor_contact_id:),
      ).to be_nil
    end

    it 'returns nil when housingCounselingAgencies is not found' do
      allow(request_instance).to receive(:get)
        .and_raise(Restforce::NotFoundError, 'Could not find a match for URL')

      expect(
        described_class.authorize_access(applicant_contact_id:, counselor_contact_id:),
      ).to be_nil
    end

    it 'returns nil when the applicant contact is not found' do
      allow(Force::AccountService).to receive(:get)
        .and_raise(Restforce::NotFoundError, 'Could not find a match for URL')

      expect(
        described_class.authorize_access(applicant_contact_id:, counselor_contact_id:),
      ).to be_nil
    end
  end
end
