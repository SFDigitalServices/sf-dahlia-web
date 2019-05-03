class AddTempSessionIdToUser < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :temp_session_id, :string
    add_index :users, :temp_session_id
  end
end
