# Be sure to restart your server when you modify this file.

# Configure sensitive parameters which will be filtered from the log file.
# Keep this list in sync with any new PII fields added to forms or API params.
Rails.application.config.filter_parameters += [
  :password,
  :password_confirmation,
  # contact / identity
  :email,
  :firstName,
  :lastName,
  :middleName,
  :phone,
  :alternatePhone,
  :additionalPhone,
  :dob,
  :DOB,
  # address fields
  :address,
  :address1,
  :mailingAddress,
  :street,
  :street1,
  :street2,
  :city,
  :state,
  :zip,
  :mailingCity,
  :mailingState,
  :mailingZip,
  # auth tokens
  :token,
  :auth_token,
  :reset_password_token,
  :confirmation_token,
  :unlock_token,
]
