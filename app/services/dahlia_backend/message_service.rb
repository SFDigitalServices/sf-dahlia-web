# frozen_string_literal: true

module DahliaBackend
  class MessageService
    ENDPOINTS = {
      application_submission: '/messages/application-submission',
      message: '/api/v1/message',
      housing_counselor: '/api/v1/message/housing-counselor',
    }.freeze

    class << self
      # Sends application confirmation to the applicant
      # @param [Hash] application_params Parameters from the application
      # @param [Hash] application_response Response from the application submission
      # @param [String] locale Locale for the message (default is 'en')
      # @return [Object, nil] Response from the message service or nil if service is disabled/error occurs
      def send_application_confirmation(application_params, application_response,
                                        locale = 'en')
        new.send_application_confirmation(application_params, application_response,
                                          locale)
      end

      def send_invite_to_response(deadline, app_id, action, _force = nil)
        new.send_invite_to_response(deadline, app_id, action, nil)
      end

      def send_housing_counselor_access(housing_counselor_action:, contact_id:, agency_id:)
        new.send_housing_counselor_access(
          action: housing_counselor_action,
          contact_id: contact_id,
          agency_id: agency_id,
        )
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
      return unless valid_params?(application_params, application_response)

      fields = prepare_submission_fields(application_params, application_response, locale)
      return if fields.nil?

      send_message('/messages/application-submission', fields, {
                     listingId: fields[:listingId],
                   })
    rescue StandardError => e
      log_error('Error sending confirmation', e)
      nil
    end

    def send_invite_to_response(_deadline, app_id, action, _force = nil)
      if action.blank? || app_id.blank?
        log_error("Invalid invite response params: action=#{action.inspect}, appId=#{app_id.inspect}", nil)
        return nil
      end

      fields = prepare_submission_fields_invite_to_response(app_id, action)

      log_info(
        "Prepared fields for I2X response: action=#{action.inspect}, " \
        "appId=#{app_id.inspect}",
      )

      send_message(ENDPOINTS[:message], fields, {
                     action: action,
                     appId: app_id,
                   })
    rescue StandardError => e
      log_error('Error sending I2X response', e)
      nil
    end

    # Sends housing counselor confirmation emails for access shared or revoked
    # @param action [String] ACCESS_GRANTED or ACCESS_REVOKED
    # @param contact_id [String] Salesforce Contact Id of the applicant
    # @param agency_id [String] Salesforce Account Id of the housing counselor agency
    def send_housing_counselor_access(action:, contact_id:, agency_id:)
      if contact_id.blank? || agency_id.blank?
        return log_error(
          "Null contact or agency id: action=#{action}, contactId=#{contact_id}, agencyId=#{agency_id}",
          nil,
        )
      end

      fields = {
        action: action,
        data: {
          contactId: contact_id,
          agencyId: agency_id,
        },
      }
      send_message(ENDPOINTS[:housing_counselor], fields)
      log_info("Sent housing counselor message with fields: #{fields}")
    rescue StandardError => e
      log_error('Error sending housing counselor message', e)
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

    def prepare_submission_fields_invite_to_response(app_id, action)
      {
        action: action.upcase,
        data: {
          applicationIds: [app_id],
          isTestEmail: false,
        },
      }
    end

    # Sends a message through the API client
    # @param [String] endpoint API endpoint
    # @param [Hash] fields Message fields
    # @return [Object, nil] Response from API or nil if sending fails
    def send_message(endpoint, fields, context = {})
      context_suffix = context.present? ? " (#{format_log_context(context)})" : ''

      log_info("Sending message to #{endpoint}#{context_suffix}")
      response = client.post(endpoint, fields)

      if response
        log_info("Successfully sent message to #{endpoint}#{context_suffix}")
        response
      else
        log_error("Failed to send message to #{endpoint}#{context_suffix}", nil)
        nil
      end
    end

    def format_log_context(context)
      context.map { |key, value| "#{key}=#{value.inspect}" }.join(', ')
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

      Time.zone.parse(lottery_date).strftime('%Y-%m-%d')
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
