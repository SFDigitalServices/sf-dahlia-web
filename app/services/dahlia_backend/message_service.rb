# frozen_string_literal: true

module DahliaBackend
  class MessageService
    FEATURE_FLAG_USE_MESSAGE_SERVICE = 'UseMessageService'

    class << self
      # Sends application confirmation to the applicant
      #
      # @param [Hash] application_params Parameters from the application
      # @param [Hash] application_response Response from the application submission
      # @return [Object, nil] Response from the message service or nil if service is disabled
      def send_application_confirmation(application_params, application_response)
        new.send_application_confirmation(application_params, application_response)
      end

      def service_enabled?
        Rails.configuration.unleash.is_enabled?(FEATURE_FLAG_USE_MESSAGE_SERVICE)
      end
    end

    attr_reader :client

    def initialize(client = nil)
      @client = client || DahliaBackend::ApiClient.new
    end

    # Instance method implementation for application confirmation
    def send_application_confirmation(application_params, application_response)
      return unless self.class.service_enabled?
      return unless valid_params?(application_params, application_response)

      listing = fetch_listing(application_params[:listingID])
      formatted_date = format_lottery_date(listing.Lottery_Date)

      submission_fields = build_submission_fields(
        application_params,
        application_response,
        listing,
        formatted_date,
      )

      send_message('/messages/application-submission', submission_fields)
    rescue StandardError => e
      log_error('Error sending confirmation', e)
      nil
    end

    private

    def build_submission_fields(application_params, application_response, listing,
                                formatted_date)
      {
        email: application_params.dig(:primaryApplicant, :email).to_s,
        listingId: application_params[:listingID],
        lotteryNumber: application_response&.[]('lotteryNumber').to_s,
        listingName: listing.Name.to_s,
        lotteryDate: formatted_date.to_s,
      }
    end

    # Uses the composed client
    def send_message(endpoint, fields)
      log_info("Sending message to #{endpoint}: #{fields}")
      response = client.post(endpoint, fields)

      if response
        log_info("Successfully sent message to: #{fields[:email]}")
        response
      else
        log_error('Failed to send message', nil)
        nil
      end
    end

    def valid_params?(application_params, application_response)
      return false unless application_params && application_response
      return false unless application_params[:listingID].present?
      return false unless application_params.dig(:primaryApplicant, :email).present?

      true
    end

    def fetch_listing(listing_id)
      Hashie::Mash.new(Force::ListingService.listing(listing_id))
    end

    def format_lottery_date(lottery_date)
      return '' unless lottery_date.present?

      Time.zone.parse(lottery_date).strftime('%B %e, %Y')
    rescue StandardError => e
      log_warn("Error parsing date: #{e.message}")
      lottery_date.to_s
    end

    def log_info(message)
      Rails.logger.info("[DahliaBackend::MessageService:log_info] #{message}")
    end

    def log_warn(message)
      Rails.logger.warn("[DahliaBackend::MessageService:log_warn] #{message}")
    end

    def log_error(message, error)
      error_details = error ? ": #{error.class} #{error.message}" : ''
      Rails.logger.error("[DahliaBackend::MessageService:log_error] #{message}#{error_details}")
    end
  end
end
