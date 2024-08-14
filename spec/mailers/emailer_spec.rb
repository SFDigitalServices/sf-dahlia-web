require 'spec_helper'

describe Emailer, type: :mailer do
  let(:fake_contact) do
    {
      'firstName' => 'Jane',
      'lastName' => 'Doe',
    }
  end

  context 'for emails triggered by authenticated accounts' do
    before(:each) do
      @confirmed_user = User.create!(
        email: 'jane@doe.com',
        password: 'somepassword1',
        password_confirmation: 'somepassword1',
        salesforce_contact_id: 'fakeId',
        confirmed_at: Time.now,
      )
    end

    describe '#submission_confirmation' do
      before do
        @params = {
          lottery_number: '3888078',
          email: @confirmed_user.email,
          first_name: fake_contact['firstName'],
          last_name: fake_contact['lastName'],
          listing_id: 'a0W0P00000F8YG4UAN',
        }
        @listing_name = 'TEST Automated Listing (do not modify)'
      end

      let(:mail) { Emailer.submission_confirmation(@params) }

      it 'renders the email' do
        name = "#{@params[:firstName]} #{@params[:lastName]}"
        text = 'Thanks for applying. We have received your application'
        VCR.use_cassette('emailer/submission_confirmation') do
          expect(mail.subject).to eq("Thanks for applying to #{@listing_name}")
          expect(mail.to).to eq([@params[:email]])
          expect(mail.from).to eq(['donotreply@sfgov.org'])
          expect(mail.body.encoded).to match(name)
          expect(mail.body.encoded).to match(text)
        end
      end
    end

    describe '#draft_application_saved' do
      let(:params) do
        {
          email: @confirmed_user.email,
          first_name: fake_contact['firstName'],
          last_name: fake_contact['lastName'],
          listing_id: 'a0W0P00000F8YG4UAN',
        }
      end
      let(:listing_name) { 'TEST Automated Listing (do not modify)' }
      let(:mail) { Emailer.draft_application_saved(params) }
      let(:deadline) { '5:00 PM on Dec 31' }

      it 'renders the email' do
        subject = "Complete your application for #{listing_name} by #{deadline}"
        greeting = "Hello #{params[:first_name]} #{params[:last_name]},"
        text = "Applications for this listing are due by #{deadline}."
        VCR.use_cassette('emailer/draft_application_saved') do
          expect(mail.subject).to eq(subject)
          expect(mail.to).to eq([params[:email]])
          expect(mail.from).to eq(['donotreply@sfgov.org'])
          expect(mail.body.encoded).to match(greeting)
          expect(mail.body.encoded).to match(text)
          expect(mail.body.encoded).to match(deadline)
        end
      end
    end

    describe '#account_update' do
      it 'renders the email' do
        allow(Force::AccountService).to receive(:get).and_return(fake_contact)
        mail = Emailer.account_update(@confirmed_user)
        subject = 'DAHLIA SF Housing Portal Account Updated'
        greeting = "Hello #{fake_contact['firstName']} #{fake_contact['lastName']},"
        remember =
          'Remember to always create a strong password for your account and not ' \
          'share your password with others.'
        settings_link =
          '<a href="http://localhost/sign-in?redirectTo=dahlia.account-settings">' \
          'Account Settings</a>'
        VCR.use_cassette('emailer/account_update') do
          expect(mail.subject).to eq(subject)
          expect(mail.to).to eq([@confirmed_user[:email]])
          expect(mail.from).to eq(['donotreply@sfgov.org'])
          expect(mail.body.encoded).to match(greeting)
          expect(mail.body.encoded).to match(remember)
          expect(mail.html_part.body.raw_source).to include(settings_link)
        end
      end
    end

    describe 'update email address with #confirmation_instructions' do
      it 'renders the email' do
        # devise temporarily stores the new email address in this column
        # and then swaps it in after confirmation
        @confirmed_user.update!(unconfirmed_email: 'new@new.com')
        allow(Force::AccountService).to receive(:get).and_return(fake_contact)
        mail = Emailer.confirmation_instructions(@confirmed_user, 'fake_token')
        subject = 'Email change for DAHLIA'
        greeting = "Hello #{fake_contact['firstName']} #{fake_contact['lastName']},"
        instructions =
          'A request to change your email has been made. To verify this request, please ' \
          'click the link below. Your email will be changed on any unsubmitted ' \
          'applications.'
        VCR.use_cassette('emailer/confirmation_instructions') do
          expect(mail.subject).to eq(subject)
          expect(mail.to).to eq([@confirmed_user[:email]])
          expect(mail.from).to eq(['donotreply@sfgov.org'])
          expect(mail.body.encoded).to match(greeting)
          expect(mail.body.encoded).to match(instructions)
        end
      end
    end
  end

  context 'for emails triggered by un-authenticated accounts' do
    before(:each) do
      @unconfirmed_user = User.create!(
        email: 'jane@doe.com',
        password: 'somepassword1',
        password_confirmation: 'somepassword1',
        salesforce_contact_id: 'fakeId',
        confirmed_at: nil,
      )
    end

    describe '#submission_confirmation' do
      before do
        @params = {
          lottery_number: '3888078',
          email: @unconfirmed_user.email,
          first_name: fake_contact['firstName'],
          last_name: fake_contact['lastName'],
          listing_id: 'a0W0P00000F8YG4UAN',
        }
        @listing_name = 'TEST Automated Listing (do not modify)'
      end

      let(:mail) { Emailer.submission_confirmation(@params) }

      it 'renders the email' do
        greeting = 'Hello,'
        text = 'Thanks for applying. We have received your application'
        VCR.use_cassette('emailer/submission_confirmation') do
          expect(mail.subject).to eq("Thanks for applying to #{@listing_name}")
          expect(mail.to).to eq([@params[:email]])
          expect(mail.from).to eq(['donotreply@sfgov.org'])
          expect(mail.body.encoded).to match(greeting)
          expect(mail.body.encoded).to match(text)
        end
      end
    end

    describe '#draft_application_saved' do
      let(:params) do
        {
          email: @unconfirmed_user.email,
          first_name: fake_contact['firstName'],
          last_name: fake_contact['lastName'],
          listing_id: 'a0W0P00000F8YG4UAN',
        }
      end
      let(:listing_name) { 'TEST Automated Listing (do not modify)' }
      let(:mail) { Emailer.draft_application_saved(params) }
      let(:deadline) { '5:00 PM on Dec 31' }

      it 'renders the email' do
        subject = "Complete your application for #{listing_name} by #{deadline}"
        greeting = 'Hello,'
        text = "Applications for this listing are due by #{deadline}."
        VCR.use_cassette('emailer/draft_application_saved') do
          expect(mail.subject).to eq(subject)
          expect(mail.to).to eq([params[:email]])
          expect(mail.from).to eq(['donotreply@sfgov.org'])
          expect(mail.body.encoded).to match(greeting)
          expect(mail.body.encoded).to match(text)
          expect(mail.body.encoded).to match(deadline)
        end
      end
    end

    describe '#account_update(params)' do
      it 'renders the email' do
        allow(Force::AccountService).to receive(:get).and_return(fake_contact)
        mail = Emailer.account_update(@unconfirmed_user)
        subject = 'DAHLIA SF Housing Portal Account Updated'
        greeting = 'Hello,'
        remember =
          'Remember to always create a strong password for your account and not ' \
          'share your password with others.'
        settings_link =
          '<a href="http://localhost/sign-in?redirectTo=dahlia.account-settings">' \
          'Account Settings</a>'
        VCR.use_cassette('emailer/account_update') do
          expect(mail.subject).to eq(subject)
          expect(mail.to).to eq([@unconfirmed_user[:email]])
          expect(mail.from).to eq(['donotreply@sfgov.org'])
          expect(mail.body.encoded).to match(greeting)
          expect(mail.body.encoded).to match(remember)
          expect(mail.html_part.body.raw_source).to include(settings_link)
        end
      end
    end
  end

  describe 'confirm email address with #confirmation_instructions' do
    before(:each) do
      @user = User.create!(
        email: 'jane@doe.com',
        password: 'somepassword1',
        password_confirmation: 'somepassword1',
        salesforce_contact_id: 'fakeId',
      )
    end

    it 'renders the email' do
      allow(Force::AccountService).to receive(:get).and_return(fake_contact)
      mail = Emailer.confirmation_instructions(@user, 'fake_token')
      instructions =
        'To complete your account creation, please click the link below:'
      VCR.use_cassette('emailer/confirmation_instructions') do
        subject = 'DAHLIA San Francisco Housing Portal New Account Confirmation'
        expect(mail.subject).to eq(subject)
        expect(mail.to).to eq([@user[:email]])
        expect(mail.from).to eq(['donotreply@sfgov.org'])
        expect(mail.body.encoded).to match(instructions)
      end
    end
  end
end
