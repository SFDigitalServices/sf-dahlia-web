# Controller for the DAHLIA homepage.
class HomeController < ApplicationController
  def index
    @home_props = { assetPaths: static_asset_paths }
  end

  protected

  def use_react_app
    true
  end
end
