# Controller for the rental and sale directories
class DirectoryController < ApplicationController
  def rent
    @rent_directory_props = react_app_props
    render 'rent'
  end

  def sale
    @sale_directory_props = react_app_props
    render 'sale'
  end

  protected

  def use_react_app
    true
  end
end
