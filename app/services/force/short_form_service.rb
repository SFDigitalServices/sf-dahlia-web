# frozen_string_literal: true

module Force
  # encapsulate all Salesforce ShortForm querying functions
  class ShortFormService
    AGENT_CERTIFICATIONS =
      {
        bmr: 'BMR_Certified__c',
        dalp: 'DALP_Certified__c',
        mcc: 'MCC_Certified__c',
      }.freeze

    def self.check_household_eligibility(listing_id, params)
      endpoint = "/Listing/EligibilityCheck/#{listing_id}"
      %i[householdsize childrenUnder6].each do |k|
        params[k] = params[k].present? ? params[k].to_i : 0
      end
      %i[incomelevel].each do |k|
        params[k] = params[k].present? ? params[k].to_f : 0
      end
      Request.new.cached_get(endpoint, params)
    end

    def self.create_or_update(params, contact_attrs)
      params[:primaryApplicant].merge!(contact_attrs)
      Request.new(retries: 0, timeout: 20).post('/shortForm', params)
    end

    def self.get(id)
      Request.new.get("/shortForm/#{id}")
    end

    def self.get_for_user(contact_id)
      apps = Request.new.get("/shortForm/list/#{contact_id}")
      apps.compact.sort_by { |app| app['applicationSubmittedDate'] || '0' }.reverse
    end

    def self.find_listing_application(opts = {})
      applications = get_for_user(opts[:contact_id])
      application = applications.find do |app|
        app['listingID'] == opts[:listing_id]
      end
      if !application && opts[:autofill]
        application = autofill(applications, opts[:listing_id])
      end
      application
    end

    def self.autofill(applications, listing_id)
      # applications were already sorted by most recent in get_for_user
      application = applications.find do |app|
        app['status'] == 'Submitted'
      end
      application = autofill_reset(application, listing_id) if application
      application
    end

    def self.autofill_reset(application, listing_id)
      application = Hashie::Mash.new(application.as_json)
      reset = {
        autofill: true,
        id: nil,
        listingID: listing_id,
        status: 'Draft',
        applicationSubmittedDate: nil,
        answeredCommunityScreening: nil,
        lotteryNumber: nil,
        name: nil,
        agreeToTerms: nil,
        shortFormPreferences: [],
        alternateContact: { appMemberId: nil },
      }
      # reset income fields on apps > 30 days old
      if Date.parse(application[:applicationSubmittedDate]) < 30.days.ago
        reset[:householdVouchersSubsidies] = nil
        reset[:annualIncome] = nil
        reset[:monthlyIncome] = nil
      end
      application.merge(reset)
    end

    def self.delete(id)
      Request.new.delete("/shortForm/delete/#{id}")
    end

    def self.attach_file(application, file, filename)
      headers = { Name: filename, 'Content-Type' => file.content_type }
      endpoint =  "/shortForm/file/#{application['id']}"
      file_body = Base64.encode64(file.file)

      post_body = {
        fileName: filename,
        DocumentType: file.document_type,
        ApplicationId: application['id'],
        ApplicationMemberID: _short_form_pref_member_id(application, file),
        ApplicationPreferenceID: _short_form_pref_id(application, file),
      }

      # log just first few chars of file_body; otherwise will take up many log lines
      truncated_file_body = file_body ? "#{file_body[0, 20]}..." : ''
      Rails.logger.info "Api::V1::ShortFormService.attach_file Parameters: \
        #{post_body.merge(Body: truncated_file_body)}"

      post_body[:Body] = file_body
      Request.new.post_with_headers(endpoint, post_body, headers)
    end

    def self.queue_file_attachments(application_id, files)
      files.each do |file|
        ShortFormAttachmentJob.perform_later(application_id, file.id)
      end
    end

    def self.user_owns_app?(contact_id, application)
      contact_id == application['primaryApplicant']['contactId']
    end

    def self.can_claim?(session_uid, application)
      return false unless application['status'].casecmp('submitted').zero?
      metadata = JSON.parse(application['formMetadata'])
      # only claimable if they are in the same user session
      session_uid == metadata['session_uid']
    rescue StandardError
      false
    end

    def self.draft?(application)
      application['status'] == 'Draft'
    end

    def self.lending_institutions
      return @institutions if @institutions

      endpoint = '/services/apexrest/agents/'
      response = Request.new.cached_get(endpoint)
      @institutions = format_institutions(response, :bmr)
    end

    def self.lending_institutions_dalp
      return @dalp_institutions if @dalp_institutions

      endpoint = '/services/apexrest/agents?certified=dalp'
      response = Request.new.cached_get(endpoint)
      @dalp_institutions = format_institutions(response, :dalp)
    end

    def self._short_form_pref_id(application, file)
      _short_form_pref(application, file).try(:[], 'shortformPreferenceID')
    end

    def self._short_form_pref_member_id(application, file)
      _short_form_pref(application, file).try(:[], 'appMemberID')
    end

    def self._short_form_pref(application, file)
      application['shortFormPreferences'].find do |preference|
        preference['listingPreferenceID'] == file.listing_preference_id
      end
    end

    def self.format_institutions(data, certification)
      return [] unless data

      data.each_with_object({}) do |institution, institutions|
        agents = institution_agents(institution, certification)
        institutions[institution['Name']] = agents unless agents.blank?
        institutions
      end
    end

    def self.files(id)
      Request.new.query("SELECT Id,CreatedDate,Document_Type__c,Name FROM Attachment__c
                         WHERE Related_Application__c='#{CGI.escape(id)}'
                         ORDER BY CreatedDate DESC")
    end
    private_class_method :format_institutions

    def self.institution_agents(institution, certification)
      return unless institution['Contacts'] && institution['Contacts']['records']

      institution['Contacts']['records'].each_with_object([]) do |agent, arr|
        arr << format_agent(agent, certification)
        arr
      end.compact
    end
    private_class_method :format_institutions

    def self.format_agent(agent, certification)
      return unless agent.present? && agent[AGENT_CERTIFICATIONS[certification]]

      status = agent['Lending_Agent_Status__c']
      inactive_date = agent['Lending_Agent_Inactive_Date__c']
      agent.slice('Id', 'FirstName', 'LastName').merge(
        'Status' => status,
        'Lending_Agent_Inactive_Date' => inactive_date,
      )
    end
    private_class_method :format_agent
  end
end
