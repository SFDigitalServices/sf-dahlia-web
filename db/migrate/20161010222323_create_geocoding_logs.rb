class CreateGeocodingLogs < ActiveRecord::Migration
  def change
    create_table :geocoding_logs do |t|
      t.string :address
      t.string :city
      t.string :zip
      t.string :listing_id
      t.json :member
      t.json :applicant

      t.timestamps null: false
    end
  end
end
