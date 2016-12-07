FactoryGirl.define do
  factory :user do
    sequence(:email, 100) { |n| "person#{n}@example.com" }
    password 'password'
    password_confirmation 'password'
    salesforce_contact_id '123123x'
    confirmed_at Time.now
  end
end
