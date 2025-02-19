DeviseTokenAuth.setup do |config|
  # By default the authorization headers will change after each request. The
  # client is responsible for keeping track of the changing tokens. Change
  # this to false to prevent the Authorization header from changing after
  # each request.
  # config.change_headers_on_each_request = true

  # By default, users will need to re-authenticate after 2 weeks. This setting
  # determines how long tokens will remain valid after they are issued.
  # config.token_lifespan = 2.weeks

  # Sets the max number of concurrent devices per user, which is 10 by default.
  # After this limit is reached, the oldest tokens will be removed.
  # config.max_number_of_devices = 10

  # Sometimes it's necessary to make several requests to the API at the same
  # time. In this case, each request in the batch will need to share the same
  # auth token. This setting determines how far apart the requests can be while
  # still using the same auth token.
  # config.batch_request_buffer_throttle = 5.seconds

  # This route will be the prefix for all oauth2 redirect callbacks. For
  # example, using the default '/omniauth', the github oauth2 provider will
  # redirect successful authentications to '/omniauth/github/callback'
  # config.omniauth_prefix = "/omniauth"

  # By default sending current password is not needed for the password update.
  # Uncomment to enforce current_password param to be checked before all
  # attribute updates. Set it to :password if you want it to be checked only if
  # password is updated.
  config.check_current_password_before_update = :password

  #  By default DeviseTokenAuth will not send confirmation email, even when
  # including devise confirmable module. If you want to use devise confirmable
  # module and send email, set it to true. (This is a setting for compatibility)
  config.send_confirmation_email = true

  # Only permit redirects to a set of allowlisted URLs. Any redirect_urls that are not part of this list
  # will be rejected. In this list we are effectively only scoping to the my account and reset password pages,
  # but since we have multiple different environments, we need to allow for multiple different URLs.
  # By default, this is set to an empty array, and all redirect URLs are allowed.
  config.redirect_whitelist = [
    "https://#{ENV['HEROKU_APP_NAME']}.herokuapp.com/my-account",
    "https://#{ENV['HEROKU_APP_NAME']}.herokuapp.com/reset-password",
    "https://housing.sfgov.org/my-account",
    "https://housing.sfgov.org/reset-password",
    "http://localhost:3000/my-account",
    "http://localhost:3000/reset-password",
    "/my-account",
    "/reset-password"
  ]

  # By default, only Bearer Token authentication is implemented out of the box.
  # If you wish to integrate with legacy Devise authentication, you can
  # do so by enabling this flag. NOTE: This feature is highly experimental!
  # enable_standard_devise_support = false
end
