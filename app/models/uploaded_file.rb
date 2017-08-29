# Model for storing temporary uploaded files in the DB
class UploadedFile < ActiveRecord::Base
  enum rent_burden_type: %i(lease rent)

  def self.create_and_resize(attrs)
    tempfile_path = attrs[:file].tempfile.path
    unless attrs[:content_type] == 'application/pdf'
      if attrs[:content_type] == 'image/png'
        # convert png -> jpeg
        image = MiniMagick::Image.new(tempfile_path)
        image.format 'jpg'
        attrs[:content_type] = 'image/jpeg'
      end
      # compress/optimize all jpegs
      ImageOptimizer.new(tempfile_path, quality: 75).optimize
    end
    # read file data into :file attribute
    attrs[:file] = File.read(tempfile_path)
    # simplify uploaded filename to remove extension
    attrs[:name] = File.basename(attrs[:name], File.extname(attrs[:name]))
    create(attrs)
  end

  # override as_json to omit the actual binary file since it's big and unncessary
  def as_json(_options = {})
    super(except: %i(file))
  end

  def descriptive_name
    ext = content_type.rpartition('/').last
    ext = 'jpg' if ext == 'jpeg'
    "#{document_type}.#{ext}"
  end
end
