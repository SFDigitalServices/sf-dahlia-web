module SalesforceService
  # encapsulate all Salesforce ShortForm querying functions
  class ShortFormService < SalesforceService::Base
    def self.check_household_eligibility(listing_id, params)
      endpoint = "/Listing/EligibilityCheck/#{listing_id}"
      %i(household_size incomelevel childrenUnder6).each do |k|
        params[k] = params[k].to_i if params[k].present?
      end
      api_get(endpoint, params)
    end

    def self.create_or_update(params, contact_attrs)
      params[:primaryApplicant].merge!(contact_attrs)
      api_post('/shortForm', params)
    end

    def self.get(id)
      api_get("/shortForm/#{id}")
    end

    def self.get_for_user(contact_id)
      api_get("/shortForm/list/#{contact_id}")
    end

    def self.delete(id)
      api_post('/shortForm/delete/', id: id)
    end

    def self.attach_file(application_id, file, filename)
      headers = { Name: filename, 'Content-Type' => file.content_type }
      endpoint = "/shortForm/file/#{application_id}"
      api_post_with_headers(endpoint, file.file, headers)
    end

    def self.attach_files(application_id, files)
      files.each do |file|
        attach_file(application_id, file, file.descriptive_name)
      end
    end

    def self.ownership?(contact_id, application)
      contact_id == application['primaryApplicant']['contactId']
    end

    def self.submitted?(application)
      application['status'] == 'Submitted'
    end

    def self.can_claim?(application)
      submission_date = Date.parse(application['applicationSubmittedDate'])
      # you should not be trying to claim applications that were submitted in the past
      return false if submission_date < Time.zone.today
      application['primaryApplicant']['webAppID'].blank?
    end
  end
end
