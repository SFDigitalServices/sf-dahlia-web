Jasmine::Dependencies.module_eval do
  class << self
    # override method in the Jasmine gem as a work around for Rails 7 compatibility
    # Specifically, work around these lines:
    #   https://github.com/jasmine/jasmine-gem/blob/d1d2ed7be8443b9ab86cadf0685f50bd2e2402de/lib/jasmine/dependencies.rb#L21
    #   https://github.com/jasmine/jasmine-gem/blob/d1d2ed7be8443b9ab86cadf0685f50bd2e2402de/lib/jasmine/asset_expander.rb#L16
    def rails6?
      rails? && (Rails.version.to_i == 6 || Rails.version.to_i == 7)
    end
  end
end
