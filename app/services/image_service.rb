# Image Resizing and Remote Storage
class ImageService
  REMOTE_BUCKET = 'sf-dahlia'.freeze
  REMOTE_IMAGE_PATH = 'images/listings'.freeze

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
    Dir.mktmpdir do |tempdir|
      image_path = "#{tempdir}/#{filename}"
      image = MiniMagick::Image.open(image_url)
      # set width only and height is adjusted to maintain aspect ratio
      image.resize(width)
      # using jpg file extension will convert to jpg
      image.write(image_path)
      # ImageOptimizer.new(image_path, quality: 75).optimize
      remote_storage.create(
        key: "#{REMOTE_IMAGE_PATH}/#{filename}",
        body: File.open(image_path),
        public: true,
      )
    end
  end

  def self.resized_image?(image_name)
    remote_images.count { |file| file.key.end_with?(image_name) } > 0
  end

  def self.image_url(image_name)
    base_image_url = ENV['RESOURCE_URL'] || 'https://d3047bfujujwqc.cloudfront.net'
    "#{base_image_url}/#{REMOTE_IMAGE_PATH}/#{image_name}"
  end

  def self.remote_images
    if @remote_image_cache.nil?
      @remote_image_cache = remote_storage.all(prefix: REMOTE_IMAGE_PATH)
    end
    @remote_image_cache
  end

  def self.remote_storage
    if @remote_storage_connection.nil?
      @remote_storage_connection =
        Fog::Storage.new(
          aws_access_key_id: ENV['S3_ACCESS_KEY_ID'],
          aws_secret_access_key: ENV['S3_ACCESS_KEY'],
          provider: 'AWS',
          region: 'us-west-1',
        ).directories.get(REMOTE_BUCKET).files
    end
    @remote_storage_connection
  end
end
