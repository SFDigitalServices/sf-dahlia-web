# Model for storing temporary uploaded files in the DB
class UploadedFile < ActiveRecord::Base
  enum rent_burden_type: %i(lease rent)

  # override as_json to omit the actual binary file since it's big and unncessary
  def as_json(_options = {})
    super(except: %i(file))
  end

  def descriptive_name
    "#{document_type}#{File.extname(name)}"
  end
end
