# RESTful JSON API to retrieve data for My Account
class Api::V1::AccountController < ApiController
  before_action :authenticate_user!, except: %i(confirm check_account)

  def my_applications
    applications = map_listings_to_applications(current_user_applications)
    render json: { applications: applications }
  end

  def update
    contact = account_params
    contact[:contactID] = current_user.salesforce_contact_id
    contact[:webAppID] = current_user.id
    salesforce_contact = AccountService.create_or_update(contact)
    Emailer.account_update(current_user).deliver_now
    render json: { contact: salesforce_contact }
  end

  def check_account
    if User.find_by_email(params[:email])
      render json: { account_exists: true }
    else
      render json: { account_exists: false }
    end
  end

  def confirm
    return unless Rails.env.development?
    user = User.find_by_email(params[:email])
    if user
      user.confirm
      render plain: 'OK'
    else
      render plain: 'User not found'
    end
  end

  private

  def current_user_applications
    ShortFormService.get_for_user(current_user.salesforce_contact_id)
  end

  def map_listings_to_applications(applications)
    listing_ids = applications.collect { |a| a['listingID'] }.uniq
    listings = ListingService.listings(listing_ids.join(','))
    applications.each do |app|
      app['listing'] = listings.find { |l| l['listingID'] == app['listingID'] }
    end
  end

  def account_params
    params
      .require(:contact)
      .permit(:firstName, :middleName, :lastName, :DOB, :email)
  end
end
