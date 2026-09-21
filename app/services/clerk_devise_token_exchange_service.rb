# frozen_string_literal: true

class ClerkDeviseTokenExchangeService
  class ExchangeError < StandardError; end
  class MissingClerkUserIdError < ExchangeError; end
  class MissingEmailError < ExchangeError; end
  class DeviseClerkUserConflictError < ExchangeError; end

  attr_reader :clerk_user_id

  def self.exchange_token!(clerk_user_id:)
    new(clerk_user_id:).exchange_token!
  end

  def initialize(clerk_user_id:)
    @clerk_user_id = clerk_user_id
  end

  def exchange_token!
    raise MissingClerkUserIdError, 'Missing Clerk user ID' if clerk_user_id.blank?

    email = clerk_email
    user = find_or_create_user!(email)
    { user: user, auth_headers: user.create_new_auth_token }
  end

  private

  def clerk_email
    email = ClerkService.email_address(clerk_user_id).to_s.strip.downcase
    raise MissingEmailError, 'User has missing email' if email.blank?

    email
  rescue StandardError => e
    raise MissingEmailError, e.message
  end

  def find_or_create_user!(email)
    user = User.find_by(clerk_user_id: clerk_user_id)
    user ||= User.find_by(salesforce_contact_id: clerk_salesforce_contact_id)
    return reconcile_user!(user, email) if user

    create_placeholder_user!(email)
  end

  def reconcile_user!(user, email)
    if user.clerk_user_id.present? && user.clerk_user_id != clerk_user_id
      raise DeviseClerkUserConflictError,
            "Clerk ID and email conflict: #{user.clerk_user_id} #{clerk_user_id}"
    end

    if user.salesforce_contact_id.present? &&
       user.salesforce_contact_id != clerk_salesforce_contact_id
      raise DeviseClerkUserConflictError,
            'Salesforce Contact ID conflict: ' \
            "#{user.salesforce_contact_id} #{clerk_salesforce_contact_id}"
    end

    attrs = {}
    attrs[:clerk_user_id] = clerk_user_id if user.clerk_user_id.blank?
    # email address may be different if user updated their email address via Clerk
    attrs[:email] = email if user.email != email.downcase
    user.update!(attrs)
    user
  end

  # User does not exist in database (because they registered an account via Clerk),
  # so we create a placeholder database row to allow us to generate devise tokens and
  # track application file uploads with user.temp_session_id
  def create_placeholder_user!(email)
    password = SecureRandom.alphanumeric(16)
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

  def clerk_salesforce_contact_id
    return @clerk_salesforce_contact_id if @clerk_salesforce_contact_id.present?

    @clerk_salesforce_contact_id = ClerkService.salesforce_contact_id(clerk_user_id)
  rescue StandardError => e
    Rails.logger.info(
      "Clerk user #{clerk_user_id} has no Salesforce contact ID during Devise token exchange: #{e.message}",
    )
    @clerk_salesforce_contact_id = nil
  end
end
