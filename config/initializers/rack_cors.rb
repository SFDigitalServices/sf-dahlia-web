# Configure Rack CORS Middleware, so that CloudFront can serve our assets.
# See https://github.com/cyu/rack-cors
# adapted from https://stackoverflow.com/a/36585871/260495
if defined? Rack::Cors
  Rails.configuration.middleware.insert_before 0, Rack::Cors do
    allow do
      origins [
        %r{^https?://dahlia-(production|full|qa|pre-prod|qa-pr-[0-9]*)\.herokuapp\.com$},
        'https://housing.sfgov.org',
      ]
      resource '/assets/*'
    end
  end
end
