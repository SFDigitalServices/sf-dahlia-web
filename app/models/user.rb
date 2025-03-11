# User authentication model
class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :timeoutable, :confirmable

  validate :password_complexity

  validates :email, presence: true, uniqueness: { case_sensitive: false }

  include DeviseTokenAuth::Concerns::User

  def error_details(field)
    errors.details[field].collect { |i| i[:error] }
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

  # utility function to move a user back to unconfirmed state and resend confirmation instructions
  # optionally expire the token so that the user has to request a new one
  def move_to_unconfirmed(expire_token: false)
    self.update_columns(confirmed_at: nil, confirmation_sent_at: nil)
    self.generate_confirmation_token!
    if expire_token
      self.update_columns(confirmation_sent_at: 3.days.ago)
    end
    self.send_confirmation_instructions
  end

  private

  def password_complexity
    return if password.nil?

    # password length is handled internally by Devise
    unless password.match(/[A-Za-z]/)
      errors.add(:password, "must include at least one letter")
    end

    unless password.match(/\d/)
      errors.add(:password, "must include at least one number")
    end
  end
end
