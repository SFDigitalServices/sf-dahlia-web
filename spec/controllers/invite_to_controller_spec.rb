require 'rails_helper'

RSpec.describe InviteToController do
  let(:deadline) { '2999-12-31' }
  let(:application_number) { 'APP123456' }
  let(:response_value) { 'yes' }
  let(:listing_id) { 'listing123' }
  let(:decoded_token) do
    [
      {
        'data' => {
          'deadline' => deadline,
          'appId' => application_number,
          'act' => response_value,
          'type' => 'I2A',
        },
      },
      { 'alg' => 'HS256', 'typ' => 'JWT' },
    ]
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
    allow(ENV).to receive(:fetch).with('SALESFORCE_INSTANCE_URL',
                                       nil).and_return('test-salesforce-url')
    allow(ENV).to receive(:fetch).with('SALESFORCE_API_VERSION',
                                       '61.0').and_return('61.0')
    allow(ENV).to receive(:fetch).with('SALESFORCE_PROXY_URI', nil).and_return(nil)
    allow(DahliaBackend::MessageService).to receive(:send_invite_to_response)
    allow(Rails.logger).to receive(:info)
    allow(controller).to receive(:encode_token).and_return(fixed_token)
    allow(Rails.configuration.unleash).to receive(:is_enabled?)
      .with('temp.webapp.inviteToClientRecording').and_return(false)
    allow(Rails.configuration.unleash).to receive(:get_variant)
      .with('temp.webapp.inviteToClientRecording').and_return(nil)
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
        allow(JWT).to receive(:decode).and_return(decoded_token)
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
        allow(JWT).to receive(:decode).and_raise(JWT::DecodeError)
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
    let(:variant_double) { instance_double(Unleash::Variant, name: variant_name) }
    let(:variant_name) { 'on' }

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

    context "when the flag is enabled with the 'on' variant" do
      before do
        allow(Rails.configuration.unleash).to receive(:is_enabled?)
          .with('temp.webapp.inviteToClientRecording').and_return(true)
        allow(Rails.configuration.unleash).to receive(:get_variant)
          .with('temp.webapp.inviteToClientRecording').and_return(variant_double)
        request_index
      end

      it 'does not call record_response server-side' do
        expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
      end

      it "includes clientRecordingMode: 'on' in the props" do
        expect(assigns(:invite_to_props)).to include(clientRecordingMode: 'on')
      end
    end

    context 'when the flag is enabled with no configured variant' do
      before do
        allow(Rails.configuration.unleash).to receive(:is_enabled?)
          .with('temp.webapp.inviteToClientRecording').and_return(true)
        allow(Rails.configuration.unleash).to receive(:get_variant)
          .with('temp.webapp.inviteToClientRecording').and_return(nil)
        request_index
      end

      it "defaults to 'on' (skips server-side recording)" do
        expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_response)
        expect(assigns(:invite_to_props)).to include(clientRecordingMode: 'on')
      end
    end

    context "when the flag is enabled with the 'shadow' variant" do
      let(:variant_name) { 'shadow' }

      before do
        allow(Rails.configuration.unleash).to receive(:is_enabled?)
          .with('temp.webapp.inviteToClientRecording').and_return(true)
        allow(Rails.configuration.unleash).to receive(:get_variant)
          .with('temp.webapp.inviteToClientRecording').and_return(variant_double)
        request_index
      end

      it 'still records server-side on GET (unchanged applicant behavior)' do
        expect(DahliaBackend::MessageService).to have_received(:send_invite_to_response)
      end

      it "includes clientRecordingMode: 'shadow' in the props" do
        expect(assigns(:invite_to_props)).to include(clientRecordingMode: 'shadow')
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
