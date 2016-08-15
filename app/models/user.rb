# User authentication model
class User < ActiveRecord::Base
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
end
