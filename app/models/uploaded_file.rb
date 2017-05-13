# Model for storing temporary uploaded files in the DB
class UploadedFile < ActiveRecord::Base
  enum rent_burden_type: %i(lease rent)

  def descriptive_name
    # "#{preference_name} - #{document_type}#{File.extname(name)}"
    "#{document_type}#{File.extname(name)}"
  end
end
