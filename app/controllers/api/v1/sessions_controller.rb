# Devise sessions controller API endpoints
class Api::V1::SessionsController < Devise::RegistrationsController
  # clear_respond_to
  respond_to :json
end
