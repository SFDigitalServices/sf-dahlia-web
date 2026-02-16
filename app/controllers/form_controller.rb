# Controller for pages with forms
class FormController < ApplicationController
  def listing_apply_form
    @listing_apply_form_props = {
      assetPaths: static_asset_paths,
      listingId: params[:id],
    }
    render 'listing_apply_form'
  end

  protected

  def use_react_app
    true
  end
end
