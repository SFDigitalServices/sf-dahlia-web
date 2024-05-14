# Controller for the rental and sale directories
class DirectoryController < ApplicationController
  def rent
    @rent_directory_props = { assetPaths: static_asset_paths, isRental: true }
    render 'rent'
  end

  def sale
    @sale_directory_props = { assetPaths: static_asset_paths, isRental: false }
    render 'sale'
  end

  protected

  def use_react_app
    true
  end
end
