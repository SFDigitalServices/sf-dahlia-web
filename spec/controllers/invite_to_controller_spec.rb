require 'rails_helper'

RSpec.describe InviteToController do
  let(:deadline) { '2999-12-31' }
  let(:application_number) { 'APP123456' }
  let(:response_value) { 'yes' }
  let(:listing_id) { 'listing123' }

  let(:decoded_payload) do
    {
      'deadline' => deadline,
      'appId' => application_number,
      'act' => response_value,
      'type' => 'I2A',
    }
  end

  let(:fixed_iat) { 946_512_000 }
  let(:fixed_exp) { 946_598_400 }
  let(:fixed_token) do
    JWT.encode(
      {
        data: {
          deadline: deadline,
          appId: application_number,
          act: response_value,
          type: 'I2A',
        },
        iat: fixed_iat,
        exp: fixed_exp,
      },
      'TEST_TOKEN_SECRET',
      'HS256',
    )
  end

  let(:is_test_token) do
    JWT.encode(
      {
        data: {
          deadline: deadline,
          appId: application_number,
          act: response_value,
          type: 'I2A',
          isTest: 'true',
        },
        iat: fixed_iat,
        exp: fixed_exp,
      },
      'TEST_TOKEN_SECRET',
      'HS256',
    )
  end

  before do
    allow(ENV).to receive(:fetch).with('JWT_TOKEN_SECRET', nil)
                                 .and_return('TEST_TOKEN_SECRET')
    allow(ENV).to receive(:fetch).with('JWT_ALGORITHM', nil).and_return('HS256')
    allow(controller).to receive(:static_asset_paths).and_return({ logo: 'logo.png' })
    allow(ENV).to receive(:fetch).with('SALESFORCE_INSTANCE_URL', nil).and_return('test-salesforce-url')
    allow(ENV).to receive(:fetch).with('SALESFORCE_API_VERSION', '61.0').and_return('61.0')
    allow(ENV).to receive(:fetch).with('SALESFORCE_PROXY_URI', nil).and_return(nil)
    allow(DahliaBackend::MessageService).to receive(:send_invite_to_response)
    allow(Rails.logger).to receive(:info)
    allow(controller).to receive(:encode_token).and_return(fixed_token)

    # Align with controller implementation (uses JsonWebTokenService, not JWT.decode directly)
    allow(JsonWebTokenService).to receive(:decode_token).with(fixed_token).and_return(decoded_payload)
    allow(JsonWebTokenService).to receive(:decode_token).with(is_test_token)
      .and_return(decoded_payload.merge('isTest' => 'true'))
    allow(JsonWebTokenService).to receive(:decode_token).with('test_token').and_return(decoded_payload)
    allow(JsonWebTokenService).to receive(:decode_token).with('invalid_test_token')
      .and_raise(JsonWebTokenService::InvalidTokenError, 'Invalid JWT')
    allow(Rails.configuration.unleash).to receive(:is_enabled?)
      .with('temp.webapp.inviteToClientRecording').and_return(false)
  end

  describe '#index' do
    context 'with valid parameters' do
      before do
        allow(Force::ShortFormService).to receive(:get).with(application_number).and_return({
                                                                                              'uploadURL' => 'test-upload-url', 'leaseupAppointmentSchedulingURL' => 'test-scheduling-url'
                                                                                            })

        get :index, params: {
          id: listing_id,
          t: fixed_token,
          type: 'I2A',
          deadline: deadline,
          act: response_value,
          appId: application_number,
        }
      end

      it 'returns a successful response' do
        expect(response).to be_ok
      end

      it 'renders the invite_to template' do
        expect(response).to render_template('invite_to')
      end

      it 'sets the invite_to_props instance variable' do
        expect(assigns(:invite_to_props)).to eq({
                                                  assetPaths: { logo: 'logo.png' },
                                                  urlParams: {
                                                    type: 'I2A',
                                                    deadline: deadline,
                                                    act: response_value,
                                                    appId: application_number,
                                                    isTest: false,
                                                  },
                                                  clientRecordingMode: 'off',
                                                  uploadUrl: 'test-upload-url',
                                                  schedulingUrl: 'test-scheduling-url',
                                                  submitPreviewLinkTokenParam: fixed_token,
                                                })
      end

      # TODO: update deprecated I2A pilot
      # it 'calls record_response with correct parameters' do
      #   expect(DahliaBackend::MessageService).to have_received(:send_invite_to_response).with(
      #     deadline,
      #     application_number,
      #     nil,
      #     response_value,
      #     nil,
      #     listing_id,
      #   )
      # end
    end

    context 'when DahliaBackend::MessageService raises an error' do
      before do
        allow(Force::ShortFormService).to receive(:get).with(application_number).and_return({
                                                                                              'uploadURL' => 'test-upload-url', 'leaseupAppointmentSchedulingURL' => 'test-scheduling-url'
                                                                                            })
        allow(DahliaBackend::MessageService).to receive(:send_invite_to_response).and_raise(
          StandardError, 'API Error'
        )
      end

      it 'raises the error' do
        expect do
          get :index, params: {
            id: listing_id,
            t: fixed_token,
            type: 'I2A',
            deadline: deadline,
            act: response_value,
            appId: application_number,
          }
        end.to raise_error(StandardError, 'API Error')
      end
    end

    context 'with json web tokens' do
      before do
        allow(Force::ShortFormService).to receive(:get).with(application_number).and_return({ 'uploadURL' => 'test-upload-url' })
      end

      it 'creates a token for the preview link' do
        get :index, params: { id: listing_id, t: 'test_token' }
        expect(assigns(:invite_to_props)).to have_key(:submitPreviewLinkTokenParam)
      end

      it 'redirects to the listing details page if token is blank' do
        get :index, params: { id: listing_id }
        expect(response).to redirect_to("/listings/#{listing_id}")
      end

      it 'redirects to the listing details page if token is invalid' do
        get :index, params: { id: listing_id, t: 'invalid_test_token' }
        expect(response).to redirect_to('/')
      end
    end

    context 'when isTest is present' do
      before do
        allow(Force::ShortFormService).to receive(:get).with(application_number).and_return(
          {
            'uploadURL' => 'test-upload-url',
            'leaseupAppointmentSchedulingURL' => 'test-scheduling-url',
          },
        )

        get :index, params: {
          id: listing_id,
          t: is_test_token,
        }
      end

      it 'does not record invite response' do
        expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
      end

      it 'returns a successful response' do
        expect(response).to be_ok
      end
    end
  end

  describe 'client recording feature flag' do
    before do
      allow(Force::ShortFormService).to receive(:get).with(application_number).and_return(
        { 'uploadURL' => 'test-upload-url',
          'leaseupAppointmentSchedulingURL' => 'test-scheduling-url' },
      )
    end

    def request_index
      get :index, params: {
        id: listing_id,
        t: fixed_token,
        type: 'I2A',
        deadline: deadline,
        act: response_value,
        appId: application_number,
      }
    end

    context 'when the flag is enabled' do
      before do
        allow(Rails.configuration.unleash).to receive(:is_enabled?)
          .with('temp.webapp.inviteToClientRecording').and_return(true)
        allow(Rails.configuration.unleash).to receive(:get_variant)
        request_index
      end

      it 'still records server-side on GET (unchanged applicant behavior)' do
        expect(DahliaBackend::MessageService).to have_received(:send_invite_to_response)
      end

      it "includes clientRecordingMode: 'shadow' in the props" do
        expect(assigns(:invite_to_props)).to include(clientRecordingMode: 'shadow')
      end

      it 'ignores any configured variant (there is no client-records mode yet)' do
        expect(Rails.configuration.unleash).not_to have_received(:get_variant)
      end
    end

    context 'when the flag is disabled' do
      before { request_index }

      it 'still records server-side on GET with act present' do
        expect(DahliaBackend::MessageService).to have_received(:send_invite_to_response)
      end

      it "includes clientRecordingMode: 'off' in the props" do
        expect(assigns(:invite_to_props)).to include(clientRecordingMode: 'off')
      end
    end
  end

  describe 'structured record_response logging' do
    before do
      allow(Force::ShortFormService).to receive(:get).with(application_number).and_return(
        { 'uploadURL' => 'test-upload-url',
          'leaseupAppointmentSchedulingURL' => 'test-scheduling-url' },
      )
    end

    def request_with(payload)
      allow(JsonWebTokenService).to receive(:decode_token).with('custom_token').and_return(payload)
      get :index, params: { id: listing_id, t: 'custom_token' }
    end

    it 'logs a recorded event with ok:true when the send returns a result' do
      allow(DahliaBackend::MessageService).to receive(:send_invite_to_response).and_return(true)
      request_with(decoded_payload)

      expect(Rails.logger).to have_received(:info).with(
        a_string_including(
          'invite_to.response',
          '"outcome":"recorded"',
          '"source":"get"',
          '"ok":true',
          '"act":"yes"',
        ),
      )
    end

    it 'logs ok:false when the send is swallowed (nil return)' do
      allow(DahliaBackend::MessageService).to receive(:send_invite_to_response).and_return(nil)
      request_with(decoded_payload)

      expect(Rails.logger).to have_received(:info).with(
        a_string_including('"outcome":"recorded"', '"ok":false'),
      )
    end

    it 'names no_action when neither act nor response is present (e.g. a preview link)' do
      request_with(decoded_payload.merge('act' => nil))

      expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
      expect(Rails.logger).to have_received(:info).with(
        a_string_including('"outcome":"suppressed"', '"reason":"no_action"'),
      )
    end

    it 'names deadline_passed with resolved local comparison terms and a late_by delta' do
      request_with(decoded_payload.merge('deadline' => '2020-01-01'))

      expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
      expect(Rails.logger).to have_received(:info).with(
        a_string_including(
          '"reason":"deadline_passed"',
          '"deadline_date":"2020-01-01"',
          '"today":',
          '"late_by":',
        ),
      )
    end

    it 'does not crash on an unparseable deadline and logs the raw value' do
      request_with(decoded_payload.merge('deadline' => 'not-a-date'))

      expect(response).to be_ok
      expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
      expect(Rails.logger).to have_received(:info).with(
        a_string_including(
          '"reason":"deadline_passed"',
          '"deadline_raw":"not-a-date"',
        ),
      )
    end

    it 'reports late_by as a day-scale delta for a recently passed deadline' do
      request_with(decoded_payload.merge('deadline' => 3.days.ago.to_date.to_s))

      expect(Rails.logger).to have_received(:info).with(
        a_string_including('"reason":"deadline_passed"', '"late_by":"3d"'),
      )
    end

    # format_duration picks a unit by magnitude; exercised directly so each branch is
    # covered without depending on wall-clock timing in a request spec.
    describe 'late_by formatting' do
      {
        30 => '30s',
        120 => '2m',
        7_200 => '2h',
        172_800 => '2d',
      }.each do |seconds, expected|
        it "renders #{seconds}s as #{expected}" do
          expect(controller.send(:format_duration, seconds)).to eq(expected)
        end
      end

      it 'treats a negative delta as its magnitude' do
        expect(controller.send(:format_duration, -90)).to eq('1m')
      end
    end

    it 'returns the raw deadline when Time.zone.parse raises' do
      allow(Time.zone).to receive(:parse).and_raise(ArgumentError)
      expect(controller.send(:deadline_terms, 'whatever', 'deadline_passed'))
        .to eq({ deadline_raw: 'whatever' })
    end

    it 'treats a deadline that raises on parse as passed' do
      allow(Time.zone).to receive(:parse).and_raise(ArgumentError)
      expect(controller.send(:deadline_has_passed?, 'whatever')).to be(true)
    end

    it 'returns no deadline terms when the reason is not deadline_passed' do
      expect(controller.send(:deadline_terms, '2020-01-01', 'language_change')).to eq({})
    end

    it 'names test_link for a preview/test token' do
      request_with(decoded_payload.merge('isTest' => 'true'))

      expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
      expect(Rails.logger).to have_received(:info).with(
        a_string_including('"reason":"test_link"'),
      )
    end

    it 'names language_change and captures the referrer that triggered it' do
      request.headers['Referer'] = "http://test.host/es/listings/#{listing_id}/next-steps"
      request_with(decoded_payload)

      expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
      expect(Rails.logger).to have_received(:info).with(
        a_string_including('"reason":"language_change"', '"referrer":'),
      )
    end

    # The referrer that triggers language_change? is itself a next-steps URL, so it
    # carries the invite JWT. It must never reach the logs.
    it 'strips the query string from the logged referrer so the invite JWT is not logged' do
      logged = []
      allow(Rails.logger).to receive(:info) { |msg| logged << msg.to_s }
      request.headers['Referer'] =
        "http://test.host/es/listings/#{listing_id}/next-steps?t=SECRET.JWT.VALUE&act=yes"
      request_with(decoded_payload)

      event = logged.find { |msg| msg.start_with?('invite_to.response ') }
      expect(event).to include('"reason":"language_change"')
      expect(event).to include("\"referrer\":\"http://test.host/es/listings/#{listing_id}/next-steps\"")
      expect(event).not_to include('SECRET.JWT.VALUE')
      expect(event).not_to include('t=')
    end

    it 'marks an unparseable referrer rather than raising' do
      # A real malformed referrer (invalid percent-escape) rather than stubbing
      # URI.parse, which Rails itself calls during the request.
      request.headers['Referer'] =
        "http://test.host/es/listings/#{listing_id}/next-steps?t=%zz"
      request_with(decoded_payload)

      expect(response).to be_ok
      expect(Rails.logger).to have_received(:info).with(
        a_string_including('"referrer":"[unparseable]"'),
      )
    end
  end

  describe '#documents' do
    before do
      get :documents, params: {
        id: listing_id,
        deadline: deadline,
        appId: application_number,
        act: response_value,
      }
    end

    it 'returns a successful response' do
      expect(response).to be_ok
    end

    it 'renders the invite_to template' do
      expect(response).to render_template('invite_to')
    end

    it 'sets the invite_to_props with documentsPath set to true' do
      expect(assigns(:invite_to_props)).to include({ assetPaths: { logo: 'logo.png' },
                                                     documentsPath: true })
    end

    it 'does not call record_response' do
      expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
    end
  end

  describe 'ignore HEAD requests' do
    it 'ignores index HEAD requests' do
      head :index, params: {
        id: listing_id,
        t: fixed_token,
        type: 'I2A',
        deadline: deadline,
        act: response_value,
        appId: application_number,
      }

      expect(response).to have_http_status(:ok)
      expect(response.body).to be_blank
      expect(Rails.logger).to have_received(:info).with(
        a_string_including(
          'InviteToController#ignore_head_requests: ignoring HEAD request',
          'action=index',
          "listing_id=\"#{listing_id}\"",
        ),
      )
      expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
    end

    it 'ignores documents HEAD requests' do
      head :documents, params: {
        id: listing_id,
        deadline: deadline,
        appId: application_number,
        act: response_value,
      }

      expect(response).to have_http_status(:ok)
      expect(response.body).to be_blank
      expect(Rails.logger).to have_received(:info).with(
        a_string_including(
          'InviteToController#ignore_head_requests: ignoring HEAD request',
          'action=documents',
          "listing_id=\"#{listing_id}\"",
        ),
      )
      expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
    end
  end

  describe 'React layout usage' do
    it 'uses React layout for all actions' do
      allow(Force::ShortFormService).to receive(:get).with(application_number).and_return({ 'uploadURL' => 'test-upload-url' })
      get :index, params: { id: listing_id,
                            t: fixed_token }
      expect(response).to render_template('layouts/application-react')
    end
  end
end
