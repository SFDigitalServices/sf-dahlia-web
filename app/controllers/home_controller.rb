# Handles static pages
class HomeController < ApplicationController
  def index
  end

  def plus_housing
    render 'plus-housing', layout: 'plus-housing'
  end
end
