# frozen_string_literal: true

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
    @subject = I18n.translate('emailer.account_update.subject')
    sign_in_path = 'sign-in?redirectTo=dahlia.account-settings'
    @account_settings_url = "#{base_url}/#{sign_in_path}"
    check_for_confirmed_account(record)
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

    check_for_confirmed_account(params[:email])
    _submission_confirmation_email(
      email: params[:email],
      listing:,
      listing_url: "#{base_url}/listings/#{listing.Id}",
      lottery_number: params[:lottery_number],
      resending: params[:resending],
    )
  end

  def confirmation_instructions(record, token, opts = {})
    check_for_confirmed_account(record)
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
    check_for_confirmed_account(record)
    load_salesforce_contact(record)
    super
  end

  def draft_application_saved(params)
    # set language based on params
    I18n.locale = params[:locale]

    listing = Hashie::Mash.new(Force::ListingService.listing(params[:listing_id]))
    @listing_name = listing.Name
    @email = params[:email]
    @name = "#{params[:first_name]} #{params[:last_name]}"
    continue_draft_path = '/continue-draft-sign-in/' + params[:listing_id]
    @saved_application_url = "#{base_url}#{continue_draft_path}"
    format_app_due_date(listing)
    subject = I18n.translate(
      'emailer.draft_application_saved.subject',
      deadline: @deadline,
      listing_name: @listing_name,
    )
    check_for_confirmed_account(@email)
    mail(to: @email, subject:) do |format|
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
    # TODO: Add localization for deadline
    due = Time.zone.parse(listing['Application_Due_Date'])
    due_time = "#{due.strftime('%-l')}:#{due.strftime('%M')} #{due.strftime('%p')}"
    due_date = "#{due.strftime('%b')} #{due.strftime('%e')}"
    @deadline = "#{due_time} on #{due_date}"
  end

  def setup_geocoding_notification
    @applicant = Hashie::Mash.new(@log[:applicant])
    @member = Hashie::Mash.new(@log[:member])
    @name = 'DAHLIA Admins'
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
    # @listing_url = params[:listing_url]
    @lottery_number = params[:lottery_number]
    @lottery_date = ''
    @submission_date = Time.now.strftime('%B %e, %Y %I:%M %P %Z')
    is_dalp_listing = @listing.Custom_Listing_Type == 'Downpayment Assistance Loan Program'
    puts @listing.Lottery_Date
    if @listing.Lottery_Date
      @lottery_date = Time.zone.parse(@listing.Lottery_Date).strftime('%B %e, %Y')
      puts @lottery_date
    end
    @subject = if is_dalp_listing
                 I18n.translate(
                   'emailer.submission_confirmation_dalp.subject',
                   listing_name: @listing_name,
                 )
               else
                 I18n.translate(
                   'emailer.submission_confirmation.subject',
                   listing_name: @listing_name,
                 )
               end
    # @resending is for situations where we need to manually resend emails due to failed
    # deliveries, but we're not sure if some recipients already received the email
    @resending_submission_confirmation = params[:resending] || false

    if is_dalp_listing
      mail(to: @email, subject: @subject) do |format|
        format.html { render 'submission_confirmation_dalp' }
      end
    else
      mail(to: @email, subject: @subject) do |format|
        format.html { render 'submission_confirmation' }
      end
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

  def check_for_confirmed_account(user_or_email)
    if user_or_email.is_a?(User)
      @show_name_in_email = user_or_email.confirmed_at.present?
    elsif user_or_email.is_a?(String)
      @show_name_in_email = User.find_by(email: user_or_email).try(:confirmed_at).present?
    end
  end
end
