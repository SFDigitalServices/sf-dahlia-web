module SalesforceService
  # encapsulate all Salesforce Account/Person querying functions
  class AccountService < SalesforceService::Base
    def self.create_or_update(params)
      api_post('/Person', params)
    end

    def self.get(id)
      contact = api_get("/Person/#{id}")
      contact.present? ? contact : nil
    end
  end
end
