class AddListingIdToUploadedFiles < ActiveRecord::Migration
  def change
    add_column :uploaded_files, :listing_id, :string
    add_column :uploaded_files, :document_type, :string

    remove_index :uploaded_files, name: 'composite_uid', column: %i(session_uid userkey preference)
    add_index :uploaded_files, %i(session_uid userkey listing_id preference),
                               unique: true,
                               name: 'composite_uid'
  end
end
