# Controller for the DAHLIA applications.
class ApplicationIntroController < ApplicationController
  def index
    @application_intro_props = { assetPaths: static_asset_paths }
  end

  protected

  def use_react_app
    ENV['APPLICATION_INTRO_PAGE_REACT'].to_s.casecmp('true').zero?
  end
end
