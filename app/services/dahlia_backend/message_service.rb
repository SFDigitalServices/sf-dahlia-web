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
        return unless service_enabled?
        return unless valid_params?(application_params, application_response)

        listing = fetch_listing(application_params[:listingID])
        formatted_date = format_lottery_date(listing.Lottery_Date)

        send_application_confirmation_message(
          email: application_params[:primaryApplicant]&.[](:email).to_s,
          listingId: application_params[:listingID],
          lotteryNumber: application_response&.[]('lotteryNumber').to_s,
          listingName: listing.Name,
          lotteryDate: formatted_date,
        )
      rescue StandardError => e
        Rails.logger.error("[MessageService] Error sending confirmation: #{e.message}")
        nil
      end

      private

      def send_application_confirmation_message(params)
        submission_fields = {
          email: params[:email],
          listingId: params[:listingId],
          lotteryNumber: params[:lotteryNumber],
          listingName: params[:listingName].to_s,
          lotteryDate: params[:lotteryDate].to_s,
        }

        log_message_attempt(submission_fields)
        response = DahliaBackend::Base.new.post('/messages/application-submission',
                                                submission_fields)
        log_message_success(submission_fields)
        response
      rescue StandardError => e
        log_message_error(e, submission_fields)
        raise
      end

      def service_enabled?
        Rails.configuration.unleash.is_enabled?(FEATURE_FLAG_USE_MESSAGE_SERVICE)
      end

      def valid_params?(application_params, application_response)
        return false unless application_params && application_response
        return false unless application_params[:listingID].present?
        return false unless application_params[:primaryApplicant]&.[](:email).present?

        true
      end

      def fetch_listing(listing_id)
        Hashie::Mash.new(Force::ListingService.listing(listing_id))
      end

      def format_lottery_date(lottery_date)
        return '' unless lottery_date.present?

        Time.zone.parse(lottery_date).strftime('%B %e, %Y')
      rescue StandardError => e
        Rails.logger.warn("[MessageService] Error parsing date: #{e.message}")
        lottery_date.to_s
      end

      def log_message_attempt(fields)
        Rails.logger.info("[MessageService] Sending confirmation message: #{fields}")
      end

      def log_message_success(fields)
        Rails.logger.info("[MessageService] Successfully sent confirmation to: #{fields[:email]}")
      end

      def log_message_error(error, fields)
        Rails.logger.error("[MessageService] Error sending message to #{fields[:email]}: #{error.message}")
      end
    end
  end
end
