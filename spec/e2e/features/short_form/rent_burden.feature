Feature: Short Form Application - Rent Burdened Preference
    As a web user
    I should be able to claim the Rent Burdened / Assisted Housing preference on my application
    In order to increase my chances of getting an affordable housing unit

    Scenario: Being eligible for Rent Burdened preference with a single address
        Given I go to the first page of the "Test Listing" application
        When I fill out the Name page as "Jane Doe"
        And I fill out the Contact page with an address, non-NRHP match, and WorkInSF
        And I confirm my address
        And I don't indicate an alternate contact
        And I indicate living with other people
        And I add another household member named "Jonny Doe" with same address as primary
        And I indicate being done adding people
        And I indicate not living in public housing
        # in this case, there is only one applicant + one rent input
        And I enter "2000" for each of my monthly rents
        And I indicate no ADA priority
        And I indicate having vouchers
        And I fill out my income as "35000"
        And I continue past the Lottery Preferences intro
        Then I should see the "Rent Burdened" preference checkbox
        When I select Rent Burdened Preference
        Then I should see proof uploaders for rent burden files
        # - error: no file(s) uploaded
        When I hit the Next button "1" times
        Then I should see an error about uploading proof
        # - successful upload
        When --I reach the "Upload files for single applicant" step--
        And I upload a Copy of Lease and "Money order" as my proof for Rent Burden
        And I upload an additional "Cancelled check" as my proof for Rent Burden
        And I hit the Next button "1" time
        Then I should see the "Live or Work in San Francisco" preference checkbox

        # change address, clear out preference
        When --I reach the "Change primary applicant address" step--
        And I go back to the Contact page
        And I fill out the Contact page with an address, NRHP match, and WorkInSF
        And I confirm my address
        And I don't indicate an alternate contact
        And I indicate being done adding people
        And I indicate not living in public housing
        And I enter "2000" for each of my monthly rents
        And I indicate no ADA priority
        And I indicate having vouchers
        And I fill out my income as "35000"
        And I continue past the Lottery Preferences intro
        Then I should see the "rentBurden" checkbox un-checked

        # change HH member address, clear out preference
        When --I reach the "Change household member address" step--
        # select the checkbox so we can see it get un-checked
        And I select Rent Burdened Preference
        And I go back to the Household page
        And I edit the last household member
        And I change their address to "2601 Mission St."
        And I confirm their address
        And I indicate being done adding people
        And I indicate not living in public housing
        And I enter "2000" for each of my monthly rents
        And I indicate no ADA priority
        And I indicate having vouchers
        And I fill out my income as "35000"
        And I continue past the Lottery Preferences intro
        Then I should see the "rentBurden" checkbox un-checked
        When I select Rent Burdened Preference
        And I open the first address in my Rent Burden dashboard
        And I upload a Copy of Lease and "Money order" as my proof for Rent Burden
        And I indicate being done with this address
        Then I should see green checkmarks indicating my uploads for Lease and Rent

        # - error: no file(s) uploaded for 2nd address
        When I hit the Next button "1" times
        Then I should see errors about uploading Rent Burdened proof
        Then I should see a red X indicating missing uploads for Lease and Rent

        # - successful upload
        When --I reach the "Upload files for both addresses" step--
        When I open the last address in my Rent Burden dashboard
        And I upload a Copy of Lease and "Money order" as my proof for Rent Burden
        And I indicate being done with this address
        Then I should see green checkmarks indicating my uploads for Lease and Rent
        And I hit the Next button "1" time
        And I opt out of "NRHP" preference
        And I opt out of "Live/Work" preference
        And I opt out of "Alice Griffith" preference
        And I don't choose COP-DTHP preferences
        And I answer "No" to the Veterans preference question
        And I fill out the optional survey
        Then on the Review Page I should see my Rent Burdened preference details
