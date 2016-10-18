FactoryGirl.define do
  factory :user do
    sequence(:email, 100) { |n| "person#{n}@example.com" }
    password 'password'
    password_confirmation 'password'
    confirmed_at Time.now
  end
end
