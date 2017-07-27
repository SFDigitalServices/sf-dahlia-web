# Remote File Storage
class FileStorageService
  REMOTE_BUCKET = 'sf-dahlia'.freeze

  def self.files
    if @connection.nil?
      @connection =
        Fog::Storage.new(
          aws_access_key_id: ENV['S3_ACCESS_KEY_ID'],
          aws_secret_access_key: ENV['S3_ACCESS_KEY'],
          provider: 'AWS',
          region: 'us-west-1',
        ).directories.get(REMOTE_BUCKET).files
    end
    @connection
  end
end
