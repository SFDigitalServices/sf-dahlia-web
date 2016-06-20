# RESTful JSON API to query for address validation
class Api::V1::ShortFormController < ApiController
  def validate_household
    response = SalesforceService.check_household_eligibility(
      params[:listing_id],
      eligibility_params,
    )
    render json: response
  end

  private

  def eligibility_params
    params.require(:eligibility).permit(:householdsize, :incomelevel)
  end
end
