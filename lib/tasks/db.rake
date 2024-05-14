namespace :db do
  desc 'Clean up the database of listing images that were uploaded over one year ago'
  task cleanup_listing_images: :environment do
    DbService.new.cleanup_listing_images
  end
end
