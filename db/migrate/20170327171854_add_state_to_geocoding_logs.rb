class AddStateToGeocodingLogs < ActiveRecord::Migration
  def change
    add_column :geocoding_logs, :state, :string
  end
end
