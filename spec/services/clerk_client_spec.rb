# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ClerkClient do
  describe '.execute' do
    it 'logs when the Clerk API is unreachable' do
      error = Faraday::ConnectionFailed.new('connection refused')
      allow(Rails.logger).to receive(:error)

      expect { described_class.execute { raise error } }
        .to raise_error(described_class::ConnectionError,
                        'Clerk API is unreachable: connection refused')
      expect(Rails.logger).to have_received(:error).with(
        'Clerk connection error: connection refused',
      )
    end

    it 'logs and re-raises Clerk API errors' do
      error = Clerk::Models::Errors::APIError.new(
        status_code: 500,
        body: 'Internal Server Error',
        raw_response: nil,
      )
      allow(Rails.logger).to receive(:error)

      expect { described_class.execute { raise error } }.to raise_error(error)
      expect(Rails.logger).to have_received(:error).with(
        "Clerk API error (#{error.class}): #{error.message}",
      )
    end
  end
end
