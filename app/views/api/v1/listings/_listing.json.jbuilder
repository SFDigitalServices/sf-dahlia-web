json.raw  listing

json.id      listing['Id']
json.name    listing['Property_Name__c']

json.address listing['Property_Street_Address__c']
json.city    listing['Property_City__c']
json.state   listing['Property_State__c']
json.zipcode listing['Property_Zip_Code__c']

json.application_due_date listing['Application_Due_Date__c']
if listing['Units__r']
  json.units listing['Units__r'].collect{ |unit|
    {
      unit_type:          unit['Unit_Type__c'],
      min_monthly_income: unit['BMR_Rental_Minimum_Monthly_Income_Needed__c'],
      rent:               unit['BMR_Rent_Monthly__c']
    }
  }
end

json.application_info do
  json.property_manager_phone listing['Application_Phone__c']
end

json.developer listing['Developer__c']

json.neighborhood listing['Neighborhood__c']


json.image_url "http://placehold.it/474x316"
