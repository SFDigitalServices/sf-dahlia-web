# Listing Image Resizing and Remote Storage
# Note: generic image functions should be moved to a separate ImageService
# if image functionality is needed for other purposes
class ListingImageService
  attr_reader :errors

  REMOTE_IMAGE_PATH = 'images/listings'.freeze
  IMAGE_WIDTH = 768

  def initialize(listing_hash)
    @errors = []
    @listing = listing_hash
    @listing_id = listing_hash['Id']
    @raw_image_url = listing_hash['Building_URL']
    @resized_listing_images = FileStorageService.files.all(prefix: REMOTE_IMAGE_PATH)
  end

  def process_image
    unless raw_image_url
      add_error("No image provided for listing #{listing_id}")
      return self
    end

    unless resized_image?
      if resize_and_upload_image
        listing_image =
          ListingImage.find_or_initialize_by(salesforce_listing_id: listing_id)
        listing_image.update(image_url: image_url)
      end
    end

    self
  end

  private

  attr_accessor :listing, :listing_id, :raw_image_url, :resized_listing_images

  def cache_string
    @cache_string ||= Digest::MD5.hexdigest(listing_id + raw_image_url)
  end

  def image_name
    "#{listing_id}-#{cache_string}.jpg"
  end

  def image_path
    "#{REMOTE_IMAGE_PATH}/#{image_name}"
  end

  def image_url
    base_image_url = ENV['RESOURCE_URL'] || 'https://d3047bfujujwqc.cloudfront.net'
    "#{base_image_url}/#{image_path}"
  end

  def resized_image?
    resized_listing_images.count { |file| file.key.end_with?(image_name) } > 0
  end

  def resize_and_upload_image
    image_blob = resize_image(raw_image_url)
    FileStorageService.upload(image_blob, image_path) if image_blob
  end

  def resize_image(image, width = IMAGE_WIDTH)
    image = MiniMagick::Image.open(image)
    unless image.valid?
      add_error("Image for listing #{listing_id} is unreadable")
      return false
    end
    # set width only and height is adjusted to maintain aspect ratio
    image.resize width.to_s
    image.format 'jpg'
    image.to_blob
    # ImageOptimizer.new(image_path, quality: 75).optimize
  end

  def add_error(error_message)
    @errors << "ListingImageService error: #{error_message}"
  end
end
