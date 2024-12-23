# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
if Rails.env.development? || Rails.env.test?
    User.create!(
      email: "foo@foo.com",
      password: "barbarbar1",
      password_confirmation: "barbarbar1",
      confirmed_at: Time.now.utc # Marks the user as confirmed
    )
  end