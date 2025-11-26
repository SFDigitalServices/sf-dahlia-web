# frozen_string_literal: true

module DahliaBackend
  # Service for sending messages to applicants through the DAHLIA API
  class MessageService
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

      def send_invite_to_apply_response(_deadline, _application_number, _response,
                                        listing_id, _force = nil)
        new.send_invite_to_apply_response(_deadline, _application_number, _response,
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

    def get_invite_to_apply_response_endpoint(response)
      case response
      when 'yes' then 'messages/invite-to-apply/response/yes'
      when 'no' then 'messages/invite-to-apply/response/no'
      when 'contact' then 'messages/invite-to-apply/response/contact'
      end
    end

    def send_invite_to_apply_response(_deadline, _application_number, _response,
                                      listing_id, _force = nil)
      # Get contacts from salesforce of the application with applicationNumber
      #
      puts "applicationNumber param: #{_application_number}"
      application = Force::ShortFormService.get(_application_number)
      # puts "Fetched application from Salesforce: #{application.inspect}"

      puts "Listing ID param: #{listing_id}"
      listing = fetch_listing(listing_id)
      # Rails.logger.info("Fetched listing from Salesforce: #{listing.inspect}")

      fields = prepare_submission_fields_invite_to_apply(application, listing, _deadline,
                                                         _application_number)
      return if fields.nil?

      puts "Prepared fields for message: #{fields.inspect}"

      endpoint = get_invite_to_apply_response_endpoint(_response)
      return log_error("Invalid response type: #{_response}", nil) unless endpoint

      send_message(endpoint, fields)
    rescue StandardError => e
      log_error('Error sending Invite to Apply', e)
      nil
    end

    private

    def prepare_submission_fields(application_params, application_response,
                                  _locale = 'en')
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
        applicants: [application[:primaryApplicant],
                     application[:alternateContact]].compact,
      }
    end

    def prepare_submission_fields_invite_to_apply(application, listing, deadline,
                                                  application_number)
      # Rails.logger.info("Preparing submission fields for Invite to Apply: application=#{application.inspect}, listing=#{listing.inspect}")
      return nil unless application && listing

      # Extract applicant information
      primary_applicant = {
        firstName: application.dig('primaryApplicant', 'firstName'),
        email: application.dig('primaryApplicant', 'email'),
      }

      alternate_contact = {
        firstName: application.dig('alternateContact', 'firstName'),
        email: application.dig('alternateContact', 'email'),
      }

      leasing_agent = {
        name: listing.Leasing_Agent_Name.to_s,
        email: listing.Leasing_Agent_Email.to_s,
        phone: listing.Leasing_Agent_Phone.to_s,
        officeHours: listing.Office_Hours.to_s,
      }

      formatted_date = format_lottery_date(listing.Lottery_Date)

      {
        applicants: [{
          lotteryNumber: application.dig('lotteryNumber'),
          applicationNumber: application_number,
          primaryContact: primary_applicant,
          alternateContact: alternate_contact,
        }],
        listingId: listing.dig('Id'),
        listingName: listing.Name.to_s,
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
