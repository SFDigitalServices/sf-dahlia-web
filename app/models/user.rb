# User authentication model
class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :timeoutable, :confirmable
  include DeviseTokenAuth::Concerns::User

  attr_accessor :initiate_email_reconfirmation

  def error_details(field)
    errors.details[field].collect { |i| i[:error] }
  end

  def email_changed?
    initiate_email_reconfirmation.present?
  end

  # override from Devise so that we can add hook into Salesforce update
  def self.confirm_by_token(confirmation_token)
    confirmable = find_first_by_auth_conditions(confirmation_token: confirmation_token)
    unless confirmable
      confirmation_digest = Devise.token_generator.digest(self, :confirmation_token, confirmation_token)
      confirmable = find_or_initialize_with_error_by(:confirmation_token, confirmation_digest)
    end

    # push email updates to salesforce if needed
    confirmable.sync_reconfirmation_with_salesforce

    confirmable.confirm if confirmable.persisted?
    confirmable
  end

  def sync_reconfirmation_with_salesforce
    return unless pending_reconfirmation? && persisted?
    # we have to grab the existing applicant first.
    # Salesforce requires that we repackage all of their info when making an update
    contact = Force::AccountService.get(salesforce_contact_id)
    return unless contact.present?
    Force::AccountService.create_or_update(
      webAppID: id,
      contactId: salesforce_contact_id,
      # send unconfirmed_email because it's about to be confirmed
      email: unconfirmed_email,
      firstName: contact['firstName'],
      middleName: contact['middleName'],
      lastName: contact['lastName'],
      DOB: contact['DOB'],
    )
  end

  # https://github.com/plataformatec/devise#activejob-integration
  def send_devise_notification(notification, *args)
    devise_mailer.send(notification, self, *args).deliver_later
  end
end
