# frozen_string_literal: true

# The Clerk flag picks the credential: Clerk when it is on, Devise when it is off.
# There's no fallback between them, so a missing Clerk token doesn't let stale
# Devise headers through.
# TODO(DAH-4366): CLERK MIGRATION - DEVISE TECH DEBT TO REMOVE
module ClerkOrDeviseAuth
  extend ActiveSupport::Concern
  include Clerk::Authenticatable

  CLERK_AUTH_FLAG = 'temp.webapp.auth.clerk'

  # remote_ip lets Unleash's IP strategy turn Clerk on for allowlisted IPs only
  def self.clerk_enabled?(remote_ip)
    # TODO: TEMP local debugging, remove before commit
    enabled = Rails.configuration.unleash.is_enabled?(
      CLERK_AUTH_FLAG, Unleash::Context.new(remote_address: remote_ip)
    )
    Rails.logger.info("[ClerkFlag] remote_ip=#{remote_ip.inspect} enabled=#{enabled}")
    enabled
  end

  def authenticate_user!(*)
    return super unless clerk_auth?
    return if clerk_user_id.present?

    render json: { error: 'Invalid Clerk session' }, status: :unauthorized
  end

  def current_user
    return super unless clerk_auth?
    return if clerk_user_id.blank?

    @current_user ||= ClerkService::User.new(clerk_user_id)
  end

  def user_signed_in?
    return super unless clerk_auth?

    clerk_user_id.present?
  end

  private

  def clerk_auth?
    return @clerk_auth if defined?(@clerk_auth)

    @clerk_auth = ClerkOrDeviseAuth.clerk_enabled?(request.remote_ip)
  end

  def clerk_user_id
    return @clerk_user_id if defined?(@clerk_user_id)

    @clerk_user_id = clerk&.user_id
  end
end
