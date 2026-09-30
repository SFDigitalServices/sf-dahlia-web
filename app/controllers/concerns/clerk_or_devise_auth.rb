# frozen_string_literal: true

# POC: let a Clerk Bearer token satisfy Devise-guarded actions.
# A Clerk session wins; without one, fall back to Devise token auth.
# See docs/clerk-devise-bridge.md ("Shim over $auth").
module ClerkOrDeviseAuth
  extend ActiveSupport::Concern
  include Clerk::Authenticatable

  def authenticate_user!(*)
    super if clerk_user_id.blank?
  end

  def current_user
    return super if clerk_user_id.blank?

    @current_user ||= ClerkService::User.new(clerk_user_id)
  end

  def user_signed_in?
    clerk_user_id.present? || super
  end

  private

  def clerk_user_id
    return @clerk_user_id if defined?(@clerk_user_id)

    @clerk_user_id = clerk&.user_id
  end
end
