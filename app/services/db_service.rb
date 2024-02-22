# service for interacting with the postgres database
class DbService
  attr_reader :errors

  def initialize
    @errors = []
  end

  def cleanup_listing_images
    listing_images = ListingImage.where('created_at < ?', 1.year.ago)
    Rails.logger.info("Deleting #{listing_images.count} stale listing image records")

    listing_images.destroy_all
    true
  rescue StandardError => e
    Rails.logger.error("Error cleaning up listing images: #{e.class.name}, #{e.message}")
    false
  end
end
