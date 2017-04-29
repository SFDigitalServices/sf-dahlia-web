# Root controller from which all our controllers inherit.
class ApplicationController < ActionController::Base
  # not really used since we don't have any Rails-generated forms
  # but still added for security + codeclimate happiness
  protect_from_forgery with: :exception
end
