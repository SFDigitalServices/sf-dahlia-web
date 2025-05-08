# frozen_string_literal: true

require 'http'

module DahliaBackend
  class ApiClient
    def api_url
      @api_url ||= begin
        ENV.fetch('DAHLIA_API_URL')
      rescue KeyError
        log_warn('DAHLIA_API_URL environment variable not set')
        nil
      end
    end

    def api_key
      @api_key ||= begin
        ENV.fetch('DAHLIA_API_KEY')
      rescue KeyError
        log_warn('DAHLIA_API_KEY environment variable not set')
        nil
      end
    end

    def http_client
      @http_client ||= HTTP.headers('x-api-key' => api_key)
    end

    def post(endpoint, params)
      response = http_client.post("#{api_url}#{endpoint}", json: params)

      if response.code >= 400
        log_error("POST request failed: #{response.code} #{response.body}", nil)
        nil
      else
        log_info("POST request successful: #{endpoint}")
        response
      end
    rescue StandardError => e
      log_error('POST request error', e)
      nil
    end

    def get(endpoint, params = {})
      response = http_client.get("#{api_url}#{endpoint}", params: params)

      if response.code >= 400
        log_error("GET request failed: #{response.code} #{response.body}", nil)
        nil
      else
        log_info("GET request successful: #{endpoint}")
        response
      end
    rescue StandardError => e
      log_error('GET request error', e)
      nil
    end

    def log_info(message)
      Rails.logger.info("[DahliaBackend::ApiClient:log_info] #{message}")
    end

    def log_warn(message)
      Rails.logger.warn("[DahliaBackend::ApiClient:log_warn] #{message}")
    end

    def log_error(message, error)
      error_details = error ? ": #{error.class} #{error.message}" : ''
      Rails.logger.error("[DahliaBackend::ApiClient:log_error] #{message}#{error_details}")
    end
  end
end
