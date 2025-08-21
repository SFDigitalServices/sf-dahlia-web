require 'restforce'
require 'facets/hash/rekey'

module Force
  # Requests to Salesforce API
  class Request
    attr_accessor :error

    def initialize(opts = {})
      default_timeout = ENV['SALESFORCE_TIMEOUT'] ? ENV['SALESFORCE_TIMEOUT'].to_i : 10
      @timeout = opts[:timeout] || default_timeout
      @retries = opts[:retries] || 1
      @parse_response = opts[:parse_response] || false
      @error = nil
      @cache = Rails.cache
      initialize_client
    end

    def get(endpoint, params = nil)
      send(:get, endpoint, params)
    end

    def env_variable_true(variable)
      variable.to_s.casecmp('true').zero?
    end

    def cached_get(endpoint, params = nil, force = false)
      key = "#{endpoint}#{params ? '?' + params.to_query : ''}"
      force = ActiveModel::Type::Boolean.new.cast(force)
      force_refresh = force || env_variable_true(ENV.fetch('CACHE_SALESFORCE_REQUESTS',
                                                           'true'))
      if env_variable_true(ENV.fetch('FREEZE_SALESFORCE_CACHE', nil))
        expires_in = 10.years
      else
        expires_in = params ? 10.minutes : 1.day
      end
      Rails.logger.info(
        "running cached_get for #{endpoint} with force set to #{force_refresh}",
      )
      @cache.fetch(key, force: force_refresh, expires_in:) do
        get(endpoint, params)
      end
    end

    def post(endpoint, params = nil)
      send(:post, endpoint, params)
    end

    def post_with_headers(endpoint, body = '', headers = {})
      # Always refresh auth to help prevent unauthorized errors
      refresh_oauth_token
      process_request do
        response = post_request_with_headers_and_auth(endpoint, body, headers)
        raise Restforce::UnauthorizedError if response.status == 401

        response
      end
    end

    def delete(endpoint, params = nil)
      send(:delete, endpoint, params)
    end

    def oauth_token(force_refresh = false)
      @cache.fetch('salesforce_oauth_token', force: force_refresh) do
        # temporarily set a short timeout for authentication
        @client.options[:timeout] = 10
        @client.authenticate!
        @client.options[:timeout] = @timeout
        # cache new access token
        @client.options[:oauth_token]
      end
    end

    def refresh_oauth_token
      oauth_token(true)
    end

    def query(soql)
      @client.query(soql)
    end

    private

    def initialize_client
      @client = Restforce.new(
        authentication_retries: 1,
        instance_url: ENV.fetch('SALESFORCE_INSTANCE_URL', nil),
        mashify: false,
        timeout: @timeout,
        api_version: ENV.fetch('SALESFORCE_API_VERSION', '61.0'),
      )
      # set oauth token from the cache, if we can
      # otherwise authenticate client created above
      @client.options[:oauth_token] = oauth_token
    end

    def api_url(endpoint)
      "/services/apexrest#{endpoint}"
    end

    def send(method, endpoint, params)
      apex_endpoint = api_url(endpoint)
      process_request(params) do
        response = @client.send(method, apex_endpoint, params)
        process_response(response)
      end
    end

    def process_request(params = nil)
      @error = nil
      retries = @retries
      begin
        yield
      rescue Restforce::UnauthorizedError,
             Restforce::AuthenticationError,
             Faraday::ConnectionFailed,
             Faraday::TimeoutError => e
        if retries > 0
          refresh_oauth_token if e.is_a? Restforce::UnauthorizedError
          Rails.logger.error(
            "Salesforce request error: #{e.class.name}. Retrying #{retries} more times.",
          )
          retries -= 1
          retry
        else
          Rails.logger.error "Salesforce request error: #{e.class.name}. No more retries."
          # raise the same error once we're out of retries
          process_error(e, params)
        end
      end
    end

    def process_error(e, params = nil)
      @error = e.class.name
      message = nil
      message = 'user_token_validation' if params && params[:user_token_validation]
      raise e, message
    end

    def process_response(response)
      if @parse_response
        massage(flatten_response(response.body))
      else
        response.body
      end
    end

    # move all listing attributes to the root level of the hash
    # this is partly to not have to totally refactor our JS code
    # after Salesforce changes w/ ListingDetails
    def flatten_response(body)
      return [] if body.blank?

      body.collect do |listing|
        listing.merge(listing['listing'] || {}).except('listing')
      end
    end

    # recursively remove "__c" and "__r" from all keys
    def massage(h)
      if h.is_a?(Hash)
        hash_massage(h)
      elsif h.is_a?(Array) or h.is_a?(Restforce::Collection)
        h.map { |i| massage(i) }
      elsif h.is_a?(Symbol) or h.is_a?(String)
        string_massage(h)
      else
        h
      end
    end

    def hash_massage(h)
      return h['records'].map { |i| massage(i) } if h.include?('records')

      # massage each hash value
      h.each { |k, v| h[k] = massage(v) }
      # massage each hash key
      h.rekey do |key|
        massage(key)
      end
    end

    def string_massage(str)
      # calls .to_s so it works for symbols too
      str.to_s.gsub('__c', '').gsub('__r', '')
    end

    def post_request_with_headers_and_auth(endpoint, body, headers = {})
      conn = Faraday.new(url: ENV.fetch('SALESFORCE_INSTANCE_URL', nil))
      apex_endpoint = api_url(endpoint)
      conn.post apex_endpoint do |req|
        headers.each do |k, v|
          req.headers[k] = v
        end
        req.headers['Authorization'] = "OAuth #{oauth_token}"
        req.body = body.to_json
      end
    end
  end
end
