# frozen_string_literal: true

# RESTful JSON API to retrieve data for My Account
class Api::V1::AccountController < ApiController
  before_action :authenticate_user!, except: %i[confirm check_account]

  def my_applications
    applications = map_listings_to_applications(current_user_applications)
    render json: { applications: }
  end

  def update
    contact = account_params
    contact[:contactID] = current_user.salesforce_contact_id
    if ENV['TEST_ENVIRONMENT'].to_s.casecmp('true').zero?
      web_app_id = "test-#{current_user.id}"
    else
      web_app_id = current_user.id
    end
    contact[:webAppID] = web_app_id
    salesforce_contact = Force::AccountService.create_or_update(contact.as_json)
    Emailer.account_update(current_user).deliver_later
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
    unless Rails.env.development? || ENV['SAUCE_URL']
      return render plain: 'Forbidden', status: 403
    end

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
    Force::ShortFormService.get_for_user(current_user.salesforce_contact_id)
  end

  def map_listings_to_applications(applications)
    listing_ids = applications.collect { |a| a['listingID'] }.uniq.sort
    listings = Force::ListingService.listings(ids: listing_ids.join(','))
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
