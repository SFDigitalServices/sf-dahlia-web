# frozen_string_literal: true

class Api::V1::HousingCounselorController < ApiController
  include Clerk::Authenticatable
  include HousingCounselorSession

  before_action :require_housing_counselor_feature
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

    hc_session = current_hc_session(expected_app_id: applicant_contact_id)
    if hc_session&.dig(:app_id) == applicant_contact_id
      Rails.logger.info(
        'HousingCounselorController#access: ' \
        "reusing valid hc_session for applicant contact ID=#{applicant_contact_id}",
      )
      render json: { success: true }
      return
    end

    return if render_hc_session_refresh_failure?(applicant_contact_id)

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

  # The whole housing-counselor-delegate-access feature stays behind
  # FEATURE_FLAG until it's ready for production.
  def require_housing_counselor_feature
    return if hc_session_feature_enabled?

    render json: { error: 'not_found' }, status: :not_found
  end

  # current_hc_session (called from #access, above) already made a Salesforce
  # call if it found a matching-but-expired cookie to refresh - if that call
  # denied access or failed, render the appropriate response instead of
  # letting #access fall through to an identical authorize_access call, which
  # would just repeat the same check (and, on a transient failure, risk an
  # uncaught error escaping #access instead of the clean response the first
  # call's rescue already produced). Returns true if it rendered a response.
  def render_hc_session_refresh_failure?(applicant_contact_id)
    if hc_session_access_denied?
      Rails.logger.info(
        'HousingCounselorController#access: access denied on hc_session refresh ' \
        "for applicant contact ID=#{applicant_contact_id}",
      )
      render json: { error: 'forbidden' }, status: :forbidden
      return true
    end

    if hc_session_verification_failed?
      Rails.logger.info(
        'HousingCounselorController#access: hc_session refresh failed for ' \
        "applicant contact ID=#{applicant_contact_id}",
      )
      render json: { error: 'unauthorized' }, status: :unauthorized
      return true
    end

    false
  end

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
