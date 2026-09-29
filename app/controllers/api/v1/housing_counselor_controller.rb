# frozen_string_literal: true

class Api::V1::HousingCounselorController < ApiController
  include Clerk::Authenticatable
  include HousingCounselorSession

  before_action :require_housing_counselor_feature
  before_action :authenticate_clerk_user!
  # Clearing hc_session should work regardless of the feature flag or Clerk
  # auth timing (e.g. called as part of sign-out, while the Clerk session may
  # already be ending) - see #clear_session.
  skip_before_action :require_housing_counselor_feature, only: :clear_session
  skip_before_action :authenticate_clerk_user!, only: :clear_session

  def agencies
    render json: { agencies: Force::HousingCounselorService.agencies }
  end

  # Authenticate housing counselor access to an applicant contact ID, either
  # from the delegate-link JWT in ?t= or, when that's absent (e.g. the HC
  # revisits a protected page without the link), from an existing hc_session
  # cookie.
  #
  # A delegate link (?t= present) always starts fresh: any existing
  # hc_session is discarded up front, and access is re-verified against
  # Salesforce every time with no reuse shortcut - a link click always
  # reflects the applicant's current access, even if it was granted to this
  # same applicant moments ago, or just revoked since the last click.
  # Ordinary protected-page browsing (no ?t=, including AccountController's
  # own use of current_hc_session) keeps the no-Salesforce-call-if-still-
  # valid optimization untouched - only this explicit "authorize me for this
  # applicant" action forces a fresh check every time.
  def access
    delegate_link_click = params[:t].present?
    discard_hc_session_cookie if delegate_link_click

    applicant_contact_id = requested_applicant_contact_id
    if applicant_contact_id.blank?
      Rails.logger.info(
        'HousingCounselorController#access: no applicant contact ID from JWT or hc_session',
      )
      render json: { error: 'unauthorized' }, status: :unauthorized
      return
    end

    return if !delegate_link_click && reuse_hc_session?(applicant_contact_id)

    authorize_and_write_session(applicant_contact_id)
  rescue JsonWebTokenService::InvalidTokenError => e
    Rails.logger.info(
      'HousingCounselorController#access: ' \
      "invalid JWT: #{e.message}",
    )
    render json: { error: 'unauthorized' }, status: :unauthorized
  end

  # Discards the hc_session cookie unconditionally. Clerk sign-in and
  # sign-out never reach a Rails endpoint on their own (unlike Devise's,
  # which clear hc_session directly - see Overrides::SessionsController), so
  # the frontend calls this explicitly instead: on sign-out, and after a
  # normal sign-in with no delegate link, so a stale hc_session never
  # survives into a fresh, undelegated session.
  def clear_session
    discard_hc_session_cookie
    render json: { success: true }
  end

  private

  # Only for the no-?t= fallback path (see #access) - true if an existing
  # hc_session already covers this applicant, or if refreshing it failed;
  # both cases have already rendered a response, so #access should not fall
  # through to a fresh authorize_access call.
  def reuse_hc_session?(applicant_contact_id)
    hc_session = current_hc_session(expected_app_id: applicant_contact_id)
    if hc_session&.dig(:app_id) == applicant_contact_id
      Rails.logger.info(
        'HousingCounselorController#access: ' \
        "reusing valid hc_session for applicant contact ID=#{applicant_contact_id}",
      )
      render json: { success: true }
      return true
    end

    render_hc_session_refresh_failure?(applicant_contact_id)
  end

  # Calls Salesforce fresh and either writes a new hc_session cookie (access
  # granted) or renders forbidden (denied) - reached both by the ?t= path,
  # which always calls this, and by the hc_session-refresh path, which only
  # reaches here once current_hc_session's own check found no valid session
  # to reuse.
  def authorize_and_write_session(applicant_contact_id)
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
  rescue Faraday::Error, Restforce::Error => e
    Rails.logger.warn(
      'HousingCounselorController#access: Salesforce authorization check failed: ' \
      "#{e.message}",
    )
    render json: { error: 'unauthorized' }, status: :unauthorized
  end

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
