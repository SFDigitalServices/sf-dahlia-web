# Controller for Listing Application Forms
class FormController < ApplicationController
  def listing_apply_form
    @listing_apply_form_props = {
      assetPaths: static_asset_paths,
      listingId: params[:id],
    }
  end

  protected

  def use_react_app
    true
  end
end
