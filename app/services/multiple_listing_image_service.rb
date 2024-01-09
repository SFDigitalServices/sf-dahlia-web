# Multiple Listing Image Resizing and Remote Storage
class MultipleListingImageService
  attr_reader :errors

  TMP_DIR = 'tmp/images'.freeze
  REMOTE_IMAGE_PATH = 'images/listings'.freeze
  IMAGE_WIDTH = 768

  def initialize(listing_hash)
    @errors = []
    @listing = listing_hash
    @listing_id = listing_hash['Id']
    @listing_images = listing_hash['Listing_Images']
    @resized_listing_images = FileStorageService.find(REMOTE_IMAGE_PATH)
  end

  def process_images
    return if @listing_images.blank?
    @listing_images.each do |listing_image|
      li_raw_image_url = listing_image['Image_URL']

      li_raw_image_url.blank? && next

      cache_string = get_cache_string(@listing_id, li_raw_image_url)
      image_name = get_image_name(@listing_id, cache_string)
      tmp_image_path = get_tmp_image_path(image_name)
      remote_image_path = get_remote_image_path(image_name)
      image_url = get_image_url(remote_image_path)

      # Check if the image has been uploaded to S3 bucket before
      if !resized_image?(image_name, @resized_listing_images)
        # If not, resize the image and upload to S3 bucket
        Rails.logger.info("Resizing and uploading #{image_name}")
        if resize_and_upload_image(li_raw_image_url, tmp_image_path, remote_image_path, @listing_id)
          # If upload was successful, create or update the record in Postgres
          create_or_update_listing_image(@listing_id, image_url, li_raw_image_url)
        end
      # Else, if the image has been uploaded, check if we need to create the record in Postgres
      elsif !listing_image_current?(@listing_id, image_url) || ENV['FORCE_MULTIPLE_LISTING_IMAGE_UPDATE'].to_s.casecmp('true').zero?
        # if the listing_image record containing the image_url does not exist, create it
        create_or_update_listing_image(@listing_id, image_url, li_raw_image_url)
      end
    end
    self
  end

  private

  def get_cache_string(listing_id, raw_image_url)
    Digest::MD5.hexdigest(listing_id + raw_image_url)
  end

  def get_image_name(listing_id, cache_string)
    "#{listing_id}-#{cache_string}.jpg"
  end

  def get_remote_image_path(image_name)
    "#{REMOTE_IMAGE_PATH}/#{image_name}"
  end

  def get_image_url(remote_image_path)
    base_image_url = ENV['RESOURCE_URL']
    "#{base_image_url}/#{remote_image_path}"
  end

  def get_tmp_image_path(image_name)
    "#{TMP_DIR}/#{image_name}"
  end

  def resized_image?(image_name, resized_listing_images)
    resized_listing_images.count { |file| file.key.end_with?(image_name) }.positive?
  end

  def listing_image_current?(listing_id, image_url)
    ListingImage.where(salesforce_listing_id: listing_id).where(image_url:).exists?
  end

  # TODO: pull into a new image_upload service?
  def resize_and_upload_image(raw_image_url, tmp_image_path, remote_image_path,
                              listing_id)
    if resize_image(raw_image_url, listing_id, tmp_image_path)
      uploaded = false
      File.open(tmp_image_path) do |file|
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
      false
    end
  end

  def resize_image(image_url, listing_id, tmp_image_path)
    Dir.mkdir(TMP_DIR) unless Dir.exist?(TMP_DIR)
    image = MiniMagick::Image.open(image_url)
    throw MiniMagick::Invalid unless image.valid?
    # set width only and height is adjusted to maintain aspect ratio
    image.resize(768.to_s)
    image.format('jpg')
    image.write(tmp_image_path)
    ImageOptimizer.new(tmp_image_path, quality: 75).optimize
    true
  rescue MiniMagick::Invalid => e
    add_error(@errors, "Image for listing #{listing_id} is unreadable. Error: #{e}")
    false
  rescue StandardError => e
    add_error(@errors, "Unable to process image for listing #{listing_id} with image"\
      " #{image} - #{e.class.name}, #{e.message}")
    false
  end

  def create_or_update_listing_image(listing_id, image_url, li_raw_image_url)
    listing_image = ListingImage.find_or_initialize_by(salesforce_listing_id: listing_id,
                                                       image_url:, raw_image_url: li_raw_image_url)
    listing_image.update(raw_image_url: li_raw_image_url, image_url:)
    Rails.logger.info("Listing image for #{listing_id} updated to #{image_url}")
  end

  def add_error(errors, error_message)
    errors << "MultipleListingImageService error: #{error_message}"
    errors
  end
end
