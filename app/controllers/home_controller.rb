# Controller for the DAHLIA homepage.
class HomeController < ApplicationController
  def index
    @home_props = react_app_props
  end

  protected

  def use_react_app
    true
  end
end
