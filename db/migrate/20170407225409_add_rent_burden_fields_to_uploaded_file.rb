class AddRentBurdenFieldsToUploadedFile < ActiveRecord::Migration[4.2]
  def change
    add_column :uploaded_files, :address, :string
    add_column :uploaded_files, :rent_burden_type, :integer
  end
end
