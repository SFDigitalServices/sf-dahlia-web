# frozen_string_literal: true

module HousingCounselorSession
  extend ActiveSupport::Concern

  included do
    include ActionController::Cookies
  end

  FEATURE_FLAG = 'temp.all.housingCounselorAccess'

  class VerificationUnavailableError < StandardError; end
  class AccessDeniedError < StandardError; end

  HC_SESSION_COOKIE_NAME = :hc_session
  HC_SESSION_TOKEN_TYPE = 'hc_session'
  HC_SESSION_DURATION = 2.hours
  HC_SESSION_REFRESH_GRACE_PERIOD = 15.minutes
  HC_SESSION_COOKIE_DURATION = HC_SESSION_DURATION + HC_SESSION_REFRESH_GRACE_PERIOD

  def current_hc_session(expected_app_id: nil)
    return nil unless hc_session_feature_enabled?

    resolve_hc_session(expected_app_id)
  end

  def current_hc_session!(expected_app_id: nil)
    session = current_hc_session(expected_app_id:)
    raise VerificationUnavailableError if hc_session_verification_failed?
    raise AccessDeniedError if hc_session_access_denied?

    session
  end

  def hc_session_feature_enabled?
    Rails.configuration.unleash.is_enabled?(FEATURE_FLAG)
  end

  def hc_session_verification_failed?
    @hc_session_verification_failed || false
  end

  def hc_session_access_denied?
    @hc_session_access_denied || false
  end

  def write_hc_session_cookie(hc_id:, app_id:)
    clerk_session_id = current_clerk_session_id
    if clerk_session_id.blank?
      Rails.logger.warn(
        'HousingCounselorSession: not writing hc_session cookie without a Clerk session',
      )
      return false
    end

    cookies[HC_SESSION_COOKIE_NAME] = {
      value: encode_hc_session_token(hc_id:, app_id:, clerk_session_id:),
      httponly: true,
      secure: Rails.env.production?,
      same_site: :lax,
      expires: HC_SESSION_COOKIE_DURATION,
    }
    true
  end

  private

  def resolve_hc_session(expected_app_id)
    token = cookies[HC_SESSION_COOKIE_NAME]
    return nil if token.blank?

    claims = decode_hc_session_token(token, verify_expiration: true)
    hc_session_for_request(claims, expected_app_id)
  rescue JsonWebTokenService::ExpiredTokenError
    refresh_hc_session(token, expected_app_id)
  rescue JsonWebTokenService::InvalidTokenError => e
    reject_invalid_hc_session_token(e)
  end

  def refresh_hc_session(token, expected_app_id)
    stale_claims = decode_hc_session_token(token, verify_expiration: false)
    stale_session = hc_session_for_request(stale_claims, expected_app_id)
    return nil unless stale_session

    reauthorize_hc_session(stale_session)
  rescue JsonWebTokenService::InvalidTokenError => e
    reject_invalid_hc_session_token(e)
  rescue Faraday::Error, Restforce::Error => e
    Rails.logger.warn("HousingCounselorSession: Salesforce re-check failed: #{e.message}")
    @hc_session_verification_failed = true
    nil
  end

  def reauthorize_hc_session(stale_session)
    result = Force::HousingCounselorService.authorize_access(
      applicant_contact_id: stale_session[:app_id],
      counselor_contact_id: stale_session[:hc_id],
    )
    return deny_hc_session_access unless result

    fresh_session = {
      hc_id: result[:counselor_contact_id],
      app_id: result[:applicant_contact_id],
    }
    fresh_session if write_hc_session_cookie(**fresh_session)
  end

  def hc_session_for_request(claims, expected_app_id)
    clerk_session_id = current_clerk_session_id
    return nil if clerk_session_id.blank?
    return reject_hc_session_from_other_clerk_session if claims['sid'] != clerk_session_id
    return nil if expected_app_id && claims['appId'] != expected_app_id
    return nil unless hc_id_matches_current_user?(claims['hcId'])

    { hc_id: claims['hcId'], app_id: claims['appId'] }
  end

  def encode_hc_session_token(hc_id:, app_id:, clerk_session_id:)
    JsonWebTokenService.encode_token(
      { 'typ' => HC_SESSION_TOKEN_TYPE, 'hcId' => hc_id, 'appId' => app_id,
        'sid' => clerk_session_id },
      exp: HC_SESSION_DURATION.from_now,
    )
  end

  def decode_hc_session_token(token, verify_expiration:)
    claims = JsonWebTokenService.decode_token(token, verify_expiration:)
    unless claims['typ'] == HC_SESSION_TOKEN_TYPE
      raise JsonWebTokenService::InvalidTokenError, 'Not an hc_session token'
    end

    claims
  end

  def current_clerk_session_id
    return nil unless clerk_authenticatable?

    clerk&.session&.dig('sid')
  end

  def clerk_authenticatable?
    respond_to?(:clerk, true)
  end

  def hc_id_matches_current_user?(hc_id)
    return true if hc_id.present? && hc_id == current_user&.salesforce_contact_id

    if current_user.respond_to?(:salesforce_contact_id_lookup_failed?) &&
       current_user.salesforce_contact_id_lookup_failed?
      Rails.logger.warn(
        'HousingCounselorSession: could not verify hc_session cookie hcId - ' \
        'Clerk lookup of the signed-in user failed',
      )
      @hc_session_verification_failed = true
      return false
    end

    Rails.logger.warn(
      'HousingCounselorSession: discarding hc_session cookie whose hcId does not match ' \
      'the signed-in user',
    )
    discard_hc_session_cookie
    false
  end

  def reject_hc_session_from_other_clerk_session
    Rails.logger.info(
      'HousingCounselorSession: discarding hc_session cookie from a different ' \
      'Clerk session',
    )
    discard_hc_session_cookie
    nil
  end

  def reject_invalid_hc_session_token(error)
    Rails.logger.warn(
      "HousingCounselorSession: rejecting invalid hc_session cookie: #{error.message}",
    )
    discard_hc_session_cookie
    nil
  end

  def deny_hc_session_access
    Rails.logger.info(
      'HousingCounselorSession: Salesforce no longer grants hc_session access',
    )
    @hc_session_access_denied = true
    discard_hc_session_cookie
    nil
  end

  def discard_hc_session_cookie
    cookies.delete(HC_SESSION_COOKIE_NAME)
  end
end
