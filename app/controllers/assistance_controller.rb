# Controller for the get assistance pages
class AssistanceController < ApplicationController
  def housing_counselors
    render 'housing_counselors'
  end

  def get_assistance
    render 'get_assistance'
  end

  def document_checklist
    render 'document_checklist'
  end

  def additional_resources
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
