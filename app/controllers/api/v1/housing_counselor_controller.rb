# frozen_string_literal: true

class Api::V1::HousingCounselorController < ApiController
  include Clerk::Authenticatable
  include HousingCounselorSession

  before_action :authenticate_clerk_user!

  def agencies
    render json: { agencies: Force::HousingCounselorService.agencies }
  end

  # Authenticate housing counselor access to an applicant contact ID, either
  # from the delegate-link JWT in ?t= or, when that's absent (e.g. the HC
  # revisits a protected page without the link), from an existing hc_session
  # cookie. If a valid hc_session cookie already covers the requested
  # applicant, current_hc_session has already confirmed (and, if it had
  # expired, re-confirmed with Salesforce) that access still stands, so there
  # is no need to hit Salesforce again here.
  def access
    applicant_contact_id = requested_applicant_contact_id
    if applicant_contact_id.blank?
      Rails.logger.info(
        'HousingCounselorController#access: no applicant contact ID from JWT or hc_session',
      )
      render json: { error: 'unauthorized' }, status: :unauthorized
      return
    end

    if current_hc_session&.dig(:app_id) == applicant_contact_id
      Rails.logger.info(
        'HousingCounselorController#access: ' \
        "reusing valid hc_session for applicant contact ID=#{applicant_contact_id}",
      )
      render json: { success: true }
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
    write_hc_session_cookie(hc_id: result[:counselor_contact_id], app_id: result[:applicant_contact_id])
    render json: { success: true }
  rescue JsonWebTokenService::InvalidTokenError => e
    Rails.logger.info(
      'HousingCounselorController#access: ' \
      "invalid JWT: #{e.message}",
    )
    render json: { error: 'unauthorized' }, status: :unauthorized
  end

  private

  def requested_applicant_contact_id
    return JsonWebTokenService.decode_token(params[:t])['contactId'] if params[:t].present?

    current_hc_session&.dig(:app_id)
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
