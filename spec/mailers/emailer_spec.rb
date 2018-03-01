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
      @listing_name = 'Automated Test Listing (please do not modify)'
    end

    let(:mail) { Emailer.submission_confirmation(@params) }

    it 'renders the headers' do
      VCR.use_cassette('emailer/submission_confirmation') do
        expect(mail.subject).to eq("Thanks for applying to #{@listing_name}")
        expect(mail.to).to eq([@params[:email]])
        expect(mail.from).to eq(['dahlia@housing.sfgov.org'])
      end
    end

    it 'renders the body' do
      VCR.use_cassette('emailer/submission_confirmation') do
        name = "#{@params[:firstName]} #{@params[:lastName]}"
        text = 'Thanks for applying. We have received your application'
        expect(mail.body.encoded).to match(name)
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
      @listing_name = 'Automated Test Listing (please do not modify)'
    end

    let(:mail) { Emailer.draft_application_saved(@params) }
    let(:deadline) { '5:00 PM on Dec 31' }

    it 'renders the headers' do
      VCR.use_cassette('emailer/draft_application_saved') do
        subject = "Complete your application for #{@listing_name} by #{deadline}"
        expect(mail.subject).to eq(subject)
        expect(mail.to).to eq([@params[:email]])
        expect(mail.from).to eq(['dahlia@housing.sfgov.org'])
      end
    end

    it 'renders the body' do
      VCR.use_cassette('emailer/draft_application_saved') do
        name = "#{@params[:first_name]} #{@params[:last_name]}"
        text = "Applications for this listing are due by #{deadline}."
        expect(mail.body.encoded).to match(name)
        expect(mail.body.encoded).to match(text)
        expect(mail.body.encoded).to match(deadline)
      end
    end
  end
end
