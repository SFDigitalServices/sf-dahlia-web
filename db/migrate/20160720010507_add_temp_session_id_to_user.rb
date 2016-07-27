class AddTempSessionIdToUser < ActiveRecord::Migration
  def change
    add_column :users, :temp_session_id, :string
    add_index :users, :temp_session_id
  end
end
