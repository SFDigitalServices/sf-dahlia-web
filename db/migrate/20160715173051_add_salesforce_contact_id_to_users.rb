class AddSalesforceContactIdToUsers < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :salesforce_contact_id, :string
  end
end
