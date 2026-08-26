# frozen_string_literal: true

# RESTful JSON API to retrieve data for My Account
class Api::V1::AccountController < ApiController
  include Clerk::Authenticatable
  before_action :authenticate_user!, except: %i[confirm check_account]

  def my_applications
    applications = map_listings_to_applications(current_user_applications)
    render json: { applications: }
  end

  def update
    contact = account_params

    if !AccountValidationService.valid_dob?(account_params[:DOB])
      render json: { error: 'Invalid DOB' }, status: :unprocessable_entity
      return
    end

    contact[:contactID] = current_user.salesforce_contact_id
    contact[:webAppID] = current_user.id
    salesforce_contact = Force::AccountService.create_or_update(contact.as_json)
    Emailer.account_update(current_user).deliver_later
    render json: { contact: salesforce_contact }
  end

  def profile
    contact_id = current_user.salesforce_contact_id.presence
    contact = contact_id &&
              Force::AccountService.get(contact_id, { user_token_validation: true })
    if contact.blank?
      render json: { error: 'Could not get Salesforce contact ID' }, status: :not_found
      return
    end

    render json: {
      success: true,
      data: contact.merge('id' => current_user.id, 'uid' => contact['email']),
    }
  end

  def create_profile
    contact_params =
      params.require(:contact).permit(:firstName, :middleName, :lastName, :DOB)
    unless AccountValidationService.valid_dob?(contact_params[:DOB])
      render json: { error: 'User has invalid DOB' }, status: :unprocessable_entity
      return
    end

    email = current_user.email
    if email.blank?
      render json: { error: 'User has missing email' }, status: :unprocessable_entity
      return
    end

    contact = contact_params.as_json.merge(
      'email' => email,
      'webAppID' => current_user.id,
    )
    salesforce_contact = Force::AccountService.create_or_update(contact)
    contact_id = salesforce_contact.present? ? salesforce_contact['contactId'] : nil
    if contact_id.blank?
      render json: { error: 'User has missing Salesforce contact ID' }, status: :bad_gateway
      return
    end

    ClerkService.store_salesforce_contact_id(current_user.id, contact_id)
    render json: { contact: salesforce_contact }
  end

  def update_housing_counselor
    contact = account_params
    access = contact[:housingCounselingAgencyId].presence
    agency_id = access
    # If no agency id exists, get the current agency id from Salesforce for the revoke emails
    unless agency_id
      current_agency = Force::AccountService.get(current_user.salesforce_contact_id)
      agency_id = current_agency && current_agency['housingCounselingAgencyId']
    end

    contact[:contactID] = current_user.salesforce_contact_id
    contact[:webAppID] = current_user.id
    salesforce_contact = Force::AccountService.create_or_update(contact.as_json)

    DahliaBackend::MessageService.send_housing_counselor_access(
      housing_counselor_action: access ? 'ACCESS_GRANTED' : 'ACCESS_REVOKED',
      contact_id: current_user.salesforce_contact_id,
      agency_id: agency_id,
    )

    render json: { contact: salesforce_contact }
  end

  def check_account
    if User.find_by_email(params[:email]&.downcase)
      render json: { account_exists: true }
    else
      render json: { account_exists: false }
    end
  end

  # this method is probably not used anywhere
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

  def authenticate_user!(*args)
    return super unless %w[profile create_profile update_housing_counselor].include?(action_name)

    @clerk_user_id = clerk&.user_id
    if @clerk_user_id.blank?
      render json: { error: 'Invalid Clerk session' }, status: :unauthorized
      return
    end

    if action_name == 'update_housing_counselor' && current_user.salesforce_contact_id.blank?
      render json: { error: 'Could not get Salesforce contact ID' }, status: :not_found
    end
  end

  def current_user
    return super if @clerk_user_id.blank?

    @current_user ||= ClerkService::User.new(@clerk_user_id)
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
      .permit(
        :firstName,
        :middleName,
        :lastName,
        :DOB,
        :email,
        :phone,
        :phoneType,
        :alternatePhone,
        :alternatePhoneType,
        :housingCounselingAgencyId,
      )
  end
end
