require 'restforce'
# encapsulate all Salesforce querying functions in one handy service
class SalesforceService
  def self.client
    Restforce.new
  end

  def self.query(q)
    client.query(q)
  end

  def self.listings
    q = %{
      Select Id,
      Property_Name__c,
      Property_Street_Address__c,
      Property_City__c,
      Property_State__c,
      Property_Zip_Code__c,
      Developer__c,
      Application_Due_Date__c,
      Property_URL__c,
      (
        SELECT Unit_Type__c,
        BMR_Rent_Monthly__c,
        BMR_Rental_Minimum_Monthly_Income_Needed__c FROM Units__r
      ),
      Application_Phone__c
      from Listing__c Where Status__c = 'Active'
    }

    begin
      # do we need to worry about pages?
      query(q).current_page
    rescue
      []
    end
  end
end
