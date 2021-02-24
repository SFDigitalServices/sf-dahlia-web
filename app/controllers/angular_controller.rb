# Handles static pages
class AngularController < ApplicationController
  def index
    render 'index', layout: 'application-angular'
  end
end
