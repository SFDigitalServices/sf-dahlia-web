# for previewing emailer in browser
class EmailerPreview < ActionMailer::Preview
  def submission_confirmation
    _submission_confirmation
  end

  def submission_confirmation_es
    _submission_confirmation('es')
  end

  def account_update
    u = User.first
    Emailer.account_update(u)
  end

  def reset_password_instructions
    u = User.first
    token = u.confirmation_token || 'xyzABC123'
    Emailer.reset_password_instructions(u, token)
  end

  def confirmation_instructions
    u = User.first
    u.unconfirmed_email = nil
    token = u.confirmation_token || 'xyzABC123'
    Emailer.confirmation_instructions(u, token)
  end

  def reconfirmation_instructions
    u = User.first
    u.unconfirmed_email = 'test@unconfirmed.com'
    token = u.confirmation_token || 'xyzABC123'
    Emailer.confirmation_instructions(u, token)
  end

  def geocoding_log_notification
    Emailer.geocoding_log_notification(log_params)
  end

  def geocoding_log_notification_hbmr
    has_nrhp_adhp = true
    Emailer.geocoding_log_notification(log_params, has_nrhp_adhp)
  end

  def geocoding_error_notification
    Emailer.geocoding_error_notification(service_data, log_params)
  end

  private

  def _submission_confirmation(locale = 'en')
    params = {
      locale: locale,
      lottery_number: '3888078',
      email: 'test@person.com',
      firstName: 'Mister',
      lastName: 'Tester',
      listing_id: 'a0WU000000ClNXGMA3',
    }
    Emailer.submission_confirmation(params)
  end

  def service_data
    {
      service_name: ArcGISService::GeocodingService::NAME,
      errors: [{ type: :connection_error }],
    }
  end

  def log_params
    {
      address: '123 Main St',
      city: 'San Francisco',
      zip: '94123',
      listing_id: 'xyz',
      listing_name: 'Test Listing',
      member: { firstName: 'Mister', lastName: 'Mister', dob: '1990-10-1' },
      applicant: { firstName: 'Mister', lastName: 'Mister', dob: '1990-10-1' },
    }
  end
end
