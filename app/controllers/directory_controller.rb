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
    ENV['DIRECTORY_PAGE_REACT'].to_s.casecmp('true').zero?
  end
end
