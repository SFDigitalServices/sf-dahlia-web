class UpdateUploadedFilesUserId < ActiveRecord::Migration
  def change
    remove_index :uploaded_files, column: %i(session_uid userkey listing_id preference),
                               name: 'composite_uid'
    remove_column :uploaded_files, :userkey
    add_column :uploaded_files, :user_id, :integer
    add_index :uploaded_files, :session_uid
    add_index :uploaded_files, :user_id
  end
end
