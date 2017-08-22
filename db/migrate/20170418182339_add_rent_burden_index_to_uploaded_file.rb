class AddRentBurdenIndexToUploadedFile < ActiveRecord::Migration
  def change
    add_column :uploaded_files, :rent_burden_index, :string
    add_index :uploaded_files, [:rent_burden_type, :rent_burden_index, :address], name: 'rent_burden_idx'
  end
end
