# frozen_string_literal: true

# RESTful JSON API to query for short form actions
class Api::V1::ShortFormController < ApiController
  before_action :authenticate_user!,
                only: %i[
                  show_application
                  update_application
                  delete_application
                ]

  def validate_household
    response = Force::ShortFormService.check_household_eligibility(
      params[:listing_id],
      eligibility_params,
    )
    render json: response
  end

  ####### - File upload functions
  def upload_proof
    # get rid of any previous uploads for this preference
    # (e.g. from an abandoned session or if you unchecked the box)
    destroy_files_for_listing_preference
    @uploaded_file = UploadedFile.create_and_resize(uploaded_file_attrs)
    if @uploaded_file
      render json: {
        success: true,
        created_at: @uploaded_file.created_at,
        name: @uploaded_file.name,
      }
    else
      render json: { success: false, errors: @uploaded_file.errors.messages }
    end
  end

  def delete_proof
    success = destroy_files_for_listing_preference
    if success
      render json: { success: true }
    else
      render json: { success: false, errors: 'not found' }
    end
  end

  ####### - Short Form Application RESTful actions
  def show_application
    @application = Force::ShortFormService.get(params[:id])
    return render_unauthorized_error unless user_can_access?(@application)
    map_listing_to_application
    render json: { application: @application }
  end

  def show_listing_application_for_user
    return render json: { application: {} } unless current_user.present?
    find_listing_application
    find_application_files
    render json: {
      application: @application,
      files: @files,
    }
  end

  def submit_application
    # TODO: remove hotfix for preventing POST autosaves that don't come from
    # the initial entry into the application Name page
    return if params['autosave'] == 'true' && params['initialSave'] != 'true'
    response =
      Force::ShortFormService.create_or_update(application_params, applicant_attrs)
    if response.present?
      process_submit_app_response(response)
      render json: response
    else
      # handles rare case where salesforce returns a 200 OK with a blank response
      # only seen on QA and full
      render json: { error: 'Empty Response from Salesforce' }, status: 500
    end
  rescue Faraday::ClientError => e
    handle_submit_error(e)
  end

  def update_application
    return if params['autosave'] == 'true' && autosave_disabled
    @application = Force::ShortFormService.get(application_params[:id])
    return render_unauthorized_error unless user_can_access?(@application)
    return render_unauthorized_error if submitted?(@application)
    # calls same underlying method for submit
    submit_application
  end

  def claim_submitted_application
    @application = Force::ShortFormService.get(application_params[:id])
    return render_unauthorized_error unless user_can_claim?(@application)
    # calls same underlying method for submit
    submit_application
  end

  def delete_application
    @application = Force::ShortFormService.get(params[:id])
    return render_unauthorized_error unless user_can_access?(@application)
    return render_unauthorized_error if submitted?(@application)
    result = Force::ShortFormService.delete(params[:id])
    render json: result
  end

  def lending_institutions
    lending_institutions = Force::ShortFormService.lending_institutions
    render json: lending_institutions
  end

  def files
    uploaded_files = Force::ShortFormService.files(params[:id])
    local_files = UploadedFile.where(application_id: params[:id])
    status = uploaded_files.size == local_files.size ? 'uploaded' : 'missing'
    render json: { status: status }
  end

  private

  def process_submit_app_response(response)
    attach_files_and_send_confirmation(response)
    return unless current_user && application_complete
    delete_draft_application(application_params[:listingID])
  end

  def autosave_disabled
    ENV['AUTOSAVE'] == 'false'
  end

  def application_complete
    application_params[:status] == 'submitted'
  end

  def delete_draft_application(listing_id)
    applications = Force::ShortFormService.get_for_user(user_contact_id)

    duplicate_draft_applications = applications.select do |app|
      app['listingID'] == listing_id && app['status'].casecmp('draft').zero?
    end

    duplicate_draft_applications.each do |app|
      Force::ShortFormService.delete(app['id'])
    end
  end

  def attach_files_and_send_confirmation(response)
    email_draft_link(response) if first_time_draft?
    if draft_application? && user_signed_in?
      attach_temp_files_to_user
    elsif initial_submission?
      send_attached_files(response.try(:[], 'id'))
      send_submit_app_confirmation(response)
    end
  end

  def draft_application?
    application_params[:status].casecmp('draft').zero?
  end

  def first_time_draft?
    draft_application? && !application_params['id']
  end

  def initial_submission?
    return false if params[:action].to_s == 'claim_submitted_application'
    application_params[:status] == 'submitted'
  end

  def send_attached_files(application_id)
    if user_signed_in?
      files = UploadedFile.where(
        user_id: current_user.id,
        listing_id: application_params[:listingID],
      )
    else
      upload_params = uploaded_file_params.merge(
        user_id: nil,
        listing_id: application_params[:listingID],
      )
      files = UploadedFile.where(upload_params)
    end
    Force::ShortFormService.queue_file_attachments(application_id, files)
  end

  def attach_temp_files_to_user
    files = UploadedFile.where(uploaded_file_params)
    files.update_all(user_id: current_user.id)
  end

  def send_submit_app_confirmation(response)
    Emailer.submission_confirmation(
      locale: params[:locale],
      email: application_params[:primaryApplicant][:email],
      listing_id: application_params[:listingID],
      lottery_number: response['lotteryNumber'],
      first_name: response['primaryApplicant']['firstName'],
      last_name: response['primaryApplicant']['lastName'],
    ).deliver_later
  end

  def email_draft_link(response)
    Emailer.draft_application_saved(
      locale: params[:locale],
      email: application_params[:primaryApplicant][:email],
      listing_id: application_params[:listingID],
      first_name: response['primaryApplicant']['firstName'],
      last_name: response['primaryApplicant']['lastName'],
    ).deliver_later
  end

  def map_listing_to_application
    listing = Force::ListingService.listing(@application['listingID'])
    @application['listing'] = listing
  end

  def find_listing_application
    opts = {
      contact_id: user_contact_id,
      listing_id: params[:listing_id],
      autofill: params[:autofill],
    }
    @application = Force::ShortFormService.find_listing_application(opts)
  end

  def find_application_files
    @files = UploadedFile.where(
      user_id: current_user.id,
      listing_id: params[:listing_id],
    )
  end

  def user_can_access?(application)
    return false if application.empty?
    Force::ShortFormService.user_owns_app?(user_contact_id, application)
  end

  def user_can_claim?(application)
    # check if they are claiming a submitted application with a newly created account;
    # current session key should match the session that was used to create the application
    uid = params[:temp_session_id]
    Force::ShortFormService.can_claim?(uid, application)
  end

  def submitted?(application)
    Force::ShortFormService.submitted?(application)
  end

  def render_unauthorized_error
    render json: { error: 'unauthorized' }, status: 401
  end

  def handle_submit_error(e)
    if e.message.include?('APEX_ERROR') && e.message.exclude?('UNABLE_TO_LOCK_ROW')
      return render_err(e, status: 500, external_capture: true)
    end
    raise e.class, e.message
  end

  def applicant_attrs
    {
      contactId: user_contact_id,
      webAppID: current_user_id,
    }
  end

  def user_contact_id
    if current_user
      current_user.salesforce_contact_id
    elsif unconfirmed_user_with_temp_session_id
      @unconfirmed_user.salesforce_contact_id
    end
  end

  def unconfirmed_user_with_temp_session_id
    return false if params[:temp_session_id].blank?
    @unconfirmed_user = User.find_by_temp_session_id(params[:temp_session_id])
    return unless @unconfirmed_user
    params.delete :temp_session_id
    @unconfirmed_user.update(temp_session_id: nil)
  end

  def current_user_id
    if current_user
      current_user.id
    elsif @unconfirmed_user
      @unconfirmed_user.id
    end
  end

  def destroy_files_for_listing_preference
    file_params = {
      session_uid: uploaded_file_params[:session_uid],
      listing_id: uploaded_file_params[:listing_id],
      listing_preference_id: uploaded_file_params[:listing_preference_id],
      document_type: uploaded_file_params[:document_type],
    }
    %i[address rent_burden_index].each do |field|
      file_params[field] = uploaded_file_params[field] if uploaded_file_params[field]
    end
    rent_burden_type = uploaded_file_params[:rent_burden_type]
    if user_signed_in?
      file_params.delete(:session_uid)
      file_params[:user_id] = current_user.id
    end
    uploaded_files = UploadedFile.where(file_params)
    uploaded_files = uploaded_files.send(rent_burden_type) if rent_burden_type
    uploaded_files.destroy_all
  end

  def eligibility_params
    params.require(:eligibility)
          .permit(%i[householdsize incomelevel childrenUnder6])
          .to_h
  end

  def uploaded_file_params
    params.require(:uploaded_file)
          .permit(%i[file session_uid listing_id listing_preference_id
                     document_type address rent_burden_type rent_burden_index])
          .to_h
  end

  def application_params
    params.require(:application)
          .permit(
            :id,
            :applicationLanguage,
            {
              primaryApplicant: %i[
                contactId
                appMemberId
                language
                phone
                firstName
                lastName
                middleName
                noPhone
                phoneType
                additionalPhone
                alternatePhone
                alternatePhoneType
                email
                noEmail
                noAddress
                hasAltMailingAddress
                workInSf
                languageOther
                gender
                genderOther
                primaryLanguage
                otherLanguage
                raceEthnicity
                asianOther
                blackOther
                indigenousOther
                latinoOther
                menaOther
                pacificIslanderOther
                whiteOther
                sexualOrientation
                sexualOrientationOther
                isVeteran
                indigenousCentralSouthAmericaGroup
                indigenousNativeAmericanGroup
                hiv
                dob
                address
                city
                state
                zip
                mailingAddress
                mailingCity
                mailingState
                mailingZip
                preferenceAddressMatch
                xCoordinate
                yCoordinate
                whichComponentOfLocatorWasUsed
                candidateScore
                hasCompletedHomebuyerEducation
                isFirstTimeHomebuyer
                hasMinimumCreditScore
                hasLoanPreapproval
              ],
            },
            {
              alternateContact: %i[
                appMemberId
                language
                alternateContactType
                alternateContactTypeOther
                firstName
                lastName
                agency
                phone
                email
                languageOther
                mailingAddress
                mailingCity
                mailingState
                mailingZip
              ],
            },
            {
              householdMembers: %i[
                appMemberId
                firstName
                lastName
                middleName
                hasSameAddressAsApplicant
                noAddress
                workInSf
                relationship
                dob
                address
                city
                state
                zip
                preferenceAddressMatch
                xCoordinate
                yCoordinate
                whichComponentOfLocatorWasUsed
                candidateScore
              ],
            },
            :listingID,
            {
              shortFormPreferences: %i[
                listingPreferenceID
                recordTypeDevName
                appMemberID
                certificateNumber
                naturalKey
                preferenceProof
                optOut
                individualPreference
                shortformPreferenceID
                address
                city
                state
                zip
              ],
            },
            :answeredCommunityScreening,
            :adaPrioritiesSelected,
            :householdVouchersSubsidies,
            :referral,
            :hasPublicHousing,
            :hasMilitaryService,
            :hasDevelopmentalDisability,
            :annualIncome,
            :monthlyIncome,
            :totalMonthlyRent,
            :agreeToTerms,
            :applicationSubmissionType,
            :applicationSubmittedDate,
            :status,
            :externalSessionId,
            :formMetadata,
            :hasCompletedHomebuyerEducation,
            :isFirstTimeHomebuyer,
            :hasMinimumCreditScore,
            :hasLoanPreapproval,
            :lendingAgent,
            :homebuyerEducationAgency,
            :isNonPrimaryMemberVeteran,
            # TODO WIP these params eventually get posted salesforce endpoint '/shortForm' to Force::ShortFormService.create_or_update
            # check with Larry, that the endppoint can handle the new params
            :customEducatorScreeningAnswer,
            :customEducatorJobClassificationNumber,
          )
          .to_h
  end

  def uploaded_file_attrs
    attrs = {
      session_uid: uploaded_file_params[:session_uid],
      listing_id: uploaded_file_params[:listing_id],
      listing_preference_id: uploaded_file_params[:listing_preference_id],
      document_type: uploaded_file_params[:document_type],
      file: uploaded_file_params[:file],
      name: uploaded_file_params[:file].original_filename,
      content_type: uploaded_file_params[:file].content_type,
      address: uploaded_file_params[:address],
      rent_burden_type: uploaded_file_params[:rent_burden_type],
      rent_burden_index: uploaded_file_params[:rent_burden_index],
    }
    attrs[:user_id] = current_user.id if user_signed_in?
    attrs
  end
end
