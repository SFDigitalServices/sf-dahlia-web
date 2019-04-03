class AddAllowPasswordChangeToUsers < ActiveRecord::Migration
  def change
    add_column :users, :allow_password_change, :boolean, default: false, null: false
  end
end
