namespace :listing_images do
  desc 'Process Listing Images'
  task process_images: :environment do
    listings = Force::ListingService.listings
    listings.each do |listing|
      MultipleListingImageService.new(listing).process_images
    end
  end
end
