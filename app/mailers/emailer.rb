# basic emailer class
class Emailer < Devise::Mailer
  include ActionMailer::Text
  default from: 'DAHLIA <donotreply@sfgov.org>'
  default reply_to: 'DAHLIA <donotreply@sfgov.org>'
  layout 'email'

  ### service external methods
  def account_update(record)
    load_salesforce_contact(record)
    @email = record.email
    @subject = 'DAHLIA SF Housing Portal Account Updated'
    sign_in_path = 'sign-in?redirectTo=dahlia.account-settings'
    @account_settings_url = "#{base_url}/#{sign_in_path}"
    mail(to: @email, subject: @subject) do |format|
      format.html { render 'account_update' }
    end
  end

  def submission_confirmation(params)
    # set language based on params
    I18n.locale = params[:locale]

    listing = Hashie::Mash.new(Force::ListingService.listing(params[:listing_id]))
    @name = "#{params[:first_name]} #{params[:last_name]}"
    return false unless listing.present? && params[:email].present?
    _submission_confirmation_email(
      email: params[:email],
      listing: listing,
      listing_url: "#{base_url}/listings/#{listing.Id}",
      lottery_number: params[:lottery_number],
    )
  end

  def confirmation_instructions(record, token, opts = {})
    load_salesforce_contact(record)
    if record.pending_reconfirmation?
      action = :reconfirmation_instructions
    else
      action = :confirmation_instructions
    end

    @token = token
    devise_mail(record, action, opts)
  end

  def reset_password_instructions(record, token, opts = {})
    load_salesforce_contact(record)
    super
  end

  def geocoding_log_notification(log_id, has_nrhp_adhp = false)
    @log = GeocodingLog.find(log_id)
    @has_nrhp_adhp = has_nrhp_adhp
    setup_geocoding_notification

    @listing_url = "#{base_url}/listings/#{@log.listing_id}"

    subject = '[SF-DAHLIA] Address not found in ArcGIS service'
    mail(to: admin_email, subject: subject) do |format|
      format.html do
        render(
          'arc_gis_log_notification',
          locals: {
            log: @log,
            applicant: @applicant,
            member: @member,
            listing_url: @listing_url,
          },
        )
      end
    end
  end

  def geocoding_error_notification(data, log, has_nrhp_adhp = false)
    @data = Hashie::Mash.new(data)
    @log = Hashie::Mash.new(log)
    @error = Hashie::Mash.new(@data[:errors].first)
    @has_nrhp_adhp = has_nrhp_adhp
    setup_geocoding_notification

    @listing_url = "#{base_url}/listings/#{@log[:listing_id]}"

    subject = "[SF-DAHLIA] ArcGIS #{@data[:service_name]} service error"
    mail(to: admin_email, subject: subject) do |format|
      format.html do
        render(
          'arc_gis_error_notification',
          locals: {
            data: @data,
            log: @log,
            error: @error,
            applicant: @applicant,
            member: @member,
            listing_url: @listing_url,
          },
        )
      end
    end
  end

  def draft_application_saved(params)
    listing = Hashie::Mash.new(Force::ListingService.listing(params[:listing_id]))
    @listing_name = listing.Name
    @email = params[:email]
    @name = "#{params[:first_name]} #{params[:last_name]}"
    continue_draft_path = '/continue-draft-sign-in/' + params[:listing_id]
    @saved_application_url = "#{base_url}#{continue_draft_path}"
    format_app_due_date(listing)
    subject = "Complete your application for #{@listing_name} by #{@deadline}"
    mail(to: @email, subject: subject) do |format|
      format.html do
        render(
          'draft_application_saved',
          locals: {
            listing_name: @listing_name,
            saved_application_url: @saved_application_url,
            deadline: @deadline,
          },
        )
      end
    end
  end

  private

  def format_app_due_date(listing)
    due = Time.zone.parse(listing['Application_Due_Date'])
    due_time = "#{due.strftime('%l')}:#{due.strftime('%M')} #{due.strftime('%p')}"
    due_date = "#{due.strftime('%b')} #{due.strftime('%e')}"
    @deadline = "#{due_time} on #{due_date}"
  end

  def setup_geocoding_notification
    @applicant = Hashie::Mash.new(@log[:applicant])
    @member = Hashie::Mash.new(@log[:member])
    @name = 'DAHLIA Admins'
  end

  def admin_email
    # all heroku apps have Rails.env.production
    # but ENV['PRODUCTION'] is only on dahlia-production
    production = Rails.env.production? and ENV['PRODUCTION']
    production ? 'dahlia-admins@exygy.com' : 'dahlia-test@exygy.com'
  end

  def load_salesforce_contact(record)
    contact = Force::AccountService.get(record.salesforce_contact_id)
    @name = name(contact, record)
  end

  def _submission_confirmation_email(params)
    # expects :email, :listing, :listing_url, :lottery_number
    @email = params[:email]
    @listing = params[:listing]
    @listing_name = @listing.Name
    @listing_url = params[:listing_url]
    @lottery_number = params[:lottery_number]
    @lottery_date = ''
    if @listing.Lottery_Date
      @lottery_date = Time.zone.parse(@listing.Lottery_Date).strftime('%B %e, %Y')
    end
    @subject = "Thanks for applying to #{@listing_name}"
    mail(to: @email, subject: @subject) do |format|
      format.html { render 'submission_confirmation' }
    end
  end

  def name(contact, record)
    if contact.present?
      "#{contact['firstName']} #{contact['lastName']}"
    else
      record.email
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
