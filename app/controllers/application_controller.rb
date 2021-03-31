# Root controller from which all our controllers inherit.
class ApplicationController < ActionController::Base
  include ApplicationHelper
  layout :layout_name
  # not really used since we don't have any Rails-generated forms
  # but still added for security + codeclimate happiness
  protect_from_forgery with: :exception

  LAYOUT_ANGULAR = 'application-angular'.freeze
  LAYOUT_REACT = 'application-react'.freeze

  # Used for redirecting outdated asset urls
  # e.g. "/translations/locale-en.json" --> "/assets/locale-en-[hash].json"
  def asset_redirect
    asset = "#{params[:locale]}.json"
    if static_asset_paths[asset]
      redirect_to static_asset_paths[asset]
    else
      render json: { message: 'Not Found', status: 404 }, status: 404
    end
  end

  def layout_name
    force_react = params['react'].to_s.casecmp('true').zero?
    force_angular = params['react'].to_s.casecmp('false').zero?

    if force_react || (!force_angular && use_react_app)
      LAYOUT_REACT
    else
      LAYOUT_ANGULAR
    end
  end

  # Override this method to return true if a controller supports react rendering
  def use_react_app
    false
  end
end
