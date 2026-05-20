class AccountLayoutConstraint
  def matches?(request)
    Rails.configuration.unleash.is_enabled?('temp.webapp.newAccountLayout')
  end
end
