require 'restforce'
require 'facets/hash/rekey'

module Force
  # Requests to Salesforce API
  class Request
    attr_accessor :error

    def initialize(opts = {}, client_class = Restforce)
      default_timeout = ENV['SALESFORCE_TIMEOUT'] ? ENV['SALESFORCE_TIMEOUT'].to_i : 10
      @timeout = opts[:timeout] || default_timeout
      @retries = opts[:retries] || 1
      @parse_response = opts[:parse_response] || false
      @error = nil
      initialize_client(client_class)
    end

    def get(endpoint, params = nil)
      send(:get, endpoint, params)
    end

    def cached_get(endpoint, params = nil, force = false)
      key = "#{endpoint}#{params ? '?' + params.to_query : ''}"
      force_refresh = force || !ENV['CACHE_SALESFORCE_REQUESTS']
      if ENV['FREEZE_SALESFORCE_CACHE']
        expires_in = 10.years
      else
        expires_in = params ? 10.minutes : 1.day
      end
      Rails.cache.fetch(key, force: force_refresh, expires_in: expires_in) do
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
      Rails.cache.fetch('salesforce_oauth_token', force: force_refresh) do
        # temporarily set a short timeout for authentication
        @client.options[:timeout] = 10
        # @client.authenticate! requests an oauth token, sets the received
        # token in @client's options, and returns the token request response
        auth_response_data = @client.authenticate!
        # restore the original timeout
        @client.options[:timeout] = @timeout
        auth_response_data.access_token
      end
    end

    def refresh_oauth_token
      oauth_token(true)
    end

    private

    def initialize_client(client_class)
      @client = client_class.new(
        authentication_retries: 1,
        instance_url: ENV['SALESFORCE_INSTANCE_URL'],
        mashify: false,
        timeout: @timeout,
      )
      # comment for devs, can maybe remove later:
      # if there is a cached token, then oauth_token here will simply return
      # the cached token and we will set it in the client's options.
      # if there is no cached token, then the call to oauth_token will call
      # @client.authenticate! which sets the oauth_token in the client's
      # options as part of its process, and then the call here to oauth_token
      # will still return that just-generated token, which we will set in
      # the client options, even though it was just set there. so, slightly
      # redundant, but not breaking anything
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
          retries -= 1
          retry
        else
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
      conn = Faraday.new(url: ENV['SALESFORCE_INSTANCE_URL'])
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
