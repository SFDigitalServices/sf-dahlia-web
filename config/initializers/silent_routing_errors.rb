module ActionDispatch
  # suppress routing errors from logs
  class DebugExceptions
    alias old_log_error log_error
    def log_error(env, wrapper)
      if wrapper.exception.is_a? ActionController::RoutingError
        err = %(
          ActionController::RoutingError (No route matches [GET] "#{env['REQUEST_PATH']}")
          Completed 404 Not Found
        ).gsub(/^[\s\t]*/, '')
        # log the routing error, but without the stacktrace
        Rails.logger.error err
      else
        # otherwise log error as usual
        old_log_error env, wrapper
      end
    end
  end
end
