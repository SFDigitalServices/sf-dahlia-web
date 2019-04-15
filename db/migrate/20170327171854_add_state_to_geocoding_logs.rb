class AddStateToGeocodingLogs < ActiveRecord::Migration[4.2]
  def change
    add_column :geocoding_logs, :state, :string
  end
end
