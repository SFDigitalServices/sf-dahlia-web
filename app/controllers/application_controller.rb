include ApplicationHelper
# Root controller from which all our controllers inherit.
class ApplicationController < ActionController::Base
  # not really used since we don't have any Rails-generated forms
  # but still added for security + codeclimate happiness
  protect_from_forgery with: :exception

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
end
