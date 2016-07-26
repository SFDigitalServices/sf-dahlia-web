# RESTful JSON API to retrieve data for My Account
class Api::V1::AccountController < ApiController
  ShortFormService = SalesforceService::ShortFormService
  before_action :authenticate_user!

  def my_applications
    render json: { applications: current_user_applications }
  end

  private

  def current_user_applications
    ShortFormService.get_for_user(current_user.salesforce_contact_id)
  end
end
