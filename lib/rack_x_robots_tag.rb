module Rack
  # Middleware for instructing crawlers not to index
  # https://robots.thoughtbot.com/block-web-crawlers-with-rails
  class XRobotsTag
    def initialize(app)
      @app = app
    end

    def call(env)
      status, headers, response = @app.call(env)

      if ENV['DISALLOW_ALL_WEB_CRAWLERS'].present?
        headers['X-Robots-Tag'] = 'none'
      end

      [status, headers, response]
    end
  end
end
