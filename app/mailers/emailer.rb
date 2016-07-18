# basic emailer class
class Emailer < ActionMailer::Base
  include ActionMailer::Text
  default from: 'DAHLIA <dahlia@housing.sfgov.org>'
  layout 'email'

  ### service external methods
  def submission_confirmation(params)
    # expects :listing_id, :short_form_id
    listing = Hashie::Mash.new(ListingService.listing(params[:listing_id]))
    short_form = Hashie::Mash.new(ShortFormService.get(params[:short_form_id]))
    return false unless listing.present? && short_form.present?
    _submission_confirmation_email(
      email: short_form.primaryApplicant.email,
      listing: listing,
      listing_url: "#{base_url}/listings/#{listing.Id}",
      lottery_number: short_form.lotteryNumber,
    )
  end

  def _submission_confirmation_email(params)
    # expects :email, :listing, :listing_url, :lottery_number
    @email = params[:email]
    @listing = params[:listing]
    @listing_name = @listing.Building_Name
    @listing_url = params[:listing_url]
    @lottery_number = params[:lottery_number]
    @lottery_date = Date.parse(@listing.Lottery_Date).strftime('%B%e, %Y')
    @subject = "Thanks for applying to #{@listing_name}"
    mail(to: @email, subject: @subject) do |format|
      format.html { render 'submission_confirmation' }
    end
  end

  def base_url
    url_options = Rails.application.config.action_mailer.default_url_options
    ssl = Rails.application.config.force_ssl
    url = "http#{ssl ? 's' : ''}://#{url_options[:host]}"
    url = "#{url}:#{url_options[:port]}" if url_options[:port].present?
    url
  end
end
