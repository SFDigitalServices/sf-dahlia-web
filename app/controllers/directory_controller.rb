# Controller for the rental and sale directories
class DirectoryController < ApplicationController
  def rent
    render 'rent'
  end

  def sale
    render 'sale'
  end

  protected

  def use_react_app
    ENV['DIRECTORY_PAGE_REACT'].to_s.casecmp('true').zero?
  end
end
