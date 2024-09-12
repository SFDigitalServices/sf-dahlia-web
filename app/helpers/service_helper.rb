# Helper methods for services
module ServiceHelper
  LISTING_FIELD_NAMES_TO_TRANSLATE = %w[
    Accessibility
    Amenities
    Appliances
    Costs_Not_Included
    Credit_Rating
    Legal_Disclaimers
    Leasing_Agent_Title
    Listing_Other_Notes
    Lottery_Summary
    Lottery_Venue
    Office_Hours
    Parking_Information
    Pet_Policy
    Pricing_Matrix
    Eviction_History
    Required_Documents
    Reserved_community_type_Description
    Services_Onsite
    Smoking_Policy
    Utilities
    Realtor_Commission_Info
    Repricing_Mechanism
  ].freeze

  def self.listing_field_names
    LISTING_FIELD_NAMES_TO_TRANSLATE
  end

  def self.listing_field_names_salesforce
    LISTING_FIELD_NAMES_TO_TRANSLATE.map do |field|
      convert_to_salesforce_field_name(field)
    end
  end

  def self.convert_to_salesforce_field_name(field_name)
    "#{field_name}__c"
  end

  def self.convert_to_domain_field_name(field_name)
    field_name[0..-4]
  end
end
