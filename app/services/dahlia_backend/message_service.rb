# frozen_string_literal: true

module DahliaBackend
  # Service for sending messages to applicants through the DAHLIA API
  class MessageService
    FEATURE_FLAG_USE_MESSAGE_SERVICE = 'UseMessageService'

    class << self
      # Sends application confirmation to the applicant
      #
      # @param [Hash] application_params Parameters from the application
      # @param [Hash] application_response Response from the application submission
      # @param [String] locale Locale for the message (default is 'en')
      # @return [Object, nil] Response from the message service or nil if service is disabled/error occurs
      def send_application_confirmation(application_params, application_response,
                                        locale = 'en')
        new.send_application_confirmation(application_params, application_response,
                                          locale)
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
    # @param [Hash] application_params Parameters from the application
    # @param [Hash] application_response Response from the application submission
    # @param [String] locale Locale for the message (default is 'en')
    # @return [Object, nil] Response from the message service or nil if service is disabled/error occurs
    def send_application_confirmation(application_params, application_response,
                                      locale = 'en')
      return unless self.class.service_enabled?
      return unless valid_params?(application_params, application_response)

      fields = prepare_submission_fields(application_params, application_response, locale)
      return if fields.nil?

      send_message('/messages/application-submission', fields)
    rescue StandardError => e
      log_error('Error sending confirmation', e)
      nil
    end

    private

    def prepare_submission_fields(application_params, application_response,
                                  locale = 'en')
      listing_id = application_params[:listingID]
      email = application_params.dig(:primaryApplicant, :email).to_s

      listing = fetch_listing(listing_id)
      return nil unless listing

      formatted_date = format_lottery_date(listing.Lottery_Date)

      {
        email: email,
        listingId: listing_id,
        lotteryNumber: application_response&.[]('lotteryNumber').to_s,
        listingName: listing.Name.to_s,
        isRental: listing.RecordType.Name == 'Rental',
        lotteryDate: formatted_date,
        leasingAgent: {
          name: listing.Leasing_Agent_Name.to_s,
          email: listing.Leasing_Agent_Email.to_s,
          phone: listing.Leasing_Agent_Phone.to_s,
          officeHours: listing.Office_Hours.to_s,
        },
        lang: locale,
      }
    end

    # Sends a message through the API client
    # @param [String] endpoint API endpoint
    # @param [Hash] fields Message fields
    # @return [Object, nil] Response from API or nil if sending fails
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
      listing_data = Force::ListingService.listing(listing_id)
      return nil unless listing_data

      Hashie::Mash.new(listing_data)
    rescue StandardError => e
      log_error("Error fetching listing #{listing_id}", e)
      nil
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
