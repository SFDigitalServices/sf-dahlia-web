class CreateUploadedFiles < ActiveRecord::Migration
  def change
    create_table :uploaded_files do |t|
      t.binary :file
      t.string :name
      t.string :content_type
      t.string :session_uid
      t.string :userkey

      t.timestamps null: false
    end

    add_index :uploaded_files, [:session_uid, :userkey]
  end
end
