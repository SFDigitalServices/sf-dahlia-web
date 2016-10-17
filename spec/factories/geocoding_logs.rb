FactoryGirl.define do
  factory :geocoding_log do
    address '123 Main St'
    city 'San Francisco'
    zip '94123'
    listing_id 'xyz'
    member '{"firstName": "Abc"}'
    applicant '{"firstName": "Abc"}'
  end
end
