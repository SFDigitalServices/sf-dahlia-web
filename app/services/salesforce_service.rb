require 'restforce'
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

  # get one detailed listing result by id
  def self.listing(id)
    api_get("/services/apexrest/Listings/#{id}").first
  end

  def self.api_get(endpoint, params = nil)
    response = oauth_client.get(endpoint, params)
    response.body
  rescue Restforce::UnauthorizedError
    if @retries > 0
      @retries -= 1
      oauth_token(true)
      retry
    else
      []
    end
  rescue StandardError
    []
  end

  def self.oauth_token(force = false)
    Rails.cache.fetch('salesforce_oauth_token', force: force) do
      auth = client.authenticate!
      auth.access_token
    end
  end
end
