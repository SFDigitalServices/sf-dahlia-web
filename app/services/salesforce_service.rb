require 'restforce'
require 'facets/hash/rekey'

# encapsulate all Salesforce querying functions in one handy service
class SalesforceService
  @retries = 1

  def self.client
    Restforce.new
  end

  def self.oauth_client
    Restforce.new(
      authentication_retries: 0,
      oauth_token: oauth_token,
      instance_url: ENV['SALESFORCE_INSTANCE_URL'],
    )
  end

  # run a Salesforce SOQL query
  def self.query(q)
    client.query(q)
  end

  # get all open listings or specific set of listings by id
  # `ids` is a comma-separated list of ids
  def self.listings(ids = nil)
    params = ids.present? ? { ids: ids } : nil
    api_get('/services/apexrest/Listings', params)
  end

  # get listings with eligibility matches applied
  # filters:
  #  householdsize: n
  #  incomelevel: n
  #  childrenUnder6: n
  def self.eligible_listings(filters)
    results = api_get('/services/apexrest/Listings', filters)
    # sort the matched listings to the top of the list
    results.partition { |i| i['Does_Match'] }.flatten
  end

  # get one detailed listing result by id
  def self.listing(id)
    api_get("/services/apexrest/Listings/#{id}").first
  end

  def self.api_get(endpoint, params = nil)
    response = oauth_client.get(endpoint, params)
    # TODO: REMOVE when we have real images! ######
    response.body.each { |x| x['Image_URL'] = 'https://placehold.it/474x316' }
    ###############################################
    massage(response.body)
  rescue Restforce::UnauthorizedError
    if @retries > 0
      @retries -= 1
      oauth_token(true)
      retry
    else
      # p "UH OH -- Restforce error"
      []
    end
  rescue StandardError
    # p "UH OH -- StandardError #{e.message}"
    []
  end

  def self.oauth_token(force = false)
    Rails.cache.fetch('salesforce_oauth_token', force: force) do
      auth = client.authenticate!
      auth.access_token
    end
  end

  # recursively remove "__c" and "__r" from all keys
  def self.massage(h)
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

  def self.hash_massage(h)
    # massage each hash value
    h.each { |k, v| h[k] = massage(v) }
    # massage each hash key
    h.rekey do |key|
      massage(key)
    end
  end

  def self.string_massage(str)
    # calls .to_s so it works for symbols too
    str.to_s.gsub('__c', '').gsub('__r', '')
  end
end
