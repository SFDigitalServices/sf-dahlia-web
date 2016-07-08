# Allow for custom headers to be injected into request
class CustomHeaders < Faraday::Response::Middleware
  def initialize(app, options = {})
    @app = app
    @options = options
  end

  def call(env)
    env[:request_headers].merge!(@options)
    @app.call(env)
  end
end
