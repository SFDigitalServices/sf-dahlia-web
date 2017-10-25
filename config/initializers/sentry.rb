Raven.configure do |config|
  config.processors -= [Raven::Processor::PostData] # Do this to send POST data
end
