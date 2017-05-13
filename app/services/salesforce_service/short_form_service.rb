module SalesforceService
  # encapsulate all Salesforce ShortForm querying functions
  class ShortFormService < SalesforceService::Base
    def self.check_household_eligibility(listing_id, params)
      endpoint = "/Listing/EligibilityCheck/#{listing_id}"
      %i(householdsize childrenUnder6).each do |k|
        params[k] = params[k].present? ? params[k].to_i : 0
      end
      %i(incomelevel).each do |k|
        params[k] = params[k].present? ? params[k].to_f : 0
      end
      cached_api_get(endpoint, params)
    end

    def self.create_or_update(params, contact_attrs)
      params[:primaryApplicant].merge!(contact_attrs)
      api_post('/shortForm', params)
    end

    def self.get(id)
      api_get("/shortForm/#{id}")
    end

    def self.get_for_user(contact_id)
      apps = api_get("/shortForm/list/#{contact_id}")
      apps.compact.sort_by { |app| app['applicationSubmittedDate'] || '0' }.reverse
    end

    def self.delete(id)
      api_delete("/shortForm/delete/#{id}")
    end

    def self.attach_file(application_id, file, filename)
      headers = { Name: filename, 'Content-Type' => file.content_type }
      endpoint = "/shortForm/Attachment/#{application_id}"
      body = {
        'fileName': filename,
        'DocumentType': 'Word Doc',
        'Body': Base64.encode64(file.file),
        'ApplicationId': application_id,
      }
      api_post_with_headers(endpoint, body, headers)
    end

    def self.attach_files(application_id, files)
      files.each do |file|
        attach_file(application_id, file, file.descriptive_name)
      end
    end

    def self.ownership?(contact_id, application)
      contact_id == application['primaryApplicant']['contactId']
    end

    def self.can_claim?(session_uid, application)
      return false unless application['status'].casecmp('submitted').zero?
      metadata = JSON.parse(application['formMetadata'])
      # only claimable if they are in the same user session
      session_uid == metadata['session_uid']
    rescue
      false
    end

    def self.submitted?(application)
      application['status'] == 'Submitted'
    end
  end
end
