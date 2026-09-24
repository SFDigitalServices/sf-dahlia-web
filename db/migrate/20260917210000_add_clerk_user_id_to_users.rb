# frozen_string_literal: true

class AddClerkUserIdToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :clerk_user_id, :string
    add_index :users, :clerk_user_id, unique: true
  end
end
