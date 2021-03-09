# Handles static pages
class HomeController < ApplicationController
  def plus_housing
    render 'plus-housing', layout: 'plus-housing'
  end

  def use_react_app
    ENV['HOME_PAGE_REACT'].to_s.casecmp('true').zero?
  end
end
