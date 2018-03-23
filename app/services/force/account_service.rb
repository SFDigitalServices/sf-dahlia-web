module Force
  # encapsulate all Salesforce Account/Person querying functions
  class AccountService
    def self.create_or_update(params)
      Request.new.post('/Person', params)
    end

    def self.get(id, params = nil)
      contact = Request.new.get("/Person/#{id}", params)
      contact.present? ? contact : nil
    end
  end
end
