class AccountLayoutConstraint
  def matches?(_request)
    Rails.configuration.unleash.is_enabled?('temp.webapp.newAccountLayout')
  end
end
