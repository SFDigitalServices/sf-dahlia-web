Feature: Short Form Application - Veterans Preference
    As a web user
    I should be able to claim the Veterans preference on my application
    In order to increase my chances of getting a housing unit

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
        And I opt out of "Assisted Housing" preference
        And I opt out of "Live/Work" preference
        And I opt out of "Alice Griffith" preference
        And I don't choose COP-DTHP preferences
        And I answer "Yes" to the Veterans preference question and select "Jen Doe"
        And I fill out the optional survey
        # Submit app and see preference claimed
        And I confirm details on the review page
        And I agree to the terms and submit
        And I click to view submitted application
        Then on the View Submitted App Page I should see Veterans preference claimed for "Jen Doe"
