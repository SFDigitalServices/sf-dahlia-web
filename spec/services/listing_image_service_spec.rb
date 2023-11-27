require 'rails_helper'

describe ListingImageService do
  json_path = "#{Rails.root}/spec/javascripts/fixtures/json/listings-api-show.json"
  listing_json = File.read(json_path)
  listing = JSON.parse(listing_json)['listing']
  listing_id = listing['Id'] if listing
  image_path = "#{Rails.root}/app/assets/images/logo-city.png"

  before do
    # mock remote storage connection
    allow(FileStorageService).to receive(:find).and_return([])
    allow(FileStorageService).to receive(:upload).and_return(true)

    # stub external image requests
    stub_request(:get, /(\.jpg|\.png|\.jpeg)/)
      .to_return(body: File.new(image_path), status: 200)
  end

  describe '.process_image' do
    it 'should return an error if the image is unreadable' do
      stub_request(:get, /(\.jpg|\.png|\.jpeg)/)
        .to_return(body: File.new("#{Rails.root}/README.md"), status: 200)

      image_processor = ListingImageService.new(listing).process_image

      error_message =
        "ListingImageService error: Image for listing #{listing_id} is unreadable"
      expect(image_processor.errors).to include(error_message)
    end

    it 'should return standard error when reading image' do
      stub_request(:get, /(\.jpg|\.png|\.jpeg)/)
        .to_return(body: File.new("#{Rails.root}/README.md"), status: 500)

      image_processor = ListingImageService.new(listing).process_image

      error_message =
        'ListingImageService error: Unable to process image for listing '\
        'a0W0P00000F8YG4UAN with image'
      expect(image_processor.errors.first).to start_with(error_message)
    end

    it 'should upload a listing image' do
      stub_const('ENV', ENV.to_hash.merge('CACHE_LISTING_IMAGES' => true))

      ListingImageService.new(listing).process_image

      expect(FileStorageService).to have_received(:upload)
    end

    it 'should save a reference to the uploaded file' do
      image_processor = ListingImageService.new(listing)
      allow(image_processor).to receive(:resized_image?).and_return(true)

      image_processor.process_image
      listing_image = ListingImage.where(salesforce_listing_id: listing_id).first

      expect(listing_image.image_url).to include(listing_id)
    end
  end
end
