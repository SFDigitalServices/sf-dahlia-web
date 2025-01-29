namespace :preload do
  task user: :environment do
    puts "Preloading user #{Rails.env} Check "
    # unless Rails.env.production?
    puts 'Creating test user'
    user = User.find_or_create_by(email: 'test@test.com') do |u|
      u.password = 'abcd1234'
      u.password_confirmation = 'abcd1234'
    end
    puts user
    user.confirm unless user.confirmed?
    # end
  end
end
