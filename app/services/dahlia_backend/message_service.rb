module DahliaBackend
  class MessageService
    FEATURE_FLAG_USE_MESSAGE_SERVICE = 'UseMessageService'.freeze

    def self.send_application_confirmation(application_params, application_response)
      unless Rails.configuration.unleash.is_enabled?(FEATURE_FLAG_USE_MESSAGE_SERVICE)
        return
      end

      listing = Hashie::Mash.new(Force::ListingService.listing(application_params[:listingID]))
      lottery_date = listing.Lottery_Date
      Time.zone.parse(lottery_date).strftime('%B %e, %Y') if lottery_date

      send_application_confirmation_message(
        lotteryNumber: application_response&.[]('lotteryNumber').to_s,
        listingName: listing.Name,
        lotteryDate: listing.Lottery_Date,
        listingId: application_params[:listingID],
        email: application_params[:primaryApplicant]&.[](:email).to_s,
      )
    end

    def self.send_application_confirmation_message(lotteryNumber:, listingName:,
                                                   lotteryDate:, listingId:, email:)
      submission_fields = {
        email: email,
        listingId: listingId,
        lotteryNumber:,
        listingName: listingName.to_s,
        lotteryDate: lotteryDate.to_s,
      }

      Rails.logger.info("[MessageService#send_application_confirmation_message] Sending application confirmation message: #{submission_fields}")
      DahliaBackend::Base.new.post('/messages/application-submission',
                                   submission_fields)
    end
  end
end
