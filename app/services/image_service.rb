# Image Resizing and Storage
class ImageService
  def self.listing_image_url(listing)
    return '' unless listing['Building_URL']

    timestamp = DateTime.parse(listing['LastModifiedDate']).to_i
    image_name = "#{listing['Id']}-#{timestamp}.jpg"
    unless resized_image?(image_name)
      resize_and_upload(listing['Building_URL'], image_name, '753')
    end
    image_url(image_name)
  end

  def self.resize_and_upload(image_url, filename, width)
    image = MiniMagick::Image.open(image_url)
    # set width only and height is adjusted to maintain aspect ratio
    image.resize width
    # using jpg file extension will convert to jpg
    image.write Rails.root.join('public', 'images', 'listings', filename)
  end

  def self.resized_image?(image_name)
    File.exist?(Rails.root.join('public', 'images', 'listings', image_name))
  end

  def self.image_url(image_name)
    "/images/listings/#{image_name}"
  end
end
