require 'rails_helper'

describe UploadedFile, type: :model do
  it 'should create a new instance of UploadedFile given valid attributes' do
    # use Factory
    create(:uploaded_file)
  end

  it 'should be able to generate a descriptive name for the file' do
    # use Factory
    attrs = {
      name: 'foo.png',
      document_type: 'gas bill',
    }
    file = create(:uploaded_file, attrs)
    expect(file.descriptive_name).to eql('gas bill.png')
  end
end
