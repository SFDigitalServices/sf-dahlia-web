class AddColumnAndIndexToListingImages < ActiveRecord::Migration[6.1]
  def change
    add_column(:listing_images, :raw_image_url, :string, default: 'none', null: false, if_not_exists: true)
    add_index(:listing_images, :raw_image_url, name: 'index_raw_image_url_on_listing_images')
  end
end
