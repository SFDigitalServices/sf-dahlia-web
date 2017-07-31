# Remote File Storage
class FileStorageService
  attr_reader :errors

  REMOTE_BUCKET = 'sf-dahlia'.freeze
  REGION = 'us-west-1'.freeze

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

  def self.upload(file_blob, filename)
    files.create(
      key: filename,
      body: file_blob,
      public: true,
    )
  end
end
