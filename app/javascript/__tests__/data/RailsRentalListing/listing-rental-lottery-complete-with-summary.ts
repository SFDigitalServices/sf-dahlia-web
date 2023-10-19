import type RailsRentalListing from "../../../api/types/rails/listings/RailsRentalListing"

/**
 * ListingDetails response for rental listing with status of Lottery Complete and
 * Lottery Summary
 */
export const lotteryCompleteRentalListingWithSummary: RailsRentalListing = {
  unitSummaries: {
    reserved: null,
    general: [
      {
        unitType: "Studio",
        totalUnits: 1,
        minSquareFt: 459,
        minRentalMinIncome: 0,
        minPriceWithParking: null,
        minPriceWithoutParking: 333245,
        minPercentIncome: null,
        minOccupancy: 1,
        minMonthlyRent: null,
        minHoaDuesWithParking: null,
        minHoaDuesWithoutParking: 473.19,
        maxSquareFt: 459,
        maxRentalMinIncome: 0,
        maxPriceWithParking: null,
        maxPriceWithoutParking: 333245,
        maxPercentIncome: null,
        maxOccupancy: null,
        maxMonthlyRent: null,
        maxHoaDuesWithParking: null,
        maxHoaDuesWithoutParking: 473.19,
        listingID: "a0W4U00000KnFqKUAV",
        availability: 1,
        absoluteMinIncome: null,
        absoluteMaxIncome: null,
      },
    ],
  },
  reservedDescriptor: null,
  prioritiesDescriptor: null,
  listingID: "a0W4U00000KnFqKUAV",
  chartTypes: [
    {
      year: "2021",
      percent: 100,
      numOfHousehold: null,
      chartType: "MOHCD Adjusted HUD Unadjusted",
      amount: null,
    },
  ],
  attributes: {
    type: "Listing",
    url: "/services/data/v35.0/sobjects/Listing/a0W4U00000KnFqKUAV",
  },
  Name: "55 Page Street Unit 211",
  Multiple_Listing_Service_URL:
    "https://sfarnet.rapmls.com/Reports/ReportViewer.aspx?hidMLS=SFAR&emailReportRid=101104591&hidEntryPoint=ME",
  Realtor_Commission_Amount: 7934,
  Realtor_Commission_Unit: "dollars",
  Allows_Realtor_Commission: true,
  CC_and_R_URL:
    "https://sfmohcd.org/sites/default/files/Documents/MOH/Housing%20Listing%20Photos/55%20Page%20CCRs.PDF",
  Repricing_Mechanism:
    '<p>When you sell a BMR unit, it will be resold at a restricted price that is affordable to the next qualified household. The household you sell to must meet the first‐time homebuyer, income and other qualifications for the program. Please review the <a href="https://sfmohcd.org/sites/default/files/Documents/MOH/Inclusionary%20Manuals/Inclusionary%20Affordable%20Housing%20Program%20Manual%2010.15.2018.pdf" target="_blank">2018 Inclusionary Affordable Housing Program Monitoring and Procedures Manual</a> for specific information. </p>',
  Appliances: "Refrigerator, dishwasher, microwave and oven/stove.",
  Parking_Information: "No Parking Space",
  Tenure: "Resale",
  First_Come_First_Served: false,
  Building: {
    attributes: {
      type: "Building",
      url: "/services/data/v35.0/sobjects/Building/a0a0P00000GyxijQAB",
    },
    Id: "a0a0P00000GyxijQAB",
  },
  In_Lottery: 3,
  Program_Type: "IH-OWN",
  Units_Available: 1,
  SASE_Required_for_Lottery_Ticket: false,
  nGeneral_Application_Total: 2,
  Listing_Other_Notes:
    '<p>Applications are being accepted on a first come, first served basis starting 1/26/2022 at 8:00 AM PST. Submit an electronic application via this ShareFile <a href="https://sfgov.sharefile.com/r-r636263e8dd764ac9ac8aa3f12caba038" target="_blank">secure link</a>.</p><p><br></p><p><br></p><p>Instructions: Compile the application form and all required documents into one PDF file, and name the PDF file “55 Page St Unit 211 – Last Name, First Name” (Example, 123 Sample Street Unit A – Smith, John). If you do not have internet access or are unable to submit electronically, please contact a housing counselor for assistance.</p>',
  Office_Hours:
    "Monday to Friday, 10:00 am to 5:00 pm <br/>Please call, email, or text to schedule an appointment.",
  Lottery_Status: "Lottery Complete",
  Building_Name: "The Hayes",
  Project_ID: "2011-025",
  Building_Street_Address: "55 Page St",
  Building_City: "San Francisco",
  Building_State: "CA",
  Building_Zip_Code: "94102",
  Neighborhood: "Hayes Valley",
  Year_Built: 2008,
  LastModifiedDate: "2022-01-20T00:41:34.000+0000",
  Marketing_URL: "55-Page-Street--Nov21",
  Application_Due_Date: "2021-12-14T01:00:00.000+0000",
  Building_URL:
    "https://sfmohcd.org/sites/default/files/Documents/MOH/Housing%20Listing%20Photos/55%20Page%20Ext%20FCFS.jpg",
  Legal_Disclaimers:
    '<p>All potential buyers must review the <a href="https://sfmohcd.org/sites/default/files/Documents/MOH/Inclusionary%20Manuals/Inclusionary%20Affordable%20Housing%20Program%20Manual%2010.15.2018.pdf" target="_blank">2018 Inclusionary Affordable Housing Program Monitoring and Procedures Manual</a> that governs this property. Buyers will sign an acknowledgement that they have read and understood this document when purchasing a BMR unit.</p>',
  Application_Organization: "BMR 55 Page #211",
  Application_Street_Address: "PO Box 420847",
  Application_City: "San Francisco",
  Application_State: "CA",
  Application_Postal_Code: "94142",
  Application_Phone: "(415) 846-4124",
  Lottery_Summary:
    "<p>**Applications are being accepted on a first come, first served basis starting 01/26/2022 at 8:00 AM PST**</p>",
  Lottery_Results_Date: "2021-12-22",
  Lottery_Venue:
    '<p><span style="font-size: 14px;">Virtual Lottery today. </span><a href="https://teams.microsoft.com/l/meetup-join/19%3ameeting_NGI4NWM2MWUtMDc4OC00ODUxLWExYzQtMmYzNjU3NjY1ZGEz%40thread.v2/0?context=%7b%22Tid%22%3a%2222d5c2cf-ce3e-443d-9a7f-dfcc0231f73f%22%2c%22Oid%22%3a%22995d825f-a039-42a9-994a-6ee2e71d314b%22%2c%22IsBroadcastMeeting%22%3atrue%7d&amp;btype=a&amp;role=a" target="_blank" style="font-size: 14px; background-color: rgb(255, 255, 255);">Watch it live</a><span style="font-size: 14px;">.</span></p>',
  Lottery_Date: "2021-12-20T19:00:00.000+0000",
  Publish_Lottery_Results: true,
  Publish_Lottery_Results_On_Dahlia: "Publish results in lottery modal on DAHLIA",
  LotteryResultsURL:
    "https://sfmohcd.org/sites/default/files/Documents/MOH/Lottery%20Results/55%20Page%20Street%20Unit%20211%20Lottery%20Results.pdf",
  Accepting_Online_Applications: true,
  Lottery_Winners: 0,
  Leasing_Agent_Name: "Wesley Kline",
  Leasing_Agent_Email: "trista@hquestrealty.com",
  Leasing_Agent_Phone: "(415) 846-4124",
  Leasing_Agent_Street: "5517 Geary Blvd., Suite 206",
  Leasing_Agent_City: "San Francisco",
  Leasing_Agent_State: "California",
  Leasing_Agent_Zip: "94121",
  Accepting_applications_at_leasing_agent: false,
  Accepting_applications_by_PO_Box: false,
  Blank_paper_application_can_be_picked_up: false,
  Deposit_Min: 0,
  Amenities: "Doorperson, gym and rooftop/BBQ",
  Smoking_Policy: "Non-smoking building. Please see the CC&R for the complete smoking policy.",
  Pet_Policy: "Number, size and breed restrictions. Please see CC&R for the complete pet policy.",
  Reserved_community_maximum_age: 0,
  Reserved_community_minimum_age: 0,
  hasWaitlist: false,
  Total_waitlist_openings: 0,
  Total_number_of_building_units: 1,
  Services_Onsite: "Building insurance, common utilities/maintenance and reserves.",
  RecordTypeId: "0120P000000kPURQA2",
  Id: "a0W4U00000KnFqKUAV",
  Listing_Lottery_Preferences: [
    {
      attributes: {
        type: "Listing_Lottery_Preference",
        url: "/services/data/v35.0/sobjects/Listing_Lottery_Preference/a0l4U00001c7sBEQAY",
      },
      Listing: "a0W4U00000KnFqKUAV",
      Id: "a0l4U00001c7sBEQAY",
      Total_Submitted_Apps: 0,
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
        url: "/services/data/v35.0/sobjects/Listing_Lottery_Preference/a0l4U00001c7sBJQAY",
      },
      Listing: "a0W4U00000KnFqKUAV",
      Id: "a0l4U00001c7sBJQAY",
      Total_Submitted_Apps: 0,
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
        url: "/services/data/v35.0/sobjects/Listing_Lottery_Preference/a0l4U00001c7sBOQAY",
      },
      Listing: "a0W4U00000KnFqKUAV",
      Id: "a0l4U00001c7sBOQAY",
      Total_Submitted_Apps: 1,
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
        url: "/services/data/v35.0/sobjects/Open_Houses/a0Y4U00000JuRCeUAN",
      },
      Listing: "a0W4U00000KnFqKUAV",
      Id: "a0Y4U00000JuRCeUAN",
      Venue:
        '<p>**FIRST COME, FIRST SERVED LISTING**</p><p><br></p><p>To view the listing &amp; instructions on how to submit an application, please click on this <a href="https://sfmohcd.org/bmr-resale-55-page-street-unit-211" target="_blank">link</a>.</p><p><br></p><p><br></p><p>Individual viewings may be available by appointment only. Please contact the listing agent, Trista Bernasconi, for assistance.</p>',
    },
    {
      attributes: {
        type: "Open_Houses",
        url: "/services/data/v35.0/sobjects/Open_Houses/a0Y4U00000JuRCjUAN",
      },
      Listing: "a0W4U00000KnFqKUAV",
      Id: "a0Y4U00000JuRCjUAN",
      Venue:
        '<p><br></p><p>To view the virtual tour, please click on this <a href="https://my.matterport.com/show/?m=bfGPnSQLVhk&amp;mls=1" target="_blank">link</a>.</p>',
    },
  ],
  Units: [
    {
      attributes: {
        type: "Unit",
        url: "/services/data/v35.0/sobjects/Unit/a0b0P00001HoPRkQAN",
      },
      Listing: "a0W4U00000KnFqKUAV",
      Id: "a0b0P00001HoPRkQAN",
      Price_Without_Parking: 333245,
      HOA_Dues_Without_Parking: 473.19,
      Unit_Type: "Studio",
      BMR_Rental_Minimum_Monthly_Income_Needed: 0,
      Status: "Available",
      Property_Type: "Condo",
      isReservedCommunity: false,
      AMI_chart_type: "MOHCD Adjusted HUD Unadjusted",
      AMI_chart_year: 2021,
      Max_AMI_for_Qualifying_Unit: 100,
    },
  ],
  RecordType: {
    attributes: {
      type: "RecordType",
      url: "/services/data/v35.0/sobjects/RecordType/0120P000000kPURQA2",
    },
    Id: "0120P000000kPURQA2",
    Name: "Ownership",
  },
  Listing_Images: [
    {
      displayImageURL:
        "https://sfmohcd.org/sites/default/files/Documents/MOH/Housing%20Listing%20Photos/55%20Page%20Ext%20FCFS.jpg",
      Image_Description: "This is a listing image",
    },
    {
      displayImageURL:
        "https://sfmohcd.org/sites/default/files/Documents/MOH/Housing%20Listing%20Photos/55%20Page%20Ext%20FCFS.jpg",
      Image_Description: "This is a second listing image",
    },
    {
      displayImageURL:
        "https://sfmohcd.org/sites/default/files/Documents/MOH/Housing%20Listing%20Photos/55%20Page%20Ext%20FCFS.jpg",
      Image_Description: "This is a third listing image",
    },
  ],
}
