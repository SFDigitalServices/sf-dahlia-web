# RESTful JSON API to query for short form actions
class Api::V1::ShortFormController < ApiController
  ShortFormService = SalesforceService::ShortFormService
  before_action :authenticate_user!,
                only: %i(show_application update_application delete_application)

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
    @application = ShortFormService.get(application_params[:id])
    return render_unauthorized_error unless user_can_access(@application)
    render json: { application: @application }
  end

  def submit_application
    response = ShortFormService.create_or_update(application_params, contact_id)
    if response.present?
      if application_params[:primaryApplicant][:email].present? &&
         application_params[:status] == 'submitted'
        send_attached_files(response['id'])
        send_submit_app_confirmation(response['lotteryNumber'])
      end
      render json: response
    else
      render json: { error: ShortFormService.error }, status: 422
    end
  end

  def update_application
    @application = ShortFormService.get(application_params[:id])
    return render_unauthorized_error unless user_can_access(@application)
    return render_unauthorized_error if submitted?(@application)
    # calls same underlying method for submit
    submit_application
  end

  def delete_application
    @application = ShortFormService.get(params[:id])
    return render_unauthorized_error unless user_can_access(@application)
    return render_unauthorized_error if submitted?(@application)
    result = ShortFormService.delete(params[:id])
    render json: result
  end

  private

  def send_attached_files(application_id)
    files = UploadedFile.where(uploaded_file_params)
    ShortFormService.attach_files(application_id, files)
  end

  def send_submit_app_confirmation(lottery_number)
    Emailer.submission_confirmation(
      email: application_params[:primaryApplicant][:email],
      listing_id: application_params[:listingID],
      lottery_number: lottery_number,
    ).deliver_now
  end

  def user_can_access(application)
    contact_id = current_user.salesforce_contact_id
    ShortFormService.ownership?(contact_id, application)
  end

  def submitted?(application)
    ShortFormService.submitted?(application)
  end

  def render_unauthorized_error
    render json: { error: 'unauthorized' }, status: 401
  end

  def contact_id
    if current_user
      current_user.salesforce_contact_id
    elsif submitting_application_for_unconfirmed_user
      unconfirmed_user_salesforce_contact_id
    end
  end

  def submitting_application_for_unconfirmed_user
    params[:temp_session_id].present?
  end

  def unconfirmed_user_salesforce_contact_id
    u = User.find_by_temp_session_id(params[:temp_session_id])
    if u
      params.delete :temp_session_id
      u.update(temp_session_id: nil)
      return u.salesforce_contact_id
    end
  end

  def eligibility_params
    params.require(:eligibility)
          .permit(%i(householdsize incomelevel childrenUnder6))
  end

  def uploaded_file_params
    params.require(:uploaded_file)
          .permit(%i(file session_uid userkey listing_id
                     document_type preference))
  end

  def application_params
    params.require(:application)
          .permit(
            :id,
            {
              primaryApplicant: %i(
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
    {
      session_uid: uploaded_file_params[:session_uid],
      listing_id: uploaded_file_params[:listing_id],
      userkey: uploaded_file_params[:userkey],
      preference: uploaded_file_params[:preference],
      document_type: uploaded_file_params[:document_type],
      file: uploaded_file_params[:file].read,
      name: uploaded_file_params[:file].original_filename,
      content_type: uploaded_file_params[:file].content_type,
    }
  end
end
