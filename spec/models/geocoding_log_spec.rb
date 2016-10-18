require 'rails_helper'

describe GeocodingLog, type: :model do
  it 'should create a new instance of GeocodingLog given valid attributes' do
    # use Factory
    create(:geocoding_log)
  end
end
