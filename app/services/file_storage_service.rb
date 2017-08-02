# Remote File Storage
class FileStorageService
  attr_reader :errors

  REMOTE_BUCKET = ENV['S3_BUCKET']
  REGION = ENV['S3_REGION'] || 'us-west-1'.freeze

  def self.connection
    @connection ||= Fog::Storage.new(
      aws_access_key_id: ENV['S3_ACCESS_KEY_ID'],
      aws_secret_access_key: ENV['S3_ACCESS_KEY'],
      provider: 'AWS',
      region: REGION,
    )
  end

  def self.files
    @files ||= connection.directories.get(REMOTE_BUCKET).files
  end

  def self.find(prefix)
    files.all(prefix: prefix)
  end

  def self.upload(filename, file_blob, options = {})
    options[:key] = filename
    options[:body] = file_blob
    # Files are accessed through cloudfront so don't need to be public
    options[:public] = false

    files.create(options)
  end
end
