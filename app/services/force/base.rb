require 'restforce'
require 'facets/hash/rekey'

module Force
  # encapsulate all Salesforce querying functions in one handy service
  class Base
    # attr_accessor :error

    # def initialize(opts = {})
    #   default_timeout = ENV['SALESFORCE_TIMEOUT'] ? ENV['SALESFORCE_TIMEOUT'].to_i : 10
    #   timeout = opts[:timeout] || default_timeout
    #   @client = restforce_client(timeout: timeout)
    #   @retries = opts[:retries] || 1
    #   @force = opts[:force] || false
    #   @parse_response = opts[:parse_response] || false
    #   @error = nil
    # end

    # def api_call(method, endpoint, params)
    #   @error = nil
    #   apex_endpoint = "/services/apexrest#{endpoint}"
    #   response = @client.send(method, apex_endpoint, params)
    #   process_response(response)
    # rescue Restforce::UnauthorizedError,
    #        Restforce::AuthenticationError,
    #        Faraday::ConnectionFailed,
    #        Faraday::TimeoutError => e
    #   rescue_api_call(e, method, endpoint, params)
    # end

    # def rescue_api_call(e, method, endpoint, params)
    #   if @retries > 0
    #     oauth_token(true) if e.is_a? Restforce::UnauthorizedError
    #     @retries -= 1
    #     api_call(method, endpoint, params)
    #   else
    #     @error = e.class.name
    #     message = params && params[:user_token_validation]
    #               ? 'user_token_validation' : nil
    #     # re-raise the same error
    #     raise e, message
    #   end
    # end

    # def api_get(endpoint, params = nil)
    #   @retries = 1
    #   api_call(:get, endpoint, params)
    # end

    # def cached_api_get(endpoint, params = nil)
    #   key = "#{endpoint}#{params ? '?' + params.to_query : ''}"
    #   force_refresh = @force || !ENV['CACHE_SALESFORCE_REQUESTS']
    #   if ENV['FREEZE_SALESFORCE_CACHE']
    #     expires_in = 10.years
    #   else
    #     expires_in = params ? 10.minutes : 1.day
    #   end
    #   Rails.cache.fetch(key, force: force_refresh, expires_in: expires_in) do
    #     api_get(endpoint, params)
    #   end
    # end

    # def api_post(endpoint, params = nil)
    #   @retries = 0
    #   @client = restforce_client(timeout: 25)
    #   api_call(:post, endpoint, params)
    # end

    # def api_delete(endpoint, params = nil)
    #   api_call(:delete, endpoint, params)
    # end

    # NOTE: Have to use custom Faraday connection to send headers.
    # def api_post_with_headers(endpoint, body = '', headers = {})
    #   @retries = 1
    #   status = nil
    #   response = nil
    #   while @retries > 0 && status != 200
    #     # NOTE: status will be 500 if there was an error with submission
    #     # e.g. DocumentType does not match Salesforce picklist
    #     # --
    #     # QUICK FIX for 401 issues: always force oauth_token refresh for these calls
    #     oauth_token(true)
    #     response = post_with_headers(endpoint, body, headers)
    #     status = response.status
    #     @retries -= 1
    #     if status == 401
    #       # refresh oauth_token
    #       oauth_token(true)
    #     end
    #   end
    #   response
    # end

    # def post_with_headers(endpoint, body, headers = {})
    #   conn = Faraday.new(url: ENV['SALESFORCE_INSTANCE_URL'])
    #   conn.post "/services/apexrest#{endpoint}" do |req|
    #     headers.each do |k, v|
    #       req.headers[k] = v
    #     end
    #     req.headers['Authorization'] = "OAuth #{oauth_token}"
    #     req.body = body.to_json
    #   end
    # end

    # def oauth_token(force = false)
    #   Rails.cache.fetch('salesforce_oauth_token', force: force) do
    #     auth = Restforce.new(timeout: 10).authenticate!
    #     auth.access_token
    #   end
    # end

    # private

    # def restforce_client(opts)
    #   Restforce.new(
    #     authentication_retries: 1,
    #     oauth_token: oauth_token,
    #     instance_url: ENV['SALESFORCE_INSTANCE_URL'],
    #     mashify: false,
    #     timeout: opts[:timeout],
    #   )
    # end

    # move all listing attributes to the root level of the hash
    # this is partly to not have to totally refactor our JS code
    # after Salesforce changes w/ ListingDetails
    # def flatten_response(body)
    #   return [] if body.blank?
    #   body.collect do |listing|
    #     listing.merge(listing['listing'] || {}).except('listing')
    #   end
    # end

    # def process_response(response)
    #   if @parse_response
    #     massage(flatten_response(response.body))
    #   else
    #     response.body
    #   end
    # end

    # # recursively remove "__c" and "__r" from all keys
    # def massage(h)
    #   if h.is_a?(Hash)
    #     hash_massage(h)
    #   elsif h.is_a?(Array) or h.is_a?(Restforce::Collection)
    #     h.map { |i| massage(i) }
    #   elsif h.is_a?(Symbol) or h.is_a?(String)
    #     string_massage(h)
    #   else
    #     h
    #   end
    # end

    # def hash_massage(h)
    #   return h['records'].map { |i| massage(i) } if h.include?('records')
    #   # massage each hash value
    #   h.each { |k, v| h[k] = massage(v) }
    #   # massage each hash key
    #   h.rekey do |key|
    #     massage(key)
    #   end
    # end

    # def string_massage(str)
    #   # calls .to_s so it works for symbols too
    #   str.to_s.gsub('__c', '').gsub('__r', '')
    # end
  end
end
