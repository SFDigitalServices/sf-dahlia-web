# frozen_string_literal: true

require 'vcr'

VCR.configure do |config|
  config.cassette_library_dir = 'spec/vcr'
  config.hook_into :webmock
  # look for instances of these protected values showing up in our VCR requests
  # and filter them out with e.g. "<<SALESFORCE_USERNAME>>"
  %w[
    SALESFORCE_INSTANCE_URL
    SALESFORCE_USERNAME
    SALESFORCE_PASSWORD
    SALESFORCE_SECURITY_TOKEN
    SALESFORCE_CLIENT_SECRET
    SALESFORCE_CLIENT_ID
    EASYPOST_API_KEY
  ].each do |val|
    config.filter_sensitive_data("<<#{val}>>") do
      ENV[val]
    end
  end

  %w[
    SALESFORCE_USERNAME
    SALESFORCE_PASSWORD
  ].each do |val|
    config.filter_sensitive_data("<<#{val}>>") do
      CGI.escape(ENV[val])
    end
  end

  config.filter_sensitive_data('<<ACCESS_TOKEN>>') do |interaction|
    begin
      j = JSON.parse(interaction.response.body)
      # puts '*'*20
      # puts j.try(:[], 'access_token')
      # puts '*'*20
      j.try(:[], 'access_token')
    rescue JSON::ParserError, TypeError
      nil
    end
  end

  config.filter_sensitive_data('<<ACCESS_TOKEN>>') do |interaction|
    h = interaction.request.headers
    h['Authorization'].first.split('OAuth ').last if h['Authorization']&.first
  end

  # Uncomment this line to force VCR to record all new cassettes
  # config.default_cassette_options = { record: :new_episodes }

  # needed for codeclimate to work
  config.ignore_hosts 'codeclimate.com'
end
