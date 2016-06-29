class CreateUploadedFiles < ActiveRecord::Migration
  def change
    create_table :uploaded_files do |t|
      t.binary :file
      t.string :name
      t.string :content_type
      t.string :session_uid
      t.string :userkey
      t.integer :preference

      t.timestamps null: false
    end

    add_index :uploaded_files, [:session_uid, :userkey, :preference],
                               unique: true,
                               name: 'composite_uid'
  end
end
