# RESTful JSON API to query for address validation
class Api::V1::ShortFormController < ApiController
  def validate_household
    @response = SalesforceService.check_household_eligibility(
      params[:listing_id],
      params[:householdsize],
      params[:incomelevel],
    )
    render json: { household_eligibility: @response }
  end
end
