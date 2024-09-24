# TODO: DAH-2744 delete this debug task

namespace :debug do
  desc 'Debug Unleash flag initialization'
  task debug_unleash_flag: :environment do
    puts "::UNLEASH constant: #{::UNLEASH.inspect}" # rubocop:disable Style/RedundantConstantBase

    puts "creating 'submission_confirmation' sidekiq job"
    Emailer.submission_confirmation(
      locale: 'en',
      email: 'jim.lin+test@sfgov.org',
      listing_id: 'a0W0P00000F8YG4UAN',
      lottery_number: '01234567',
      first_name: 'testfirst',
      last_name: 'testlast',
    ).deliver_later
  end
end
