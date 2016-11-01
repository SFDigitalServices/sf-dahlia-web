# for previewing emailer in browser
class EmailerPreview < ActionMailer::Preview
  def submission_confirmation
    params = {
      lottery_number: '3888078',
      email: 'test@person.com',
      firstName: 'Mister',
      lastName: 'Tester',
      listing_id: 'a0WU000000ClNXGMA3',
    }
    Emailer.submission_confirmation(params)
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
    log = GeocodingLog.new(
      address: '123 Main St',
      city: 'San Francisco',
      zip: '94123',
      listing_id: 'xyz',
      member: { firstName: 'Mister', lastName: 'Mister', dob: '1990-10-1' },
      applicant: { firstName: 'Mister', lastName: 'Mister', dob: '1990-10-1' },
    )
    Emailer.geocoding_log_notification(log)
  end
end
