# RESTful JSON API to query for address validation
class Api::V1::ShortFormController < ApiController
  def validate_household
    response = SalesforceService.check_household_eligibility(
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

  private

  def eligibility_params
    params.require(:eligibility)
          .permit(:householdsize, :incomelevel)
  end

  def uploaded_file_params
    params.require(:uploaded_file)
          .permit(:file, :session_uid, :userkey, :preference)
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
