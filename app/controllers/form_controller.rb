# Controller for pages with forms
class FormController < ApplicationController
  def listing_apply_form
    @listing_apply_form_props = react_app_props
    render 'listing_apply_form'
  end

  protected

  def use_react_app
    true
  end
end
