# Model for storing temporary uploaded files in the DB
class UploadedFile < ApplicationRecord
  enum :rent_burden_type, { lease: 0, rent: 1 }

  def rent_burden_type_name
    case rent_burden_type
    when 0 then 'lease'
    when 1 then 'rent'
    else 'unknown'
    end
  end

  def self.create_and_resize(attrs)
    tempfile_path = attrs[:file].tempfile.path
    begin
      unless attrs[:content_type] == 'application/pdf'
        if attrs[:content_type] == 'image/png'
          # convert png -> jpeg
          image = MiniMagick::Image.new(tempfile_path)
          if image.valid?
            image.format 'jpg'
            attrs[:content_type] = 'image/jpeg'
          end
        end
        # compress/optimize all jpegs
        ImageOptimizer.new(tempfile_path, quality: 75).optimize
      end
    rescue StandardError => e
      logger.error "UploadedFile.create_and_resize error: png -> jpg conversion, #{e}"
    end
    # read file data into :file attribute
    attrs[:file] = File.read(tempfile_path)
    # simplify uploaded filename to remove extension
    attrs[:name] = File.basename(attrs[:name], File.extname(attrs[:name]))
    create(attrs)
  end

  # override as_json to omit the actual binary file since it's big and unncessary
  def as_json(_options = {})
    super(except: %i[file])
  end

  def descriptive_name
    ext = content_type.rpartition('/').last
    ext = 'jpg' if ext == 'jpeg'
    "#{document_type}.#{ext}"
  end
end
