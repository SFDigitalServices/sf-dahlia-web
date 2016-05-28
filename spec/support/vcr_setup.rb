VCR.configure do |config|
  config.cassette_library_dir = 'spec/vcr'
  config.hook_into :webmock
  # look for instances of these protected values showing up in our VCR requests
  # and filter them out with e.g. "<<SALESFORCE_USERNAME>>"
  %w[
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

    # needed for codeclimate to work
    config.ignore_hosts 'codeclimate.com'
  end
end
