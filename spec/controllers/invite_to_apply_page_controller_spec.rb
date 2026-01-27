require 'rails_helper'

RSpec.describe InviteToApplyPageController do
  let(:deadline) { '2999-12-31' }
  let(:application_number) { 'APP123456' }
  let(:response_value) { 'yes' }
  let(:listing_id) { 'listing123' }
  let(:file_upload_url) { 'https://www.test.com' }
  let(:decoded_token) do
    [
      {
        data: {
          deadline: deadline,
          applicationNumber: application_number,
          response: response_value,
          fileUploadUrl: file_upload_url,
        },
      }
    ]
  end

  before do
    allow(ENV).to receive(:fetch).with('JWT_TOKEN_SECRET', nil)
                                 .and_return('TEST_TOKEN_SECRET')
    allow(ENV).to receive(:fetch).with('JWT_ALGORITHM', nil).and_return('HS256')
    allow(controller).to receive(:static_asset_paths).and_return({ logo: 'logo.png' })
    allow(DahliaBackend::MessageService).to receive(:send_invite_to_apply_response)
    allow(Rails.logger).to receive(:info)
  end

  describe '#index' do
    context 'with valid parameters' do
      before do
        get :index, params: {
          id: listing_id,
          deadline: deadline,
          applicationNumber: application_number,
          response: response_value,
          fileUploadUrl: file_upload_url,
        }
      end

      it 'returns a successful response' do
        expect(response).to be_ok
      end

      it 'renders the invite_to_apply template' do
        expect(response).to render_template('invite_to_apply')
      end

      it 'sets the invite_to_apply_props instance variable' do
        expect(assigns(:invite_to_apply_props)).to eq({
                                                        assetPaths: { logo: 'logo.png' },
                                                        urlParams: {
                                                          deadline: deadline,
                                                          response: response_value,
                                                          applicationNumber: application_number,
                                                          fileUploadUrl: file_upload_url,
                                                        },
                                                      })
      end

      it 'calls record_response with correct parameters' do
        expect(DahliaBackend::MessageService).to have_received(:send_invite_to_apply_response).with(
          deadline,
          application_number,
          response_value,
          listing_id,
          file_upload_url,
        )
      end
    end

    context 'with missing parameters' do
      before do
        get :index, params: { id: listing_id }
      end

      it 'still renders successfully' do
        expect(response).to be_ok
      end

      it 'does not call record_response' do
        expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_apply_response)
      end
    end

    context 'when DahliaBackend::MessageService raises an error' do
      before do
        allow(DahliaBackend::MessageService).to receive(:send_invite_to_apply_response).and_raise(
          StandardError, 'API Error'
        )
      end

      it 'raises the error' do
        expect do
          get :index, params: {
            id: listing_id,
            deadline: deadline,
            applicationNumber: application_number,
            response: response_value,
            fileUploadUrl: file_upload_url,
          }
        end.to raise_error(StandardError, 'API Error')
      end
    end

    context 'with json web tokens' do
      before do
        allow(controller).to receive(:use_jwt?).and_return(true)
        allow(JWT).to receive(:decode).and_return(decoded_token)
      end

      it 'creates a token for the preview link' do
        get :index, params: { id: listing_id, t: 'test_token' }
        expect(assigns(:invite_to_apply_props)).to have_key(:submitPreviewLinkTokenParam)
      end

      it 'redirects to the listing details page if token is blank' do
        get :index, params: { id: listing_id }
        expect(response).to redirect_to("/listings/#{listing_id}")
      end

      it 'redirects to the listing details page if token is invalid' do
        allow(JWT).to receive(:decode).and_raise(JWT::VerificationError)
        get :index, params: { id: listing_id, t: 'invalid_test_token' }
        expect(response).to redirect_to('/')
      end
    end
  end

  describe '#documents' do
    before do
      get :documents, params: {
        id: listing_id,
        deadline: deadline,
        applicationNumber: application_number,
        response: response_value,
        fileUploadUrl: file_upload_url,
      }
    end

    it 'returns a successful response' do
      expect(response).to be_ok
    end

    it 'renders the invite_to_apply template' do
      expect(response).to render_template('invite_to_apply')
    end

    it 'sets the invite_to_apply_props with documentsPath set to true' do
      expect(assigns(:invite_to_apply_props)).to eq({
                                                      assetPaths: { logo: 'logo.png' },
                                                      urlParams: {
                                                        deadline: deadline,
                                                        response: response_value,
                                                        applicationNumber: application_number,
                                                        fileUploadUrl: file_upload_url,
                                                      },
                                                      documentsPath: true,
                                                    })
    end

    it 'does not call record_response' do
      expect(DahliaBackend::MessageService).not_to have_received(:send_invite_to_apply_response)
    end
  end

  describe 'React layout usage' do
    it 'uses React layout for all actions' do
      get :index, params: { id: listing_id }
      expect(response).to render_template('layouts/application-react')
    end
  end
end
