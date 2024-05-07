# frozen_string_literal: true

require 'rails_helper'
require 'support/vcr_setup'

yes_token = 'yes_token'
no_token = 'no_token'
error_token = 'error_token'
application_id = 'application_id'
force_request_instance = {}
resp = {}

describe Api::V1::ListingInterestController do
  describe '#index' do
    before(:each) do
      # setup jwt decode mock
      allow(JWT).to receive(:decode) do |token|
        if token == yes_token
          [{ 'b' => 0, 'a' => application_id, 'r' => 'y', 's' => '2024-04-26' }]
        elsif token == no_token
          [{ 'b' => 0, 'a' => application_id, 'r' => 'n', 's' => '2024-04-26' }]
        elsif token == error_token
          raise StandardError
        else
          # Return a custom value for an invalid token
          raise JWT::DecodeError, 'Invalid token'
        end
      end

      # setup create fieldUpdateComment mock
      force_request_instance = instance_double(Force::Request)
      allow(Force::Request).to receive(:new).and_return(force_request_instance)
      def resp.status
        200
      end
    end

    it 'creates fieldUpdateComment for yes response' do
      expect(force_request_instance).to receive(:post_with_headers)
        .with("/fieldUpdateComment/#{application_id}", any_args)
        .and_return(resp)
      get :index, params: { t: yes_token }
      expect(response).to redirect_to('/listing_interest?listing=a0W0P00000DZYzVUAX&response=y')
    end

    it 'creates fieldUpdateComment for no response' do
      expect(force_request_instance).to receive(:post_with_headers)
        .with("/fieldUpdateComment/#{application_id}", any_args)
        .and_return(resp)
      get :index, params: { t: no_token }
      expect(response).to redirect_to('/listing_interest?listing=a0W0P00000DZYzVUAX&response=n')
    end

    it 'redirects to error page when salesforce fails to create fieldupdatecomment' do
      def resp.status
        404
      end
      expect(force_request_instance).to receive(:post_with_headers)
        .with("/fieldUpdateComment/#{application_id}", any_args)
        .and_return(resp)

      get :index, params: { t: yes_token }
      expect(response).to redirect_to('/listing_interest?listing=&response=e')
    end

    it 'handles errors' do
      get :index, params: { t: error_token }
      expect(force_request_instance).not_to receive(:post_with_headers)
      expect(response).to redirect_to('/listing_interest?listing=&response=e')
    end
  end
end
