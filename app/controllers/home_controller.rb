# Handles static pages
class HomeController < ApplicationController
  def index
    render 'index', layout: 'application-react'
  end

  def plus_housing
    render 'plus-housing', layout: 'plus-housing'
  end
end
