namespace :tests do
  desc 'Cleanup E2E Test Data'
  task e2e_cleanup: :environment do
    Rails.logger.info('Attempting to hit api to clean up front end test data.')
    response = Force::Request.new.get('/FrontEndTestDataCleanUp')
    if response == 200
      Rails.logger.info('Successfully triggered front end test data cleanup.')
    else
      Rails.logger.error('Error when triggering front end test data cleanup.')
    end
  end
end
