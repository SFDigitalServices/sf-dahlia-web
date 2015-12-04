json.raw  listing

json.id      listing['Id']
json.eligibility_match listing['fake_eligibility_match']
json.name    listing['Property_Name__c']

json.address listing['Property_Street_Address__c']
json.city    listing['Property_City__c']
json.state   listing['Property_State__c']
json.zipcode listing['Property_Zip_Code__c']

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
  json.contact_phone listing['Application_Phone__c']
  json.due_date listing['Application_Due_Date__c']
  json.download_url listing['Download_URL__c']
  json.online_url listing['Property_URL__c']
  json.fee listing['Fee__c']
  json.deposit_min listing['Deposit_Min__c']
  json.deposit_max listing['Deposit_Max__c']
  json.costs_not_included listing['Costs_Not_Included__c']
end

json.developer listing['Developer__c']
json.neighborhood listing['Neighborhood__c']
json.year_built listing['Year_Built__c']

# legal
json.property_selection_criteria listing['Property_Selection_Criteria__c']
json.required_documents listing['Required_Documents__c']
json.legal_disclaimers listing['Legal_Disclaimers__c']
json.smoking_policy listing['Smoking_Policy__c']
json.pet_policy listing['Pet_Policy__c']



json.image_url "http://placehold.it/474x316"
