# RESTful JSON API to retrieve data for My Account
class Api::V1::AccountController < ApiController
  before_action :authenticate_user!

  def my_applications
    applications = current_user_applications
    listing_ids = applications.collect { |a| a['listingID'] }.uniq
    listings = ListingService.listings(listing_ids.join(','))
    render json: {
      applications: applications,
      listings: listings,
    }
  end

  private

  def current_user_applications
    ShortFormService.get_for_user(current_user.salesforce_contact_id)
  end
end
