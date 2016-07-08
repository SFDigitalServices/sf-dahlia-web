module SalesforceService
  # encapsulate all Salesforce ShortForm querying functions
  class ShortFormService < SalesforceService::Base
    def self.check_household_eligibility(listing_id, params)
      endpoint = "/Listing/EligibilityCheck/#{listing_id}"
      %i(household_size incomelevel).each do |k|
        params[k] = params[k].to_i if params[k].present?
      end
      api_get(endpoint, params)
    end

    def self.create(params)
      api_post('/shortForm', params)
    end

    def self.get(id)
      api_get("/shortForm/#{id}")
    end

    def self.attach_file(application_id, file)
      self.headers = { Name: file.name, ContentType: file.content_type }
      api_post("/shortForm/file/#{application_id}", file.file)
    end
  end
end
