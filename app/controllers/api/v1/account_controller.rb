# frozen_string_literal: true

# RESTful JSON API to retrieve data for My Account
class Api::V1::AccountController < ApiController
  include Clerk::Authenticatable
  include HousingCounselorSession

  rescue_from HousingCounselorSession::VerificationUnavailableError do
    render json: { error: 'unauthorized' }, status: :unauthorized
  end

  before_action :authenticate_user!, except: %i[confirm check_account]
  before_action :reject_write_while_delegated,
                only: %i[update create_profile update_housing_counselor]

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
    contact_id = effective_contact_id.presence
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

  # Authentication for #my_applications stays whatever it already is
  # (Devise, unchanged) - this only adds "and if that signed-in user is
  # also a housing counselor per their hc_session cookie, use the
  # delegated applicant's contact instead of their own."
  def current_user_applications
    Force::ShortFormService.get_for_user(effective_contact_id)
  end

  # The applicant contact ID a housing counselor is currently delegated
  # access to, per their hc_session cookie, or the signed-in user's own
  # contact ID otherwise. Raises rather than silently falling back to the
  # signed-in user's own contact ID when an hc_session cookie exists but
  # Salesforce couldn't be reached to re-verify it - callers must not treat
  # "couldn't confirm" the same as "no delegated session."
  def effective_contact_id
    session = current_hc_session
    if hc_session_verification_failed?
      raise HousingCounselorSession::VerificationUnavailableError
    end

    session&.dig(:app_id) || current_user.salesforce_contact_id
  end

  # HC delegate access only ever grants read access to the applicant's data
  # (see #profile). Write actions must stay blocked while delegated: the
  # account-settings form is hydrated from #profile, so submitting it while
  # an hc_session is active would silently overwrite the housing
  # counselor's own Salesforce contact with the applicant's data.
  def reject_write_while_delegated
    return unless current_hc_session

    render json: { error: 'forbidden' }, status: :forbidden
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
