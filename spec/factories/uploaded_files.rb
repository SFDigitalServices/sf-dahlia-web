FactoryGirl.define do
  factory :uploaded_file do
    session_uid '123123-xyzyz'
    listing_id '123'
    preference 'liveInSf'
    document_type 'gas bill'
    file ''
    name 'foo'
    content_type 'png'
  end
end
