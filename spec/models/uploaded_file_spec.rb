require 'rails_helper'

describe UploadedFile, type: :model do
  before(:each) do
    @file_attrs = {
      session_uid: '123123-xyzyz',
      listing_id: '123',
      preference: 'liveInSf',
      document_type: 'gas bill',
      file: double(
        'file', size: 0.5.megabytes, content_type: 'png', original_filename: 'foo'
      ),
      name: 'foo',
      content_type: 'png',
    }
  end

  it 'should create a new instance of UploadedFile given valid attributes' do
    UploadedFile.create!(@file_attrs)
  end
end
