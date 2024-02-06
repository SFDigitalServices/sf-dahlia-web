# Renders the angular single-page app. All routing is handled
# on the client.
# By default, all pages render with AngularController,
# the README contains instructions for how to migrate a new page
# to render via react instead.
class AngularController < ApplicationController
  def index
    # not functionally necessary, but New Relic logs will complain when
    # routing hits this method, and it is not defined here
  end
end
