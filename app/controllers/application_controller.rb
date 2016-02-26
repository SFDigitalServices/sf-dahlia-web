# Root controller from which all our controllers inherit.
class ApplicationController < ActionController::Base
  protect_from_forgery
end
