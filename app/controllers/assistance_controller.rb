# Controller for the get assistance pages
class AssistanceController < ApplicationController
  def housing_counselors
    @housing_counselor_props = { assetPaths: static_asset_paths }
    render 'housing_counselors'
  end

  def get_assistance
    @get_assistance_props = { assetPaths: static_asset_paths }
    render 'get_assistance'
  end

  def document_checklist
    @document_checklist_props = { assetPaths: static_asset_paths }
    render 'document_checklist'
  end

  def additional_resources
    @additional_resources_props = { assetPaths: static_asset_paths }
    render 'additional_resources'
  end

  def privacy
    @privacy_props = { assetPaths: static_asset_paths }
    render 'privacy'
  end

  def disclaimer
    @disclaimer_props = { assetPaths: static_asset_paths }
    render 'disclaimer'
  end

  protected

  def use_react_app
    ENV['GET_ASSISTANCE_PAGES_REACT'].to_s.casecmp('true').zero?
  end
end
