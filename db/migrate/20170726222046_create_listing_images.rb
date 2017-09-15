class CreateListingImages < ActiveRecord::Migration
  def change
    create_table :listing_images do |t|
      t.string :salesforce_listing_id
      t.string :image_url

      t.timestamps null: false
    end

    add_index :listing_images, :salesforce_listing_id
  end
end
