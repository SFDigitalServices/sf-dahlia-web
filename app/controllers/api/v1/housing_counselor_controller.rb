# frozen_string_literal: true

class Api::V1::HousingCounselorController < ApiController
  include Clerk::Authenticatable
  include ActionController::Cookies

  before_action :authenticate_clerk_user!

  HC_SESSION_COOKIE_NAME = :hc_session
  HC_SESSION_DURATION = 2.hours

  def agencies
    render json: { agencies: Force::HousingCounselorService.agencies }
  end

  # Authenticate housing counselor access to applicant contact ID in JWT
  def access
    applicant_contact_id = JsonWebTokenService.decode_token(params[:t])['contactId']
    if applicant_contact_id.blank?
      Rails.logger.info(
        'HousingCounselorController#access: JWT missing applicant contact ID',
      )
      render json: { error: 'unauthorized' }, status: :unauthorized
      return
    end

    result = Force::HousingCounselorService.authorize_access(
      applicant_contact_id:,
      counselor_contact_id: current_user.salesforce_contact_id,
    )
    unless result
      Rails.logger.info(
        'HousingCounselorController#access: ' \
        "Access denied for applicant contact ID=#{applicant_contact_id} " \
        "and housing counselor contact ID=#{current_user.salesforce_contact_id}",
      )
      render json: { error: 'forbidden' }, status: :forbidden
      return
    end

    Rails.logger.info(
      'HousingCounselorController#access: ' \
      "Access granted for applicant contact ID=#{result[:applicant_contact_id]} " \
      "and housing counselor contact ID=#{result[:counselor_contact_id]}",
    )
    write_hc_session_cookie(result)
    render json: { success: true }
  rescue JsonWebTokenService::InvalidTokenError => e
    Rails.logger.info(
      'HousingCounselorController#access: ' \
      "invalid JWT: #{e.message}",
    )
    render json: { error: 'unauthorized' }, status: :unauthorized
  end

  private

  def write_hc_session_cookie(result)
    token = JsonWebTokenService.encode_token(
      {
        'hcId' => result[:counselor_contact_id],
        'appId' => result[:applicant_contact_id],
      },
      exp: HC_SESSION_DURATION.from_now,
    )
    cookies[HC_SESSION_COOKIE_NAME] = {
      value: token,
      httponly: true,
      secure: Rails.env.production?,
      same_site: :lax,
      expires: HC_SESSION_DURATION.from_now,
    }
  end

  def authenticate_clerk_user!
    @clerk_user_id = clerk&.user_id
    return if @clerk_user_id.present?

    render json: { error: 'Missing Clerk user ID' }, status: :unauthorized
  end

  def current_user
    @current_user ||= ClerkService::User.new(@clerk_user_id)
  end
end
