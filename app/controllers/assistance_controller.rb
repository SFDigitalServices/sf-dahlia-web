# Controller for the get assistance pages
class AssistanceController < ApplicationController
  def housing_counselors
    @housing_counselor_props = react_app_props
    render 'housing_counselors'
  end

  def get_assistance
    @get_assistance_props = react_app_props
    render 'get_assistance'
  end

  def document_checklist
    @document_checklist_props = react_app_props
    render 'document_checklist'
  end

  def additional_resources
    @additional_resources_props = react_app_props
    render 'additional_resources'
  end

  def privacy
    @privacy_props = react_app_props
    render 'privacy'
  end

  def disclaimer
    @disclaimer_props = react_app_props
    render 'disclaimer'
  end

  protected

  def use_react_app
    true
  end
end
