# for previewing emailer in browser
class EmailerPreview < ActionMailer::Preview
  def submission_confirmation
    params = {
      lottery_number: '3888078',
      email: 'test@person.com',
      firstName: 'Mister',
      lastName: 'Tester',
      listing_id: 'a0Wf0000003j03WEAQ',
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
end
