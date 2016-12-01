require 'http'

module ArcGISService
  # Shared functionality for ArcGIS services
  class Base
    attr_accessor :errors

    def initialize
      @errors = []
    end

    def api_url
      self.class::API_URL
    end

    def data
      response = HTTP.get(api_url + "?#{query_params.to_query}")

      if response.code >= 400
        add_error(response.code)
      else
        response.to_s
      end
    rescue HTTP::Error
      add_error(:connection_error, response.to_s)
    end

    def json_data
      geocode_data = data

      if @errors.any?
        send_errors
      else
        parsed = JSON.parse(geocode_data, symbolize_names: true)
        if parsed[:error].present?
          add_error(:invalid_response, parsed[:error][:message])
          send_errors
        else
          parsed
        end
      end
    rescue JSON::ParserError => error
      add_error(:invalid_response, error)
      send_errors
    end

    def query_params
      {}
    end

    def add_error(error, message = '')
      if error.is_a? Integer
        error_type = :http_error
        error_message = "HTTP Status #{error} #{HTTP::Response::Status::REASONS[error]}"
      else
        error_type = error
        error_message = message
      end

      @errors << { type: error_type, message: error_message }
    end

    def send_errors
      { errors: @errors }
    end
  end
end
