# frozen_string_literal: true

class Api::V1::ClerkAuthController < ApiController
  include Clerk::Authenticatable

  before_action :authenticate_clerk_user!

  def devise_token
    exchange_results = ClerkDeviseTokenExchangeService.exchange_token!(clerk_user_id: clerk_user_id)
    response.headers.merge!(exchange_results[:auth_headers])
    render json: {
      success: true,
      data: {
        id: exchange_results[:user].id,
        uid: exchange_results[:user].uid,
      },
    }
  rescue ClerkDeviseTokenExchangeService::MissingEmailError => e
    render json: { error: e.message }, status: :unprocessable_entity
  rescue ClerkDeviseTokenExchangeService::DeviseClerkUserConflictError => e
    render json: { error: e.message }, status: :conflict
  # handle errors caused by creating / modifying users in the database
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.record.errors.full_messages.join(', ') },
           status: :unprocessable_entity
  end

  private

  def authenticate_clerk_user!
    return if clerk_user_id.present?

    render json: { error: 'Missing Clerk session' }, status: :unauthorized
  end

  def clerk_user_id
    return unless clerk&.user?

    @clerk_user_id ||= clerk&.user_id
  end
end
