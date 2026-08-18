# frozen_string_literal: true

class Api::V1::HousingCounselorController < ApiController
  before_action :authenticate_user!

  def agencies
    render json: { agencies: Force::HousingCounselorService.agencies }
  end

  # Authenticate housing counselor access to applicant contact ID in JWT
  def access
    result = Force::HousingCounselorService.authorize_access(
      token: params[:t] || params[:token],
      counselor_contact_id: current_user.salesforce_contact_id,
    )
    unless result
      Rails.logger.info(
        'HousingCounselorController#access: ' \
        "Access denied for current user with contact ID=#{current_user.salesforce_contact_id}",
      )
      render json: { error: 'forbidden' }, status: :forbidden
      return
    end

    Rails.logger.info(
      'HousingCounselorController#access: ' \
      "Access granted for applicant contact ID=#{result[:applicant_contact_id]} " \
      "and housing counselor contact ID=#{result[:counselor_contact_id]}",
    )
    render json: { success: true }
  rescue JsonWebTokenService::InvalidTokenError => e
    Rails.logger.info(
      'HousingCounselorController#access: ' \
      "invalid JWT: #{e.message}",
    )
    render json: { error: 'unauthorized' }, status: :unauthorized
  end
end
