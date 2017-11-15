module Force
  # encapsulate all Salesforce Account/Person querying functions
  class AccountService < Force::Base
    def create_or_update(params)
      api_post('/Person', params)
    end

    def get(id, params = nil)
      contact = api_get("/Person/#{id}", params)
      contact.present? ? contact : nil
    end
  end
end
