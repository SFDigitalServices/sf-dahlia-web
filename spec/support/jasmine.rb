require_relative './jasmine_macros'

RSpec.configure do |config|
  # this resets factory girl sequences so that the jasmine
  # factories do not change with each run
  # config.before do
  #   FactoryBot.reload
  # end

  config.extend JasmineMacros, type: :request
end
