# RESTful JSON API to query for address validation
class Api::V1::ShortFormController < ApiController
  def validate_household
    response = ShortFormService.check_household_eligibility(
      params[:listing_id],
      eligibility_params,
    )
    render json: response
  end

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

  def submit_application
    response = ShortFormService.create(application_params)
    if response.present?
      if application_params[:primaryApplicant][:email].present?
        Emailer.submission_confirmation(
          listing_id: application_params[:listingID],
          short_form_id: response['id'],
        ).deliver_now
      end
      render json: response
    else
      render json: { error: ShortFormService.error }, status: 422
    end
  end

  private

  def eligibility_params
    params.require(:eligibility)
          .permit(:householdsize, :incomelevel)
  end

  def uploaded_file_params
    params.require(:uploaded_file)
          .permit(:file, :session_uid, :userkey, :preference)
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
      userkey: uploaded_file_params[:userkey],
      preference: uploaded_file_params[:preference],
      file: uploaded_file_params[:file].read,
      name: uploaded_file_params[:file].original_filename,
      content_type: uploaded_file_params[:file].content_type,
    }
  end
end
