FactoryBot.define do
  factory :user do
    sequence(:email, 100) { |n| "person#{n}@example.com" }
    password { 'password1' }
    password_confirmation { 'password1' }
    salesforce_contact_id { '123123x' }
    confirmed_at { Time.now }
  end
end
