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

  it 'should be able to create and resize the image' do
    tempfile = double('tempfile', path: '/x/y/z.png')
    file = double('file', content_type: 'png', tempfile: tempfile)
    attrs = {
      file: file,
      document_type: 'copy of lease',
      content_type: 'png',
      name: 'imagename.png',
    }

    fake_image_optimizer = double('fake_image_optimizer', optimize: {})
    fake_image = {}
    allow(ImageOptimizer).to receive(:new).and_return(fake_image_optimizer)
    allow(MiniMagick::Image).to receive(:new).and_return(fake_image)

    allow(File).to receive(:read).and_return({})
    allow(File).to receive(:basename).and_return('imagename')

    file = UploadedFile.create_and_resize(attrs)
    expect(file.descriptive_name).to eql('copy of lease.png')
  end
end
