# for previewing emailer in browser
class EmailerPreview < ActionMailer::Preview
  def submission_confirmation
    params = {
      locale: locale,
      lottery_number: '3888078',
      email: 'test@person.com',
      first_name: 'Mister',
      last_name: 'Tester',
      listing_id: 'a0WU000000ClNXGMA3',
    }
    Emailer.submission_confirmation(params)
  end

  def account_update
    I18n.locale = locale
    u = User.first
    Emailer.account_update(u)
  end

  def draft_application_saved
    params = {
      locale: locale,
      email: 'test@person.com',
      first_name: 'Mister',
      last_name: 'Tester',
      listing_id: 'a0W0P00000F8YG4UAN',
    }
    Emailer.draft_application_saved(params)
  end

  def reset_password_instructions
    I18n.locale = locale
    u = User.first
    token = u.confirmation_token || 'xyzABC123'
    Emailer.reset_password_instructions(u, token)
  end

  def confirmation_instructions
    I18n.locale = locale
    u = User.first
    u.unconfirmed_email = nil
    token = u.confirmation_token || 'xyzABC123'
    Emailer.confirmation_instructions(u, token)
  end

  def reconfirmation_instructions
    I18n.locale = locale
    u = User.first
    u.unconfirmed_email = 'test@unconfirmed.com'
    token = u.confirmation_token || 'xyzABC123'
    Emailer.confirmation_instructions(u, token)
  end

  # Set the value of the locale to preview all emails in
  # a specific language (:es, :zh, :tl, :en)
  def locale
    :es || I18n.default_locale
  end
end
