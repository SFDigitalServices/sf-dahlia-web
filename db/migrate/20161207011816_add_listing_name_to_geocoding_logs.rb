class AddListingNameToGeocodingLogs < ActiveRecord::Migration
  def change
    add_column :geocoding_logs, :listing_name, :string
  end
end
