# frozen_string_literal: true

# Reads and refreshes the hc_session cookie so a controller can know,
# without calling Salesforce on every request, whether the current housing
# counselor is still authorized to act on behalf of a given applicant.
# Include this in any controller that authenticates the current user via
# Clerk (it expects #current_user to respond to salesforce_contact_id).
#
# The cookie's own browser expiry (HC_SESSION_COOKIE_DURATION) is
# deliberately longer than the JWT's exp claim (HC_SESSION_DURATION), so
# staleness is governed entirely by the JWT's own exp claim: an
# expired-but-still-present cookie is sent back to the server and can be
# transparently re-checked, rather than the browser discarding it before
# that re-check ever gets a chance to run.
module HousingCounselorSession
  extend ActiveSupport::Concern

  included do
    include ActionController::Cookies
  end

  HC_SESSION_COOKIE_NAME = :hc_session
  HC_SESSION_DURATION = 2.hours
  # Deliberately longer than HC_SESSION_DURATION so the browser keeps
  # sending the cookie back after the JWT's own exp has passed, letting an
  # expired-but-present cookie reach the transparent Salesforce re-check
  # instead of the browser silently dropping it first.
  HC_SESSION_COOKIE_DURATION = 7.days

  # { hc_id:, app_id: } for the current, Salesforce-authorized housing
  # counselor session, or nil if there is none. An expired cookie is
  # transparently re-checked against Salesforce and, if access is still
  # granted, replaced with a fresh cookie; a cookie whose hcId does not match
  # the signed-in Clerk user is rejected and discarded rather than trusted.
  #
  # expected_app_id, when given, scopes an expired-cookie refresh to a stale
  # cookie whose own appId matches it. Without this, refreshing a cookie left
  # over from a different applicant would re-check Salesforce for the wrong
  # applicant on every request until it naturally falls out of scope.
  def current_hc_session(expected_app_id: nil)
    return @current_hc_session if defined?(@current_hc_session)

    @current_hc_session = resolve_hc_session(expected_app_id)
  end

  def write_hc_session_cookie(hc_id:, app_id:)
    token = JsonWebTokenService.encode_token(
      { 'hcId' => hc_id, 'appId' => app_id },
      exp: HC_SESSION_DURATION.from_now,
    )
    cookies[HC_SESSION_COOKIE_NAME] = {
      value: token,
      httponly: true,
      secure: Rails.env.production?,
      same_site: :lax,
      expires: HC_SESSION_COOKIE_DURATION,
    }
  end

  private

  def resolve_hc_session(expected_app_id)
    token = cookies[HC_SESSION_COOKIE_NAME]
    return nil if token.blank?

    data = JsonWebTokenService.decode_token(token, verify_expiration: true)
    session_if_current_user_matches(data)
  rescue JsonWebTokenService::ExpiredTokenError
    refresh_hc_session(token, expected_app_id)
  rescue JsonWebTokenService::InvalidTokenError => e
    Rails.logger.warn("HousingCounselorSession: rejecting invalid hc_session cookie: #{e.message}")
    discard_hc_session_cookie
    nil
  end

  # Re-checks Salesforce for a cookie whose exp has passed. The signature is
  # still verified by decode_token, so hcId/appId here can be trusted as
  # "once true" - what's no longer trusted is "still true", which is exactly
  # what authorize_access re-establishes.
  def refresh_hc_session(token, expected_app_id)
    stale = JsonWebTokenService.decode_token(token, verify_expiration: false)
    return nil if expected_app_id && stale['appId'] != expected_app_id
    return nil unless hc_id_matches_current_user?(stale['hcId'])

    result = Force::HousingCounselorService.authorize_access(
      applicant_contact_id: stale['appId'],
      counselor_contact_id: stale['hcId'],
    )
    unless result
      Rails.logger.info(
        'HousingCounselorSession: access no longer granted for applicant ' \
        "contact ID=#{stale['appId']} and housing counselor contact ID=#{stale['hcId']}",
      )
      discard_hc_session_cookie
      return nil
    end

    write_hc_session_cookie(hc_id: result[:counselor_contact_id],
                            app_id: result[:applicant_contact_id])
    { hc_id: result[:counselor_contact_id], app_id: result[:applicant_contact_id] }
  rescue JsonWebTokenService::InvalidTokenError => e
    Rails.logger.warn("HousingCounselorSession: rejecting invalid hc_session cookie: #{e.message}")
    discard_hc_session_cookie
    nil
  rescue Faraday::Error, Restforce::Error => e
    Rails.logger.warn(
      'HousingCounselorSession: Salesforce re-check failed, discarding hc_session ' \
      "cookie: #{e.message}",
    )
    discard_hc_session_cookie
    nil
  end

  def session_if_current_user_matches(data)
    return nil unless hc_id_matches_current_user?(data['hcId'])

    { hc_id: data['hcId'], app_id: data['appId'] }
  end

  def hc_id_matches_current_user?(hc_id)
    return true if hc_id.present? && hc_id == current_user&.salesforce_contact_id

    Rails.logger.warn(
      'HousingCounselorSession: hc_session cookie hcId does not match the signed-in user ' \
      "(expected #{current_user&.salesforce_contact_id.inspect}, got #{hc_id.inspect})",
    )
    discard_hc_session_cookie
    false
  end

  def discard_hc_session_cookie
    cookies.delete(HC_SESSION_COOKIE_NAME)
  end
end
