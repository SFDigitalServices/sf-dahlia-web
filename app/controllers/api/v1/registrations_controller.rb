# Devise registrations controller API endpoints
class Api::V1::RegistrationsController < Devise::RegistrationsController
  clear_respond_to
  respond_to :json
end
