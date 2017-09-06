# Root controller from which all our controllers inherit.
class ApplicationController < ActionController::Base
  # not really used since we don't have any Rails-generated forms
  # but still added for security + codeclimate happiness
  protect_from_forgery with: :exception

  # Used for redirecting outdated asset urls
  # e.g. "/translations/locale-en.json" --> "/assets/locale-en-[hash].json"
  def asset_redirect
    redirect_to ActionController::Base.helpers.asset_url(params[:locale])
  end
end
