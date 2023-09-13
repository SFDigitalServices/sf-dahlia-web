# Multiple Listing Image Resizing and Remote Storage
class MultipleListingImageService
  attr_reader :errors

  #TMP_DIR = 'tmp/images'.freeze
  #REMOTE_IMAGE_PATH = 'images/listings'.freeze
  #IMAGE_WIDTH = 768

  def initialize(listing_hash)
    @errors = []
    @listing = listing_hash
    @listing_id = listing_hash['Id']
    @listing_images = listing_hash['Listing_Images']
    @resized_listing_images = FileStorageService.find('images/listings')
  end

  def process_images
    unless @listing_images
      puts "No listing Images for #{@listing_id}"
      add_error(@errors, "No listing images provided for listing #{@listing_id}")
      return self
    end

    @listing_images.each do |listing_image|
      li_raw_image_url = listing_image['Image_URL']
      cache_string = get_cache_string(@listing_id, li_raw_image_url)
      image_name = get_image_name(@listing_id, cache_string)
      tmp_image_path = get_tmp_image_path(image_name)
      remote_image_path = get_remote_image_path(image_name)
      image_url = get_image_url(remote_image_path)
      p "   LI #{li_raw_image_url}"

      if !resized_image(image_name, @resized_listing_images)
        p '     resizing and uploading'
        if resize_and_upload_image(li_raw_image_url, tmp_image_path, remote_image_path, @listing_id)
          p '     create or update'
          create_or_update_listing_image(@listing_id, image_url, li_raw_image_url)
        end
      else
        create_or_update_listing_image(@listing_id, image_url, li_raw_image_url)
      end
      # elsif !listing_image_current(@listing_id, image_url)
      #   create_or_update_listing_image(@listing_id, image_url)
      # end
    end
    self
  end
end

  private

def get_cache_string(listing_id, raw_image_url)
  cache_string ||= Digest::MD5.hexdigest(listing_id + raw_image_url)
  cache_string
end

def get_image_name(listing_id, cache_string)
  "#{listing_id}-#{cache_string}.jpg"
end

def get_remote_image_path(image_name)
  "images/listings/#{image_name}"
end

def get_image_url(remote_image_path)
  base_image_url = ENV['RESOURCE_URL']
  "#{base_image_url}/#{remote_image_path}"
end

def get_tmp_image_path(image_name)
  "tmp/images/#{image_name}"
end

def resized_image(image_name, resized_listing_images)
  resized_listing_images.count { |file| file.key.end_with?(image_name) }.positive?
end

def listing_image_current(listing_id, image_url)
  listing_images_by_id = ListingImage.where(salesforce_listing_id: listing_id)
  current_listing_image = listing_images_by_id.select do |li|
    li && li.image_url == image_url
  end
  current_listing_image&.length&.positive?
end

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
  Dir.mkdir('tmp/images') unless Dir.exist?('tmp/images')
  image = MiniMagick::Image.open(image_url)
  p image
  throw MiniMagick::Invalid unless image.valid?
  # set width only and height is adjusted to maintain aspect ratio
  image.resize(768.to_s)
  image.format('jpg')
  image.write(tmp_image_path)
  ImageOptimizer.new(tmp_image_path, quality: 75).optimize
  true
rescue MiniMagick::Invalid => e
  puts e
  add_error(@errors, "Image for listing #{listing_id} is unreadable")
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
end

def add_error(errors, error_message)
  errors << "MultipleListingImageService error: #{error_message}"
  errors
end
