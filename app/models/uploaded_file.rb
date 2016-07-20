# Model for storing temporary uploaded files in the DB
class UploadedFile < ActiveRecord::Base
  enum preference: %i(workInSf liveInSf neighborhoodResidence)

  def descriptive_name
    "#{preference} - #{document_type}#{File.extname(name)}"
  end
end
