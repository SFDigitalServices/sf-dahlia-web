class AddRentBurdenFieldsToUploadedFile < ActiveRecord::Migration
  def change
    add_column :uploaded_files, :address, :string
    add_column :uploaded_files, :rent_burden_type, :integer
  end
end
