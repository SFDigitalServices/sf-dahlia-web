namespace :debug do
  desc 'Debug Unleash flag initialization'
  task debug_unleash_flag: :environment do
    puts "Rails.configuration.unleash: #{Rails.configuration.unleash.inspect}"

    email = ENV.fetch('email', nil)
    raise 'Error: invalid email' if email.blank? || !/.+@.+\..+/.match(email)

    puts "sending fake submission confirmation email to '#{email}' " \
         'to debug sidekiq job'
    Emailer.submission_confirmation(
      locale: 'en',
      email:,
      listing_id: 'a0W0P00000F8YG4UAN',
      lottery_number: '01234567',
      first_name: 'testfirst',
      last_name: 'testlast',
    ).deliver_later
  end
end
