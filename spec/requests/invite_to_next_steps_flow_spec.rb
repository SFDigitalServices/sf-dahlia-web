require 'rails_helper'

# The release bug (DAH-4053 -> #3105): every Schedule Appointment / Submit click on a
# next-steps page got a 401 from record-response, so no response reached Salesforce.
# The page (InviteToController) and record-response (Api::V1::InviteToResponseController)
# are specced separately with stubbed tokens; this drives both with real signed tokens,
# the way the browser does.
describe 'Invite-to next-steps flow', type: :request do
  let(:listing_id) { 'a0W0P00000GbyuQ' }
  let(:app_id) { 'a0o0P00000Iw6Y7' }
  let(:deadline) { (Time.zone.today + 30).to_s }
  let(:scheduling_url) { 'https://scheduling.example/book' }
  let(:upload_url) { 'https://upload.example/docs' }

  before do
    stub_const('JsonWebTokenService::SECRET_KEY', 'test_secret')
    stub_const('JsonWebTokenService::ALGORITHM', 'HS256')
    stub_const('JsonWebTokenService::ALLOWED_ALGORITHMS', ['HS256'])
    allow(Force::ShortFormService).to receive(:get).with(app_id).and_return(
      'uploadURL' => upload_url, 'leaseupAppointmentSchedulingURL' => scheduling_url,
    )
    allow(DahliaBackend::MessageService).to receive(:send_invite_to_response)
  end

  def email_token(type:, act:, is_test: false)
    JsonWebTokenService.encode_token(
      { type: type, deadline: deadline, act: act, appId: app_id, isTest: is_test },
    )
  end

  def open_invite_page(token)
    get "/en/listings/#{listing_id}/next-steps", params: { t: token }
    expect(response).to be_ok
    assigns(:invite_to_props)
  end

  # The next-steps components post the `t` from the page's own URL (not the props token).
  def click_primary_button(url_token, action)
    post '/api/v1/next-steps/record-response',
         params: { t: url_token, record: { action: action } }
  end

  {
    'I2I' => ['appointment', :schedulingUrl, 'https://scheduling.example/book'],
    'I2A' => ['submit', :uploadUrl, 'https://upload.example/docs'],
  }.each do |type, (action, link_prop, link)|
    context "with an #{type} invite" do
      # Given an applicant's real "Yes" email link
      # When they open it and click the primary next-steps button
      # Then the GET records 'yes', the button's link is on the page, and the click
      #   records the next-steps action
      it "records '#{action}' from the page opened by the Yes email link" do
        token = email_token(type: type, act: 'yes')

        props = open_invite_page(token)
        expect(props).to include(link_prop => link)
        expect(props[:urlParams]).to include(act: 'yes', type: type)

        click_primary_button(token, action)

        expect(response).to be_ok
        expect(DahliaBackend::MessageService).to have_received(:send_invite_to_response)
          .with(app_id, 'yes').ordered
        expect(DahliaBackend::MessageService).to have_received(:send_invite_to_response)
          .with(app_id, action).ordered
      end

      # Given an applicant who answered "No" or "Contact me later" in the email
      # When they follow the page's link to next steps and click the primary button
      # Then loading next-steps records nothing, and the click records the action
      %w[no contact].each do |email_act|
        it "records '#{action}' via the next-steps link from '#{email_act}'" do
          first_props = open_invite_page(email_token(type: type, act: email_act))
          next_steps_token = first_props.fetch(:submitPreviewLinkTokenParam)

          next_steps_props = open_invite_page(next_steps_token)
          expect(next_steps_props[:urlParams])
            .to include(act: nil, type: type, appId: app_id)
          expect(next_steps_props).to include(link_prop => link)

          click_primary_button(next_steps_token, action)

          expect(response).to be_ok
          expect(DahliaBackend::MessageService)
            .to have_received(:send_invite_to_response).twice
          expect(DahliaBackend::MessageService).to have_received(:send_invite_to_response)
            .with(app_id, email_act).ordered
          expect(DahliaBackend::MessageService).to have_received(:send_invite_to_response)
            .with(app_id, action).ordered
        end
      end

      # Given a test/example email link (DAH-4103)
      # When the button is clicked
      # Then the click succeeds but nothing is recorded
      it 'returns ok and records nothing for a test email link' do
        token = email_token(type: type, act: 'yes', is_test: true)

        expect(open_invite_page(token)).to include(link_prop => link)
        click_primary_button(token, action)

        expect(response).to be_ok
        expect(DahliaBackend::MessageService)
          .not_to have_received(:send_invite_to_response)
      end
    end
  end
end
