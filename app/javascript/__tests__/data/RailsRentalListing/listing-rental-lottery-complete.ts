import type RailsRentalListing from "../../../api/types/rails/listings/RailsRentalListing"

/**
 * ListingDetails response for rental listing with status of Lottery Complete
 */
export const lotteryCompleteRentalListing: RailsRentalListing = {
  unitSummaries: {
    reserved: null,
    general: [
      {
        unitType: "Studio",
        totalUnits: 1,
        minSquareFt: 510,
        minRentalMinIncome: 2398,
        minPriceWithParking: null,
        minPriceWithoutParking: null,
        minPercentIncome: null,
        minOccupancy: 1,
        minMonthlyRent: 1199,
        minHoaDuesWithParking: null,
        minHoaDuesWithoutParking: null,
        maxSquareFt: 510,
        maxRentalMinIncome: 2398,
        maxPriceWithParking: null,
        maxPriceWithoutParking: null,
        maxPercentIncome: null,
        maxOccupancy: 2,
        maxMonthlyRent: 1199,
        maxHoaDuesWithParking: null,
        maxHoaDuesWithoutParking: null,
        listingID: "a0W4U00000KnHO6UAN",
        availability: 1,
        absoluteMinIncome: 2398,
        absoluteMaxIncome: 4883,
      },
    ],
  },
  reservedDescriptor: null,
  prioritiesDescriptor: null,
  listingID: "a0W4U00000KnHO6UAN",
  chartTypes: [
    {
      year: "2021",
      percent: 55,
      numOfHousehold: null,
      chartType: "MOHCD Adjusted HUD Unadjusted",
      amount: null,
    },
  ],
  attributes: { type: "Listing", url: "/services/data/v35.0/sobjects/Listing/a0W4U00000KnHO6UAN" },
  Name: "855 Brannan Units 318",
  Realtor_Commission_Unit: "percent",
  Allows_Realtor_Commission: false,
  Parking_Information: "Resident Parking Garage for $100/mo",
  Tenure: "Re-rental",
  First_Come_First_Served: false,
  Building: {
    attributes: {
      type: "Building",
      url: "/services/data/v35.0/sobjects/Building/a0a0P00000ES96PQAT",
    },
    Id: "a0a0P00000ES96PQAT",
    Parking_Cost: 100,
  },
  In_Lottery: 1098,
  Program_Type: "IH-RENTAL",
  Units_Available: 5,
  SASE_Required_for_Lottery_Ticket: false,
  nGeneral_Application_Total: 193,
  Office_Hours: "Monday - Friday 10:00 AM - 6:00 PM",
  Lottery_Status: "Lottery Complete",
  Building_Name: "855 Brannan",
  Project_ID: "2013-003",
  Building_Street_Address: "855 Brannan St",
  Building_City: "San Francisco",
  Building_State: "CA",
  Building_Zip_Code: "94103",
  Developer: "Baker PLC",
  Neighborhood: "South of Market",
  Year_Built: 2017,
  LastModifiedDate: "2022-02-07T21:09:47.000+0000",
  Marketing_URL: "855-Brannan-Uni-Jan22",
  Application_Due_Date: "2022-01-11T01:00:00.000+0000",
  Building_URL: "http://sfmohcd.org/sites/default/files/855%20Brannan.png",
  Legal_Disclaimers:
    '<p><span style="font-size: 10pt; font-family: arial, sans-serif;">All BMR renters must review and acknowledge the </span><a href="http://sf-moh.org/index.aspx?page=295" target="_blank" style="font-size: 10pt; font-family: arial, sans-serif; color: blue;">Inclusionary Affordable Housing Program Monitoring and Procedures Manual 2018</a><span style="font-size: 10pt; font-family: arial, sans-serif;"> that governs this property upon the signing of a lease for a BMR unit. </span></p><p><br></p><p><span style="font-size: 10pt; font-family: arial, sans-serif;">Applicants should be informed that BMR rental units in some buildings may convert to ownership units in the future. In the case of conversion, BMR renters will be afforded certain rights as explained in the </span><a href="http://sf-moh.org/index.aspx?page=295" target="_blank" style="font-size: 10pt; font-family: arial, sans-serif; color: blue;">Inclusionary Affordable Housing Program Monitoring and Procedures Manual 2018</a><span style="font-size: 10pt; font-family: arial, sans-serif;">. Applicants should inquire with the building contact person listed above to determine if the building has a minimum number of years that it must remain a rental building. (Some buildings may have such restrictions based on government sources of financing for their building.) Most buildings may have no restrictions on conversion at all. </span></p><p><br></p><p><span style="font-size: 10pt; font-family: arial, sans-serif;">It is also important to note that units governed by the Inclusionary Housing Program are NOT governed by the San Francisco Rent Ordinance (also known as “rent control”). Among other rules, rents may increase beyond increases allowed under “rent control.” Please see the </span><a href="http://sf-moh.org/index.aspx?page=295" target="_blank" style="font-size: 10pt; font-family: arial, sans-serif; color: blue;">Inclusionary Affordable Housing Program Monitoring and Procedures Manual 2018</a><span style="font-size: 10pt; font-family: arial, sans-serif;"> for more information. </span></p>',
  Application_Phone: "415-872-8106",
  Lottery_Results_Date: "2022-01-26",
  Lottery_Venue:
    '<p><span style="background-color: transparent; color: rgb(0, 0, 0); font-family: Arial; font-size: 10pt;">Lottery today. </span><a href="https://teams.microsoft.com/l/meetup-join/19%3ameeting_ODYzYjMyNGItMzEzMy00YTI1LTk3Y2EtYmI1MThhZWYzY2M0%40thread.v2/0?context=%7b%22Tid%22%3a%2222d5c2cf-ce3e-443d-9a7f-dfcc0231f73f%22%2c%22Oid%22%3a%227de896e3-bd7a-4b1e-893c-64424a3d706a%22%2c%22IsBroadcastMeeting%22%3atrue%7d&amp;btype=a&amp;role=a" target="_blank" style="background-color: transparent; color: rgb(0, 0, 0); font-family: Arial; font-size: 10pt;">Watch it live</a><span style="background-color: transparent; color: rgb(0, 0, 0); font-family: Arial; font-size: 10pt;">.</span></p>',
  Lottery_Date: "2022-01-25T19:00:00.000+0000",
  Publish_Lottery_Results: true,
  LotteryResultsURL:
    "https://sfmohcd.org/sites/default/files/Documents/MOH/Lottery%20Results/855%20Brannan%20%23318%20Lottery%20Results%201.26.22.pdf",
  Accepting_Online_Applications: true,
  Lottery_Winners: 0,
  Credit_Rating:
    "If an applicant has a derogatory credit history that includes a TransUnion Resident Score of 620 or lower (not to be confused with a FICO or other generic consumer score) the following factors will be reviewed: the maximum number of derogatory accounts cannot exceed 25%; the maximum balance of unpaid accounts, including past due accounts, cannot exceed $2500. If the applicant meets these requirements, then a higher deposit of one month’s rent will be required. If not, the application will be denied. Student debt, medical-related collections, lack of credit, or a resolved bankruptcy is not a reason for denial. A bankruptcy in process will result in denial of the\r\nApplication. 7 years of credit history are reviewed, but the most recent 3 years are more heavily weighted.",
  Eviction_History:
    "– Depending on the results of the credit report, applicants may be required to provide proof of income and satisfactory residential history such as recent rental or mortgage history. More than 6 late or returned payments within the last 12 months will result in a denial. Rental history verification will only be for documented lease violations and for-cause evictions (no fault evictions will not be held against a household). No more than 3 years of rental history will be reviewed.",
  Leasing_Agent_Name: "Kathryn Kelley",
  Leasing_Agent_Title: "Leasing Agent",
  Leasing_Agent_Email: "ldavis3@eqr.com",
  Leasing_Agent_Phone: "415-872-8106",
  Accepting_applications_at_leasing_agent: false,
  Accepting_applications_by_PO_Box: false,
  Blank_paper_application_can_be_picked_up: false,
  Fee: 50.5,
  Deposit_Min: 500,
  Deposit_Max: 1199,
  Costs_Not_Included:
    "Late Fee: 5% on the 5th - minimum of $50.\r\nLate Payment is assessed after the 4th of each month.\r\nReturned Check: $25.\r\nPet Rent: $75 per month per pet, max of 3 pets.\r\nPet Deposit: $500.\r\nLock-out Fee: N/A.\r\nKey Replacement: Cost of key.\r\nFob Replacement: Cost of fob.\r\nRenter’s Insurance: Renter’s insurance is required and the insurance amount of $10.75 has been deducted from the monthly maximum rent.\r\nUtilities paid by Renter: Electricity, Cable and Internet\r\nOther Fees: Storage: $75/mo to $175/mo based on size. Bike Lockers: $35/mo",
  Amenities:
    "Fitness and Group Fitness Rooms, Redwood Grove Courtyard, Rooftop Deck with City Views and BBQ Grills, Package Room, Game Room, Resident Lounge and Kitchen.",
  Accessibility:
    "●\tAll lobbies and common spaces in the project provide a fully accessible path of travel including zero-step entrances, interior doors with a minimum clear passage width of 32 inches, wheelchair ramps, and elevators.\r\n●\tAll common restrooms incorporate wheelchair accessible bathrooms\r\n●\tAccessible parking stalls provided in garage.\r\n●\tMail boxes are located within wheelchair reach range",
  Building_Selection_Criteria:
    "https://sfmohcd.org/sites/default/files/Resident%20Selection%20Criteria/855%20Brannan%20Rental%20Criteria%20-%20Approved%204.7.2021.pdf",
  Required_Documents:
    "Due post-lottery: Equity Residential Application for Rental, Application Fee, Photo\r\nIdentification, additional documentation to verify household assets and income.",
  Smoking_Policy: "Smoking is not permitted",
  Pet_Policy:
    "$500 security deposit\r\n$75 per month pet rent\r\nService and/or Assistance Animals are accepted. Prohibited breeds include American Pit Bull Terrier, American Bully, American Staffordshire Terrier, Staffordshire Bull Terrier or any dogs that are cross breeds of or are related to such breeds. Wild (not domesticated) animals and hybrids of wild animals, including wolf and coyote hybrids, are also prohibited, as are monkeys, snakes, ferrets, rabbits, pot belly pigs, and miniature horses.",
  Reserved_community_maximum_age: 0,
  Reserved_community_minimum_age: 0,
  hasWaitlist: true,
  Total_waitlist_openings: 2,
  Total_number_of_building_units: 1,
  RecordTypeId: "0120P000000kPUSQA2",
  Id: "a0W4U00000KnHO6UAN",
  Listing_Lottery_Preferences: [
    {
      attributes: {
        type: "Listing_Lottery_Preference",
        url: "/services/data/v35.0/sobjects/Listing_Lottery_Preference/a0l4U00001c7uN5QAI",
      },
      Listing: "a0W4U00000KnHO6UAN",
      Id: "a0l4U00001c7uN5QAI",
      Total_Submitted_Apps: 1,
      Order: 1,
      Available_Units: 1,
      Current_Units_Available: 1,
      Lottery_Preference: {
        attributes: {
          type: "Lottery_Preference",
          url: "/services/data/v35.0/sobjects/Lottery_Preference/a0m0P00000wwi3IQAQ",
        },
        Id: "a0m0P00000wwi3IQAQ",
        Name: "Certificate of Preference (COP)",
      },
    },
    {
      attributes: {
        type: "Listing_Lottery_Preference",
        url: "/services/data/v35.0/sobjects/Listing_Lottery_Preference/a0l4U00001c7uNAQAY",
      },
      Listing: "a0W4U00000KnHO6UAN",
      Id: "a0l4U00001c7uNAQAY",
      Total_Submitted_Apps: 4,
      Order: 2,
      Available_Units: 1,
      Current_Units_Available: 1,
      Lottery_Preference: {
        attributes: {
          type: "Lottery_Preference",
          url: "/services/data/v35.0/sobjects/Lottery_Preference/a0m0P00000www1mQAA",
        },
        Id: "a0m0P00000www1mQAA",
        Name: "Displaced Tenant Housing Preference (DTHP)",
      },
    },
    {
      attributes: {
        type: "Listing_Lottery_Preference",
        url: "/services/data/v35.0/sobjects/Listing_Lottery_Preference/a0l4U00001c7uNBQAY",
      },
      Listing: "a0W4U00000KnHO6UAN",
      Id: "a0l4U00001c7uNBQAY",
      Total_Submitted_Apps: 905,
      Order: 3,
      Available_Units: 1,
      Current_Units_Available: 1,
      Lottery_Preference: {
        attributes: {
          type: "Lottery_Preference",
          url: "/services/data/v35.0/sobjects/Lottery_Preference/a0m0P00000wwi3NQAQ",
        },
        Id: "a0m0P00000wwi3NQAQ",
        Name: "Live or Work in San Francisco Preference",
      },
    },
  ],
  Open_Houses: [
    {
      attributes: {
        type: "Open_Houses",
        url: "/services/data/v35.0/sobjects/Open_Houses/a0Y4U00000JuSkCUAV",
      },
      Listing: "a0W4U00000KnHO6UAN",
      Id: "a0Y4U00000JuSkCUAV",
      Date: "2022-01-07",
      Start_Time: "5:00PM",
      End_Time: "7:00PM",
    },
  ],
  Units: [
    {
      attributes: { type: "Unit", url: "/services/data/v35.0/sobjects/Unit/a0b0P00001Bx7i0QAB" },
      Listing: "a0W4U00000KnHO6UAN",
      Id: "a0b0P00001Bx7i0QAB",
      Unit_Type: "Studio",
      BMR_Rent_Monthly: 1199,
      BMR_Rental_Minimum_Monthly_Income_Needed: 2398,
      Status: "Available",
      Property_Type: "Apartment",
      isReservedCommunity: false,
      AMI_chart_type: "MOHCD Adjusted HUD Unadjusted",
      AMI_chart_year: 2021,
      Max_AMI_for_Qualifying_Unit: 55,
    },
  ],
  RecordType: {
    attributes: {
      type: "RecordType",
      url: "/services/data/v35.0/sobjects/RecordType/0120P000000kPUSQA2",
    },
    Id: "0120P000000kPUSQA2",
    Name: "Rental",
  },
  Listing_Images: [
    {
      displayImageURL: "http://sfmohcd.org/sites/default/files/855%20Brannan.png",
      Image_Description: "This is a listing image",
    },
    {
      displayImageURL: "http://sfmohcd.org/sites/default/files/855%20Brannan.png",
      Image_Description: "This is a second listing image",
    },
    {
      displayImageURL: "http://sfmohcd.org/sites/default/files/855%20Brannan.png",
      Image_Description: "This is a third listing image",
    },
  ],
  imageURL: "http://sfmohcd.org/sites/default/files/855%20Brannan.png",
}
