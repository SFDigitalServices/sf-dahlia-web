# frozen_string_literal: true

require 'rails_helper'
require 'support/vcr_setup'

describe Api::V1::ListingInterestController do
  describe '#index' do
    it 'creates fieldUpdateComment for yes response' do
      a = 'applicationId'
      r = 'y'
      allow(JWT).to receive(:decode).and_return([{ 'b' => 0, 'a' => a,
                                                   'r' => r, 's' => '2024-04-26' }])

      force_request_instance = instance_double(Force::Request)
      allow(Force::Request).to receive(:new).and_return(force_request_instance)
      resp = { 'status' => 200 }
      def resp.status
        200
      end
      expect(force_request_instance).to receive(:post_with_headers)
        .with("/fieldUpdateComment/#{a}", any_args)
        .and_return(resp)

      get :index, params: { t: '321' }
      expect(response).to redirect_to("/listing_interest?listing=a0W0P00000DZYzVUAX&response=#{r}")
    end

    it 'creates fieldUpdateComment for no response' do
      a = 'applicationId'
      r = 'n'
      allow(JWT).to receive(:decode).and_return([{ 'b' => 0, 'a' => a,
                                                   'r' => r, 's' => '2024-04-26' }])

      force_request_instance = instance_double(Force::Request)
      allow(Force::Request).to receive(:new).and_return(force_request_instance)
      resp = { 'status' => 200 }
      def resp.status
        200
      end
      expect(force_request_instance).to receive(:post_with_headers)
        .with("/fieldUpdateComment/#{a}", any_args)
        .and_return(resp)

      get :index, params: { t: '321' }
      expect(response).to redirect_to("/listing_interest?listing=a0W0P00000DZYzVUAX&response=#{r}")
    end

    it 'redirects to error page when salesforce fails to create fieldupdatecomment' do
      a = 'applicationId'
      r = 'y'
      allow(JWT).to receive(:decode).and_return([{ 'b' => 0, 'a' => a,
                                                   'r' => r, 's' => '2024-04-26' }])

      force_request_instance = instance_double(Force::Request)
      allow(Force::Request).to receive(:new).and_return(force_request_instance)
      resp = { 'status' => 404 }
      def resp.status
        404
      end
      expect(force_request_instance).to receive(:post_with_headers)
        .with("/fieldUpdateComment/#{a}", any_args)
        .and_return(resp)

      get :index, params: { t: '321' }
      expect(response).to redirect_to('/listing_interest?listing=&response=e')
    end

    it 'handles errors' do
      allow(JWT).to receive(:decode).and_raise(StandardError)
      get :index, params: { t: '321' }
      expect(response).to redirect_to('/listing_interest?listing=&response=e')
    end
  end
end
