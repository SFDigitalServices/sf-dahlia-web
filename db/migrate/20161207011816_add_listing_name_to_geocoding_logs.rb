class AddListingNameToGeocodingLogs < ActiveRecord::Migration[4.2]
  def change
    add_column :geocoding_logs, :listing_name, :string
  end
end
