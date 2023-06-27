# Controller for the get assistance pages
class AssistanceController < ApplicationController
  def housing_counselors
    @AssistanceProps = {assetPaths: static_asset_paths}
    render 'housing_counselors'
  end

  def get_assistance
    @AssistanceProps = {assetPaths: static_asset_paths}
    render 'get_assistance'
  end

  def document_checklist
    @AssistanceProps = {assetPaths: static_asset_paths}
    render 'document_checklist'
  end

  def additional_resources
    @AssistanceProps = {assetPaths: static_asset_paths}
    render 'additional_resources'
  end

  def privacy
    render 'privacy'
  end

  def disclaimer
    render 'disclaimer'
  end

  protected

  def use_react_app
    ENV['GET_ASSISTANCE_PAGES_REACT'].to_s.casecmp('true').zero?
  end
end
