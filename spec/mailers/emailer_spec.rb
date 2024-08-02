require 'spec_helper'

describe Emailer, type: :mailer do
  describe '.submission_confirmation(params)' do
    before do
      @params = {
        lottery_number: '3888078',
        email: 'test@person.com',
        first_name: 'Mister',
        last_name: 'Tester',
        listing_id: 'a0W0P00000F8YG4UAN',
      }
      @listing_name = 'TEST Automated Listing (do not modify)'
    end

    let(:mail) { Emailer.submission_confirmation(@params) }

    it 'renders the headers' do
      VCR.use_cassette('emailer/submission_confirmation') do
        expect(mail.subject).to eq("Thanks for applying to #{@listing_name}")
        expect(mail.to).to eq([@params[:email]])
        expect(mail.from).to eq(['donotreply@sfgov.org'])
      end
    end

    it 'renders the body' do
      VCR.use_cassette('emailer/submission_confirmation') do
        # TODO: test names again for DAH-2471
        # name = "#{@params[:firstName]} #{@params[:lastName]}"
        text = 'Thanks for applying. We have received your application'
        # expect(mail.body.encoded).to match(name)
        expect(mail.body.encoded).to match(text)
      end
    end
  end

  describe '.draft_application_saved(params)' do
    before do
      @params = {
        email: 'test@person.com',
        first_name: 'Mister',
        last_name: 'Tester',
        listing_id: 'a0W0P00000F8YG4UAN',
      }
      @listing_name = 'TEST Automated Listing (do not modify)'
    end

    let(:mail) { Emailer.draft_application_saved(@params) }
    let(:deadline) { '5:00 PM on Dec 31' }

    it 'renders the headers' do
      VCR.use_cassette('emailer/draft_application_saved') do
        subject = "Complete your application for #{@listing_name} by #{deadline}"
        expect(mail.subject).to eq(subject)
        expect(mail.to).to eq([@params[:email]])
        expect(mail.from).to eq(['donotreply@sfgov.org'])
      end
    end

    it 'renders the body' do
      VCR.use_cassette('emailer/draft_application_saved') do
        # TODO: test names again for DAH-2471
        # name = "#{@params[:first_name]} #{@params[:last_name]}"
        text = "Applications for this listing are due by #{deadline}."
        # expect(mail.body.encoded).to match(name)
        expect(mail.body.encoded).to match(text)
        expect(mail.body.encoded).to match(deadline)
      end
    end
  end

  describe '.account_update(params)' do
    before do
      @record = User.create(
        email: 'jane@doe.com',
        salesforce_contact_id: 'fakeId',
      )

      # Mock contact return
      @fake_contact = {
        'firstName' => 'Jane',
        'lastName' => 'Doe',
      }
    end

    it 'renders the headers' do
      allow(Force::AccountService).to receive(:get).and_return(@fake_contact)
      mail = Emailer.account_update(@record)

      VCR.use_cassette('emailer/account_update') do
        subject = 'DAHLIA SF Housing Portal Account Updated'
        expect(mail.subject).to eq(subject)
        expect(mail.to).to eq([@record[:email]])
        expect(mail.from).to eq(['donotreply@sfgov.org'])
      end
    end

    it 'renders the body' do
      allow(Force::AccountService).to receive(:get).and_return(@fake_contact)
      mail = Emailer.account_update(@record)

      VCR.use_cassette('emailer/account_update') do
        # TODO: test names again for DAH-2471
        # name = 'Hello Jane Doe,'
        name = 'Hello,'
        # rubocop:disable Metrics/LineLength
        remember = 'Remember to always create a strong password for your account and not share your password with others.'
        settings_link = '<a href="http://localhost/sign-in?redirectTo=dahlia.account-settings">Account Settings</a>'
        # rubocop:enable Metrics/LineLength
        expect(mail.body.encoded).to match(name)
        expect(mail.body.encoded).to match(remember)
        expect(mail.html_part.body.raw_source).to include(settings_link)
      end
    end
  end
end
