# Handles static pages
# Currently all pages except for the homepage use AngularController,
# as pages get migrated to react we should do the following:
# 1. Add a new controller for the new page
#   a. Implement use_react_app for the new controller
# 2. Add a new route for that page in routes.rb
class AngularController < ApplicationController
  def use_react_app
    false
  end
end
