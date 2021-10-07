# Listing Image Resizing and Remote Storage
# Note: generic image functions should be moved to a separate ImageService
# if image functionality is needed for other purposes
class ListingImageService
  attr_reader :errors

  TMP_DIR = 'tmp/images'.freeze
  REMOTE_IMAGE_PATH = 'images/listings'.freeze
  IMAGE_WIDTH = 768

  def initialize(listing_hash)
    @errors = []
    @listing = listing_hash
    @listing_id = listing_hash['Id']
    @raw_image_url = listing_hash['Building_URL']
    @resized_listing_images = FileStorageService.find(REMOTE_IMAGE_PATH)
  end

  def process_image
    unless raw_image_url
      puts 'Error, no image provided for listing'
      add_error("No image provided for listing #{listing_id}")
      return self
    end

    if !resized_image?
      puts 'Not resized image, going to try to resize first. '
      create_or_update_listing_image if resize_and_upload_image
    elsif !listing_image_current?
      puts '!listing_image_current, going to just create_or_update_listing_image. '
      create_or_update_listing_image
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

  def remote_image_path
    "#{REMOTE_IMAGE_PATH}/#{image_name}"
  end

  def image_url
    base_image_url = ENV['RESOURCE_URL']
    "#{base_image_url}/#{remote_image_path}"
  end

  def tmp_image_path
    "#{TMP_DIR}/#{image_name}"
  end

  def resized_image?
    resized_listing_images.count { |file| file.key.end_with?(image_name) } > 0
  end

  def listing_image_current?
    listing_image = ListingImage.where(salesforce_listing_id: listing_id).first
    listing_image && listing_image.image_url == image_url
  end

  def resize_and_upload_image
    if resize_image(raw_image_url)
      puts 'yes to resize image. '
      uploaded = false
      File.open(tmp_image_path) do |file|
        puts 'resize_and_upload_image file open about to call upload. '
        # cache images for 1 yr since we change the filename when image changes
        uploaded = FileStorageService.upload(
          remote_image_path,
          file,
          cache_control: 'max-age=31536000',
        )
      end
      File.delete(tmp_image_path)
      uploaded
    else
      puts 'no to resize image. '
      false
    end
  end

  def resize_image(image)
    puts 'In Resize image, TMP_DIR = ', TMP_DIR, ' and it exists? ', Dir.exist?(TMP_DIR)
    Dir.mkdir(TMP_DIR) unless Dir.exist?(TMP_DIR)
    image = MiniMagick::Image.open(image)
    puts '. Minimagick opened the image, and image is valid? ', image.valid?
    throw MiniMagick::Invalid unless image.valid?
    # set width only and height is adjusted to maintain aspect ratio
    image.resize(IMAGE_WIDTH.to_s)
    image.format('jpg')
    image.write(tmp_image_path)
    ImageOptimizer.new(tmp_image_path, quality: 75).optimize
    true
  rescue MiniMagick::Invalid
    puts 'MiniMagick is Invalid. '
    add_error("Image for listing #{listing_id} is unreadable")
    false
  end

  def create_or_update_listing_image
    listing_image =
      ListingImage.find_or_initialize_by(salesforce_listing_id: listing_id)
    listing_image.update(image_url: image_url)
  end

  def add_error(error_message)
    @errors << "ListingImageService error: #{error_message}"
  end
end
