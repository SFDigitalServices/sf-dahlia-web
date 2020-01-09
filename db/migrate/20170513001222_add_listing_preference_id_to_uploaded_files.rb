class AddListingPreferenceIdToUploadedFiles < ActiveRecord::Migration[4.2]
  def change
    add_column :uploaded_files, :listing_preference_id, :string
    remove_column :uploaded_files, :preference, :integer
  end
end
