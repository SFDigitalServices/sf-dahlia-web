# Model for storing temporary uploaded files in the DB
class UploadedFile < ActiveRecord::Base
  enum preference: %i(
    workInSf
    liveInSf
    neighborhoodResidence
    antiDisplacement
    assistedHousing
    rentBurden
  )
  enum rent_burden_type: %i(lease rent)

  def descriptive_name
    "#{preference_name} - #{document_type}#{File.extname(name)}"
  end

  def preference_name
    # for neighborhoodResidence we combine NRHP and liveInSf in the filename
    # because NRHP proof doubles as liveInSf proof
    if preference.to_s == 'neighborhoodResidence'
      'NRHP-liveInSf'
    elsif preference.to_s == 'rentBurden'
      # NOTE: this won't need to be in the filename after Salesforce attachment refactor
      "rentBurden-#{rent_burden_type} #{address}"
    else
      preference
    end
  end
end
