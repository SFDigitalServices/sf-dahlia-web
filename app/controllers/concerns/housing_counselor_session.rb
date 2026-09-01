# frozen_string_literal: true

# Reads and refreshes the short-lived hc_session cookie so a controller can
# know, without calling Salesforce on every request, whether the current
# housing counselor is still authorized to act on behalf of a given
# applicant. Include this in any controller that authenticates the current
# user via Clerk (it expects #current_user to respond to
# salesforce_contact_id).
module HousingCounselorSession
  extend ActiveSupport::Concern

  included do
    include ActionController::Cookies
  end

  HC_SESSION_COOKIE_NAME = :hc_session
  HC_SESSION_DURATION = 2.hours

  # { hc_id:, app_id: } for the current, Salesforce-authorized housing
  # counselor session, or nil if there is none. An expired cookie is
  # transparently re-checked against Salesforce and, if access is still
  # granted, replaced with a fresh cookie; a cookie whose hcId does not match
  # the signed-in Clerk user is rejected and discarded rather than trusted.
  def current_hc_session
    return @current_hc_session if defined?(@current_hc_session)

    @current_hc_session = resolve_hc_session
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
      expires: HC_SESSION_DURATION.from_now,
    }
  end

  private

  def resolve_hc_session
    token = cookies[HC_SESSION_COOKIE_NAME]
    return nil if token.blank?

    data = JsonWebTokenService.decode_token(token, verify_expiration: true)
    session_if_current_user_matches(data)
  rescue JsonWebTokenService::ExpiredTokenError
    refresh_hc_session(token)
  rescue JsonWebTokenService::InvalidTokenError => e
    Rails.logger.warn("HousingCounselorSession: rejecting invalid hc_session cookie: #{e.message}")
    discard_hc_session_cookie
    nil
  end

  # Re-checks Salesforce for a cookie whose exp has passed. The signature is
  # still verified by decode_token, so hcId/appId here can be trusted as
  # "once true" - what's no longer trusted is "still true", which is exactly
  # what authorize_access re-establishes.
  def refresh_hc_session(token)
    stale = JsonWebTokenService.decode_token(token, verify_expiration: false)
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

    write_hc_session_cookie(hc_id: result[:counselor_contact_id], app_id: result[:applicant_contact_id])
    { hc_id: result[:counselor_contact_id], app_id: result[:applicant_contact_id] }
  rescue JsonWebTokenService::InvalidTokenError => e
    Rails.logger.warn("HousingCounselorSession: rejecting invalid hc_session cookie: #{e.message}")
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
