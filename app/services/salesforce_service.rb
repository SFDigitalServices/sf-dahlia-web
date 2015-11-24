require 'restforce'
# encapsulate all Salesforce querying functions in one handy service
class SalesforceService
  def self.client
    Restforce.new
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
    # TODO: could have smarter error catching than this?
    response = client.get(endpoint, params)
    response.body
  rescue
    []
  end
end
