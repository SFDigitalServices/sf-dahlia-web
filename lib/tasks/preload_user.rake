# This should only be run for apps in the review category
namespace :preload do
  task user: :environment do
    user = User.find_or_create_by(email: 'test@test.com') do |u|
      u.password = 'abcd1234'
      u.password_confirmation = 'abcd1234'
    end
    user.confirm unless user.confirmed?
  end
end
