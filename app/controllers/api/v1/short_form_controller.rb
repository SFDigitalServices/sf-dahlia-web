# RESTful JSON API to query for short form actions
class Api::V1::ShortFormController < ApiController
  ShortFormService = SalesforceService::ShortFormService
  before_action :authenticate_user!,
                only: %i(
                  show_application
                  update_application
                  delete_application
                )

  def validate_household
    response = ShortFormService.check_household_eligibility(
      params[:listing_id],
      eligibility_params,
    )
    render json: response
  end

  ####### - File upload functions
  def upload_proof
    @uploaded_file = UploadedFile.create(uploaded_file_attrs)
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
    file_params = uploaded_file_params
    preference = file_params.delete(:preference)
    if user_signed_in?
      file_params.delete(:session_uid)
      file_params[:user_id] = current_user.id
    end
    @uploaded_file = UploadedFile.send(preference).find_by(file_params)
    if @uploaded_file
      @uploaded_file.destroy
      render json: { success: true }
    else
      render json: { success: false, errors: 'not found' }
    end
  end

  ####### - Short Form Application RESTful actions
  def show_application
    @application = ShortFormService.get(params[:id])
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
    response = ShortFormService.create_or_update(application_params, applicant_attrs)
    if response.present?
      attach_files_and_send_confirmation(response)
      if current_user && application_complete
        delete_draft_application(application_params[:listingID])
      end
      render json: response
    else
      render json: { error: ShortFormService.error }, status: 422
    end
  end

  # claim an anon-submitted application
  def claim_submitted_application
    @application = ShortFormService.get(application_params[:id])
    return render_unauthorized_error unless user_can_claim?(@application)
    # calls same underlying method for submit
    submit_application
  end

  def update_application
    @application = ShortFormService.get(application_params[:id])
    unless user_can_claim?(@application)
      return render_unauthorized_error unless user_can_access?(@application)
      return render_unauthorized_error if submitted?(@application)
    end
    # calls same underlying method for submit
    submit_application
  end

  def delete_application
    @application = ShortFormService.get(params[:id])
    return render_unauthorized_error unless user_can_access?(@application)
    return render_unauthorized_error if submitted?(@application)
    result = ShortFormService.delete(params[:id])
    render json: result
  end

  private

  def application_complete
    application_params[:status] == 'submitted'
  end

  def delete_draft_application(listing_id)
    applications = ShortFormService.get_for_user(user_contact_id)

    duplicate_draft_applications = applications.select do |app|
      app['listingID'] == listing_id && app['status'] == 'Draft'
    end

    duplicate_draft_applications.each do |app|
      ShortFormService.delete(app['id'])
    end
  end

  def attach_files_and_send_confirmation(response)
    if application_params[:status] == 'draft' && user_signed_in?
      attach_temp_files_to_user
    elsif initial_submission?
      send_attached_files(response['id'])
      send_submit_app_confirmation(response['lotteryNumber'])
    end
  end

  def initial_submission?
    return false if user_claiming_application?
    application_params[:primaryApplicant][:email].present? &&
      application_params[:status] == 'submitted'
  end

  def user_claiming_application?
    params[:action] == 'claim_submitted_application' ||
      (params[:action] == :update_application && user_can_claim?(@application))
  end

  def send_attached_files(application_id)
    if user_signed_in?
      files = UploadedFile.where(user_id: current_user.id)
    else
      files = UploadedFile.where(uploaded_file_params)
    end
    ShortFormService.attach_files(application_id, files)
    # now that files are saved in SF, remove temp uploads
    files.destroy_all
  end

  def attach_temp_files_to_user
    files = UploadedFile.where(uploaded_file_params)
    files.update_all(user_id: current_user.id)
  end

  def send_submit_app_confirmation(lottery_number)
    Emailer.submission_confirmation(
      email: application_params[:primaryApplicant][:email],
      listing_id: application_params[:listingID],
      lottery_number: lottery_number,
    ).deliver_now
  end

  def map_listing_to_application
    listing = ListingService.listing(@application['listingID'])
    @application['listing'] = listing
  end

  def find_listing_application
    @application = nil
    applications = ShortFormService.get_for_user(user_contact_id)
    applications.each do |application|
      if application['listingID'] == params[:listing_id]
        @application = application
      end
    end
  end

  def find_application_files
    @files = UploadedFile.where(
      user_id: current_user.id,
      listing_id: params[:listing_id],
    )
  end

  def user_can_access?(application)
    ShortFormService.ownership?(user_contact_id, application)
  end

  def user_can_claim?(application)
    ShortFormService.can_claim?(application) && submitted?(application)
  end

  def submitted?(application)
    ShortFormService.submitted?(application)
  end

  def render_unauthorized_error
    render json: { error: 'unauthorized' }, status: 401
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
    if @unconfirmed_user
      params.delete :temp_session_id
      @unconfirmed_user.update(temp_session_id: nil)
    end
  end

  def current_user_id
    if current_user
      current_user.id
    elsif @unconfirmed_user
      @unconfirmed_user.id
    end
  end

  def eligibility_params
    params.require(:eligibility)
          .permit(%i(householdsize incomelevel childrenUnder6))
  end

  def uploaded_file_params
    params.require(:uploaded_file)
          .permit(%i(file session_uid listing_id
                     document_type preference))
  end

  def application_params
    params.require(:application)
          .permit(
            :id,
            {
              primaryApplicant: %i(
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
                ethnicity
                race
                sexualOrientation
                sexualOrientationOther
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
              ),
            },
            {
              alternateContact: %i(
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
              ),
            },
            {
              householdMembers: %i(
                appMemberId
                firstName
                lastName
                hasSameAddressAsApplicant
                workInSf
                relationship
                dob
                address
                city
                state
                zip
              ),
            },
            :listingID,
            :displacedPreferenceNatKey,
            :certOfPreferenceNatKey,
            :liveInSfPreferenceNatKey,
            :workInSfPreferenceNatKey,
            :neighborhoodResidencePreferenceNatKey,
            :householdVouchersSubsidies,
            :referral,
            :annualIncome,
            :monthlyIncome,
            :agreeToTerms,
            :surveyComplete,
            :applicationSubmissionType,
            :applicationSubmittedDate,
            :status,
          )
  end

  def uploaded_file_attrs
    attrs = {
      session_uid: uploaded_file_params[:session_uid],
      listing_id: uploaded_file_params[:listing_id],
      preference: uploaded_file_params[:preference],
      document_type: uploaded_file_params[:document_type],
      file: uploaded_file_params[:file].read,
      name: uploaded_file_params[:file].original_filename,
      content_type: uploaded_file_params[:file].content_type,
    }
    attrs[:user_id] = current_user.id if user_signed_in?
    attrs
  end
end
