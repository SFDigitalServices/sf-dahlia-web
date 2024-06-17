namespace :tests do
  desc 'Cleanup E2E Test Data'
  task e2e_cleanup: :environment do
    puts 'Attempting to hit api to clean up front end test data.'
    response = Force::Request.new.delete('/FrontEndTestDataCleanUp')
    if response == 200
      puts 'Successfully triggered front end test data cleanup.'
    else
      puts 'Error when triggering front end test data cleanup.'
    end
  end
end
