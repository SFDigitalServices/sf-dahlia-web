Feature: Short Form Application - Assisted Housing Preference
    As a web user
    I should be able to claim the Rent Burdened / Assisted Housing preference on my application
    In order to increase my chances of getting an affordable housing unit

    Scenario: Claiming Assisted Housing preference
        Given I go to the first page of the "Test Listing" application
        When I fill out the Name page as "Jen Doe"
        And I fill out the Contact page with an address, non-NRHP match, no WorkInSF
        And I confirm my address
        And I don't indicate an alternate contact
        And I indicate living with other people
        And I add another household member named "Jonny Doe" with same address as primary
        And I indicate being done adding people
        And I indicate living in public housing
        And I indicate no ADA priority
        And I indicate having vouchers
        And I fill out my income as "35000"
        And I continue past the Lottery Preferences intro
        # See page when selecting public housing
        Then I should see the "Assisted Housing" preference checkbox
        And I select Assisted Housing Preference
        And I hit the Next button "1" time
        Then I should see an error about uploading proof
        # Successfully opt-in and upload lease proof
        And I select "Jen Doe" for "assistedHousing" preference
        And I upload a Copy of Lease as my proof for Assisted Housing
        And I hit the Next button "1" times
        And I opt out of "Live/Work" preference
        And I opt out of "Alice Griffith" preference
        And I don't choose COP-DTHP preferences
        And I answer "No" to the Veterans preference question
        And I hit the Next button "1" times
        # Submit app and see preference claimed
        And I confirm details on the review page
        And I agree to the terms and submit
        And I click to view submitted application
        Then on the View Submitted App Page I should see Assisted Housing preference claimed
