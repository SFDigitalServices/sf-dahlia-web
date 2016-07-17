class AddSalesforceContactIdToUsers < ActiveRecord::Migration
  def change
    add_column :users, :salesforce_contact_id, :string
  end
end
