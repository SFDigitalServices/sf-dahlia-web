class AccountLayoutConstraint
  FLAG_OFF = ->(request) { !AccountLayoutConstraint.new.matches?(request) }

  def matches?(_request)
    Rails.configuration.unleash.is_enabled?('temp.webapp.newAccountLayout')
  end
end
