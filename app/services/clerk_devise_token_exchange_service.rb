# frozen_string_literal: true

# Provide Devise token for Clerk users to ease migration to Clerk
class ClerkDeviseTokenExchangeService
  class ExchangeError < StandardError; end
  class MissingSalesforceContactIdError < ExchangeError; end
  class MissingClerkUserIdError < ExchangeError; end
  class MissingEmailError < ExchangeError; end
  class DeviseClerkUserConflictError < ExchangeError; end

  attr_reader :clerk_user_id

  def self.exchange_token!(clerk_user_id:)
    new(clerk_user_id:).exchange_token!
  end

  def initialize(clerk_user_id:)
    raise MissingClerkUserIdError, 'Missing Clerk user ID' if clerk_user_id.blank?

    @clerk_user_id = clerk_user_id
    clerk_email
    clerk_salesforce_contact_id
  end

  def exchange_token!
    user = find_or_create_user!
    { user: user, auth_headers: user.create_new_auth_token }
  end

  private

  def find_or_create_user!
    user = User.find_by(clerk_user_id: clerk_user_id)
    user ||= User.find_by(salesforce_contact_id: clerk_salesforce_contact_id)
    return reconcile_user!(user) if user

    create_placeholder_user!(clerk_email)
  end

  def reconcile_user!(user)
    if user.clerk_user_id.present? && user.clerk_user_id != clerk_user_id
      raise ClerkDeviseTokenExchangeService::DeviseClerkUserConflictError,
            "Clerk User ID conflict for user #{user.id} - " \
            "db: #{user.clerk_user_id}, clerk: #{clerk_user_id}"
    end

    if user.salesforce_contact_id.blank?
      raise ClerkDeviseTokenExchangeService::MissingSalesforceContactIdError,
            "Missing Salesforce Contact ID for user #{user.id}"
    end

    if user.salesforce_contact_id != clerk_salesforce_contact_id
      raise ClerkDeviseTokenExchangeService::DeviseClerkUserConflictError,
            "Salesforce Contact ID conflict for user #{user.id}: - " \
            "db: #{user.salesforce_contact_id}, clerk: #{clerk_salesforce_contact_id}"
    end

    attrs = {}
    attrs[:clerk_user_id] = clerk_user_id if user.clerk_user_id.blank?
    # email address may be different if user updated their email address via Clerk
    attrs[:email] = clerk_email if clerk_email.present? && user.email != clerk_email
    user.update!(attrs)
    user
  end

  # User does not exist in database (because they registered an account via Clerk),
  # so we create a placeholder database row to allow us to generate devise tokens and
  # track application file uploads with user.temp_session_id
  def create_placeholder_user!(email)
    password = "#{SecureRandom.alphanumeric(16)}a1"
    user = User.new(
      email: email,
      uid: email,
      provider: 'email',
      password: password,
      password_confirmation: password,
      clerk_user_id: clerk_user_id,
      salesforce_contact_id: clerk_salesforce_contact_id,
    )
    user.skip_confirmation!
    user.save!
    user
  end

  def clerk_email
    return @clerk_email if @clerk_email.present?

    @clerk_email = ClerkService.email_address(clerk_user_id)
  end

  def clerk_salesforce_contact_id
    return @clerk_salesforce_contact_id if @clerk_salesforce_contact_id.present?

    @clerk_salesforce_contact_id = ClerkService.salesforce_contact_id(clerk_user_id)
  end
end
