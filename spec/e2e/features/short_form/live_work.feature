Feature: Short Form Application - Live/Work Preference
    As a web user
    I should be able to claim the Live/Work preference while filling out a short form application
    In order to increase my chances of getting an affordable housing unit

    Scenario: Applicant and/or household member living or working in SF, different combinations
      Given I go to the first page of the Test Listing application
      When I fill out the Name page as "Jane Doe"
      And I fill out the Contact page with a non-SF address, no WorkInSF
      And I confirm my address
      And I don't indicate an alternate contact
      And I indicate I will live alone
      And I continue past the Lottery Preferences intro
      Then I should see the Preferences Programs screen

    Scenario: Opting in to live/work then saying no to workInSf then uploading proof
      Given I go to the first page of the Test Listing application
      When I fill out the Name page as "Jane Doe"
      And I fill out the Contact page with an address (non-NRHP match) and WorkInSF
      And I confirm my address
      And I don't indicate an alternate contact
      And I indicate I will live alone
      And I continue past the Lottery Preferences intro
      And I select "Jane Doe" for "Live in San Francisco" in Live/Work preference
      And I go back to the Contact page and change WorkInSF to No
      And I go back to the Live/Work preference page
      Then I should still see the single Live in San Francisco preference selected
      When I upload a "Gas bill" as my proof of preference for "liveInSf"
      Then I should see the successful file upload info
      When I click the Next button on the Live/Work Preference page
      Then I should see the Preferences Programs screen

    Scenario: Selecting live/work member, going back and forth from previous page, changing name
      Given I go to the first page of the Test Listing application
      When I fill out the Name page as "Jane Doe"
      And I fill out the Contact page with an address (NRHP match) and WorkInSF
      And I confirm my address
      And I don't indicate an alternate contact
      And I indicate I will live alone
      And I continue past the Lottery Preferences intro
      And I opt out of NRHP preference
      And I select "Jane Doe" for "Live in San Francisco" in Live/Work preference
      And I use the browser back button
      And I go back to the Live/Work preference page
      Then I should still see the preference options and uploader input visible
      # Finish the application and make sure a name change doesn't unclaim the preference
      When I upload a "Gas bill" as my proof of preference for "liveInSf"
      And I don't choose COP/DTHP preferences
      And I click the Next button on the Live/Work Preference page
      And I indicate having vouchers
      And I fill out my income as "25000"
      And I fill out the optional survey
      And I navigate to the "You" section
      And I fill out the Name page as "Harper Lee"
      And I navigate to the "Review" section
      And I fill out the optional survey
      Then I should see "Live in San Francisco" preference claimed for "Harper Lee"
