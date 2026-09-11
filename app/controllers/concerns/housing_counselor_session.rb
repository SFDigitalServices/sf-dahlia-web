# frozen_string_literal: true

# Reads and refreshes the hc_session cookie so a controller can know,
# without calling Salesforce on every request, whether the current housing
# counselor is still authorized to act on behalf of a given applicant.
# Include this in any controller whose #current_user responds to
# salesforce_contact_id - the hc_session cookie's own hcId is checked
# against whatever that returns, so this works whether current_user comes
# from Clerk or from Devise (the auth mechanism itself is unrelated to
# whether the signed-in user happens to also be a housing counselor).
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

  # Raised by callers (see AccountController#effective_contact_id) that must
  # not silently treat "Salesforce couldn't be reached to re-verify an
  # expired hc_session cookie" the same as "there is no delegated session" -
  # the two require different responses (fail closed vs. fall back).
  class VerificationUnavailableError < StandardError; end

  # Raised when Salesforce was reachable and explicitly said the housing
  # counselor no longer has access (not a housing counselor, inactive,
  # applicant revoked/never granted access to that agency, or counselor
  # belongs to a different agency). Distinct from VerificationUnavailableError
  # - this is a confirmed "no", not "couldn't tell" - callers must fail
  # explicitly rather than silently falling back to the signed-in user's own
  # data.
  class AccessDeniedError < StandardError; end

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
  # expected_app_id, when given, scopes the lookup to a cookie whose own
  # appId matches it - both for a still-valid cookie and for a stale one
  # being refreshed. Without this, a cookie left over from a different
  # applicant would be returned (or re-checked against Salesforce) for the
  # wrong applicant.
  #
  # Deliberately not memoized: there is only ever one hc_session cookie, so
  # re-decoding it on a second call is cheap local HMAC verification, not
  # I/O, and it stays correct if a later call in the same request passes a
  # different expected_app_id. It also can't trigger a second Salesforce
  # call - after a successful refresh, write_hc_session_cookie's write is
  # visible to this same request's cookie jar, so the next call sees an
  # already-fresh, non-expired token and skips the refresh path entirely;
  # after a failed refresh, the cookie is discarded, so the next call just
  # sees no cookie.
  def current_hc_session(expected_app_id: nil)
    resolve_hc_session(expected_app_id)
  end

  # True once a Salesforce/Faraday error has prevented re-verifying an
  # expired hc_session cookie during the current request. Distinct from
  # current_hc_session returning nil for a legitimate reason (no cookie, or
  # one that doesn't belong to the signed-in user) - callers that need to
  # tell "couldn't confirm" apart from "no session" (see
  # AccountController#effective_contact_id) should check this too.
  def hc_session_verification_failed?
    @hc_session_verification_failed || false
  end

  # True once Salesforce has explicitly denied a housing counselor's access
  # while refreshing an expired hc_session cookie - see AccessDeniedError.
  def hc_session_access_denied?
    @hc_session_access_denied || false
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
    return nil if expected_app_id && data['appId'] != expected_app_id

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
      @hc_session_access_denied = true
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
    @hc_session_verification_failed = true
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
