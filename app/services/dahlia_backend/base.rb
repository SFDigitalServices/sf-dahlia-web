require 'http'

module DahliaBackend
  class Base
    attr_accessor :errors

    def initialize
      @errors = []
    end

    def api_url
      ENV.fetch('DAHLIA_API_URL', nil)
    end

    def api_key
      ENV.fetch('DAHLIA_API_KEY', nil)
    end

    def post(endpoint, params)
      response = HTTP.headers('x-api-key' => api_key).post(
        "#{api_url}#{endpoint}", params: params
      )
      if response.code >= 400
        Rails.logger.error("ERROR SENDING POST: #{response.code} #{response.body}")
      else
        Rails.logger.info("POST FROM DAHLIA BACKEND #{response}")
      end
    rescue StandardError => e
      Rails.logger.error("ERROR SENDING POST: #{e.class} #{e.message}")
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
