# frozen_string_literal: true

module DahliaBackend
  class MessageService
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
      def send_invite_to_response(_deadline, _app_id, _application_number, _response,_action,
                                        listing_id, _force = nil)
        new.send_invite_to_response(_deadline, _app_id, _application_number, _response, _action,
                                          listing_id, nil)
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

      send_message('/messages/application-submission', fields)
    rescue StandardError => e
      log_error('Error sending confirmation', e)
      nil
    end

    # Deprecate I2A pilot in DAH-4045
    def get_response_endpoint(act, response)
      if response && act.blank?
        case response
        when 'yes' then '/messages/invite-to-apply/response/yes'
        when 'no' then '/messages/invite-to-apply/response/no'
        when 'contact' then '/messages/invite-to-apply/response/contact'
        when 'submit' then '/messages/invite-to-apply/response/submit'
        end
      elsif act.present?
        '/api/v1/message'
      else
        nil
      end
    end

    def send_invite_to_response(_deadline, _app_id, _application_number, _response, _action,
                                      listing_id, _force = nil)
      # Get contacts from salesforce of the application with appId
      # TODO: Validate params

      application = Force::ShortFormService.get(_application_number.presence || _app_id)

      listing = fetch_listing(listing_id)

      fields = prepare_submission_fields_invite_to_response(application, listing, _deadline,
                                                         _application_number, _app_id, _action)
      return if fields.nil?

      log_info("Prepared fields for I2X response: #{fields.inspect}")

      endpoint = get_response_endpoint(_action, _response)
      return log_error("Invalid action type: #{_action}", nil) unless endpoint

      send_message(endpoint, fields)
    rescue StandardError => e
      log_error('Error sending I2X response', e)
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

    def prepare_submission_fields_invite_to_response(application, listing, deadline,
                                                  application_number, app_id, action)
      return nil unless application && listing

      if action.present?
        return {
          action: action.upcase,
          data: {
            applicationIds: [app_id],
            isTestEmail: false,
          }
        }
      end

      # Extract applicant information
      primary_applicant = {
        firstName: application.dig('primaryApplicant', 'firstName'),
        lastName: application.dig('primaryApplicant', 'lastName'),
        email: application.dig('primaryApplicant', 'email'),
      }.compact

      # Build applicant data
      applicant_data = {
        lotteryNumber: application.dig('lotteryNumber'),
        appId: app_id,
        applicationNumber: application_number,
        primaryContact: primary_applicant,
        applicationLanguage: application.dig('applicationLanguage'),
      }

      # Only include alternateContact if it exists in the application
      if application['alternateContact'].present?
        alternate_contact = {
          firstName: application.dig('alternateContact', 'firstName'),
          email: application.dig('alternateContact', 'email'),
        }
        applicant_data[:alternateContact] = alternate_contact
      end

      leasing_agent = {
        name: listing.Leasing_Agent_Name.to_s,
        email: listing.Leasing_Agent_Email.to_s,
        phone: listing.Leasing_Agent_Phone.to_s,
        officeHours: listing.Office_Hours.to_s,
      }

      formatted_date = format_lottery_date(listing.Lottery_Date)

      {
        applicants: [applicant_data],
        listingId: listing.dig('Id'),
        listingName: listing.Name.to_s,
        buildingName: listing.Building_Name_for_Process.to_s,
        listingAddress: listing.Address__c.to_s,
        listingNeighborhood: listing.Neighborhood__c.to_s,
        leasingAgent: leasing_agent,
        lotteryDate: formatted_date,
        deadlineDate: deadline,
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
        log_error("Failed to send message to #{endpoint}: #{fields.to_json}", nil)
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
