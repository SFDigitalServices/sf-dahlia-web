require 'rails_helper'

describe MultipleListingImageService do
  json_path = "#{Rails.root}/spec/javascripts/fixtures/json/listings-multiple-listing-images.json"
  listing_json = File.read(json_path)
  listing = JSON.parse(listing_json)['listing']
  listing_id = listing['Id'] if listing
  image_path = "#{Rails.root}/app/assets/images/logo-city.png"

  before do
    # mock remote storage connection
    allow(FileStorageService).to receive(:find).and_return([])
    allow(FileStorageService).to receive(:upload).and_return(true)
  end

  describe '.process_images' do
    it 'should return an error if the image is unreadable' do
      stub_request(:get, /(\.jpg|\.png|\.jpeg)/)
        .to_return(body: File.new("#{Rails.root}/README.md"), status: 200)

      image_processor = MultipleListingImageService.new(listing).process_images

      error_message =
        "MultipleListingImageService error: Bad image url for listing #{listing_id}"
      expect(image_processor.errors.first).to include(error_message)
    end

    it 'should return standard error when reading image' do
      stub_request(:get, /(\.jpg|\.png|\.jpeg)/)
        .to_return(body: File.new("#{Rails.root}/README.md"), status: 500)

      image_processor = MultipleListingImageService.new(listing).process_images

      error_message =
        "MultipleListingImageService error: Bad image url for listing #{listing_id}"
      expect(image_processor.errors.first).to start_with(error_message)
    end

    it 'should upload a listing image' do
      stub_request(:get, /(\.jpg|\.png|\.jpeg)/)
        .to_return(
          body: File.new(image_path),
          status: 200,
          headers: { 'Content-Type' => 'image/png' },
        )

      MultipleListingImageService.new(listing).process_images

      expect(FileStorageService).to have_received(:upload)
    end

    it 'should save a reference to the uploaded file' do
      stub_request(:get, /(\.jpg|\.png|\.jpeg)/)
        .to_return(
          body: File.new(image_path),
          status: 200,
          headers: { 'Content-Type' => 'image/png' },
        )

      image_processor = MultipleListingImageService.new(listing)
      allow(image_processor).to receive(:resized_image?).and_return(true)

      image_processor.process_images
      listing_image = ListingImage.where(salesforce_listing_id: listing_id).first

      expect(listing_image.image_url).to include(listing_id)
    end
  end
end
