# Renders the angular single-page app. All routing is handled
# on the client.
# By default, all pages render with AngularController,
# the README contains instructions for how to migrate a new page
# to render via react instead.
class AngularController < ApplicationController
  # not functionally necessary, but NewRelic logging will
  # complain if this isn't defined
  def index; end
end
