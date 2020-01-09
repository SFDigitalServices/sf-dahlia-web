class AddApplicationIdAndDeliveredAtToUploadedFiles < ActiveRecord::Migration[4.2]
  def change
    add_column :uploaded_files, :application_id, :string
    add_column :uploaded_files, :delivered_at, :datetime
    add_column :uploaded_files, :error, :string
  end
end
