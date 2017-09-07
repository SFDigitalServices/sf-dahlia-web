class AddListingPreferenceIdToUploadedFiles < ActiveRecord::Migration
  def change
    add_column :uploaded_files, :listing_preference_id, :string
    remove_column :uploaded_files, :preference, :integer
  end
end
