# POC: uploaded_files.user_id holds a Devise users.id or a Clerk user id ("user_...").
# See docs/clerk-devise-bridge.md ("Shim over $auth").
class ChangeUploadedFilesUserIdToString < ActiveRecord::Migration[7.2]
  def up
    change_column :uploaded_files, :user_id, :string
  end

  def down
    # Clerk ids can't become integers; they are dropped to NULL.
    change_column :uploaded_files, :user_id, :integer,
                  using: "CASE WHEN user_id ~ '^[0-9]+$' THEN user_id::integer END"
  end
end
