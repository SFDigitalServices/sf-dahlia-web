# Model for storing temporary uploaded files in the DB
class UploadedFile < ActiveRecord::Base
  enum preference: %i(workInSf liveInSf neighborhoodResidence)

  def self.create_and_resize(attrs)
    mb1 = File.size(attrs[:file].tempfile.path) / 1_000_000.0
    ImageOptimizer.new(attrs[:file].tempfile.path, level: 2, quality: 75).optimize
    mb2 = File.size(attrs[:file].tempfile.path) / 1_000_000.0
    puts "before: #{mb1}, after: #{mb2}"
    attrs[:file] = attrs[:file].read
    create(attrs)
  end

  # override as_json to omit the actual binary file since it's big and unncessary
  def as_json(_options = {})
    super(except: %i(file))
  end

  def descriptive_name
    "#{preference_name} - #{document_type}#{File.extname(name)}"
  end

  def preference_name
    # for neighborhoodResidence we combine NRHP and liveInSf in the filename
    # because NRHP proof doubles as liveInSf proof
    if preference.to_s == 'neighborhoodResidence'
      'NRHP-liveInSf'
    else
      preference
    end
  end
end
