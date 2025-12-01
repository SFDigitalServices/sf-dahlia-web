# frozen_string_literal: true

require 'rails_helper'

describe Api::V1::InviteToApplyController do
  describe '#submit_docs' do
    let(:api_client) { instance_double(DahliaBackend::ApiClient) }
    let(:application_number) { 'APP123' }

    before do
      allow(DahliaBackend::ApiClient).to receive(:new).and_return(api_client)
    end

    context 'with valid application number' do
      context 'when API call is successful' do
        before do
          allow(api_client).to receive(:post).and_return({ success: true })
        end

        it 'returns success' do
          post :submit_docs, params: { application_number: application_number }
          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)).to eq({ 'success' => true })
        end

        it 'calls the backend API with correct parameters' do
          expect(api_client).to receive(:post).with(
            '/messages/invite-to-apply/response/submit',
            {
              applicants: [
                {
                  lotteryNumber: '',
                  applicationNumber: application_number,
                  primaryContact: {
                    firstName: '',
                    email: '',
                  },
                },
              ],
              listingId: '',
              listingName: '',
              listingAddress: '',
              listingNeighborhood: '',
              deadlineDate: '',
            },
          )
          post :submit_docs, params: { application_number: application_number }
        end
      end

      context 'when API call returns nil' do
        before do
          allow(api_client).to receive(:post).and_return(nil)
        end

        it 'returns internal server error' do
          post :submit_docs, params: { application_number: application_number }
          expect(response).to have_http_status(:internal_server_error)
          expect(JSON.parse(response.body)).to eq({ 'error' => 'Failed to submit response' })
        end
      end

      context 'when API call raises an exception' do
        before do
          allow(api_client).to receive(:post).and_raise(StandardError, 'API Error')
        end

        it 'returns internal server error' do
          post :submit_docs, params: { application_number: application_number }
          expect(response).to have_http_status(:internal_server_error)
          expect(JSON.parse(response.body)).to eq({ 'error' => 'An error occurred' })
        end

        it 'logs the error' do
          expect(Rails.logger).to receive(:error).with('Error submitting invite to apply response: API Error')
          post :submit_docs, params: { application_number: application_number }
        end
      end
    end

    context 'with missing application number' do
      it 'returns unprocessable entity error when application_number is blank' do
        post :submit_docs, params: { application_number: '' }
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)).to eq({ 'error' => 'Application number is required' })
      end

      it 'returns unprocessable entity error when application_number is nil' do
        post :submit_docs, params: {}
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)).to eq({ 'error' => 'Application number is required' })
      end

      it 'does not call the backend API when application_number is missing' do
        expect(api_client).not_to receive(:post)
        post :submit_docs, params: { application_number: '' }
      end
    end
  end
end
