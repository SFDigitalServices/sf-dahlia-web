namespace :listing_images do
  desc 'Build Listing Images'
  task update_urls: :environment do
    listings = ListingService.listings
    listings.each do |listing|
      ListingImageService.new(listing).save_image_url
    end
  end
  task process_images: :environment do
    listings = ListingService.listings
    listings.each do |listing|
      ListingImageService.new(listing).process_image
    end
  end
end
