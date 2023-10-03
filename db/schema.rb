# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2023_09_14_205521) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "geocoding_logs", id: :serial, force: :cascade do |t|
    t.string "address"
    t.string "city"
    t.string "zip"
    t.string "listing_id"
    t.jsonb "member"
    t.jsonb "applicant"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "listing_name"
    t.string "state"
  end

  create_table "listing_images", id: :serial, force: :cascade do |t|
    t.string "salesforce_listing_id"
    t.string "image_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "raw_image_url", default: "none", null: false
    t.index ["raw_image_url"], name: "index_raw_image_url_on_listing_images"
    t.index ["salesforce_listing_id"], name: "index_listing_images_on_salesforce_listing_id"
  end

  create_table "uploaded_files", id: :serial, force: :cascade do |t|
    t.binary "file"
    t.string "name"
    t.string "content_type"
    t.string "session_uid"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "listing_id"
    t.string "document_type"
    t.integer "user_id"
    t.string "address"
    t.integer "rent_burden_type"
    t.string "rent_burden_index"
    t.string "listing_preference_id"
    t.string "application_id"
    t.datetime "delivered_at"
    t.string "error"
    t.index ["rent_burden_type", "rent_burden_index", "address"], name: "rent_burden_idx"
    t.index ["session_uid"], name: "index_uploaded_files_on_session_uid"
    t.index ["user_id"], name: "index_uploaded_files_on_user_id"
  end

  create_table "users", id: :serial, force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "provider", default: "email", null: false
    t.string "uid", default: "", null: false
    t.json "tokens"
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet "current_sign_in_ip"
    t.inet "last_sign_in_ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.string "salesforce_contact_id"
    t.string "temp_session_id"
    t.boolean "allow_password_change", default: false, null: false
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["temp_session_id"], name: "index_users_on_temp_session_id"
    t.index ["uid", "provider"], name: "index_users_on_uid_and_provider", unique: true
  end

end
