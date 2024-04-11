Feature: Short Form Application
    As a web user
    I should see error messages when filling out the short form application
    In order to help correct mistakes with my application

    Scenario: Seeing errors while filling out the form with missing or bad data
        # error: not filling out the first page
        Given I go to the first page of the "Test Listing" application
        When I don't fill out the Name page
        Then I should see name field errors on the Name page

        # error: invalid DOB
        When I fill out the Name page with an invalid DOB
        Then I should see DOB field errors on the Name page
        # error: invalid email
        And I fill out the Name page with the email "grant@exygy"
        Then I should see an email error on the Name page
        # error: using non-latin characters
        When I fill out the Name page with non-latin characters
        Then I should see an error about providing answers in English on the Name page

        # maxlength check: name should cut off
        When I fill out the Name page as "Loremipsumloremipsumloremipsumloremipsumxyzxyz Loremipsumloremipsumloremipsumloremipsumxyzxyz Loremipsumloremipsumloremipsumloremipsumxyzxyz"
        And I navigate to the "You" section
        Then I should see the truncated name "E2ETEST-Loremipsumloremipsumloremipsumloremipsum Loremipsumloremipsum Loremipsumloremipsumloremipsumloremipsum" on the Name page

        When I navigate to the "You" section
        And I fill out the Name page as "Jane Doe"
        # error: PO Box not allowed
        And I fill out the Contact page with an address that's a PO Box
        Then I should see a PO Boxes not allowed error

        #error: invalid address (address not found by easy post)
        When I fill out the Contact page with a fake address
        Then I should see an address not found error

        When I fill out the Contact page with an address, non-NRHP match, and WorkInSF
        And I confirm my address
        # error: invalid email in alternate contact
        And I select an alternate contact of type Other
        And I fill out the AlternateContact Name page as "Jane Doe"
        And I fill out the AlternateContact Contact page with the email "grant@exygy"
        Then I should see an email error on the AlternateContact page

        When I fill out the AlternateContact Contact page with the email "grant@exygy.com"
        And I indicate living with other people
        # error: missing details for member
        And I open the household member form
        And I fill out the household member form with missing data
        Then I should see an error on the household member form

        When I cancel the household member
        # error: household too big (Automated Test Listing allows for 1-3 people, 4 is too big)
        And I add another household member named "Jonny Doe" with same address as primary
        And I add another household member named "Karen Lee" with same address as primary
        And I add another household member named "Alex McGee" with same address as primary
        And I indicate being done adding people
        Then I should see an error about household size being too big

        When I edit the last household member
        And I cancel the household member
        # now should be valid with 3 people
        And I indicate being done adding people
        And I indicate living in public housing
        And I indicate no ADA priority
        And I do not indicate having vouchers

        # error: income too low
        And I fill out my income as "25000"
        Then I should see an error about household income being too low

        # error: income too high
        When I fill out my income as "195000"
        Then I should see an error about household income being too high

        # no error - income should pass
        When I fill out my income as "75000"

        # error: L/W preference option not chosen (optOut / preference both blank)
        And I continue past the Lottery Preferences intro
        And I opt out of "Assisted Housing" preference
        And I click the Next button on the Live-Work Preference page
        Then I should see an error about selecting an option

        # error: preference document not uploaded
        When I select "Jane Doe" for "Live in San Francisco" in Live-Work preference
        And I click the Next button on the Live-Work Preference page
        Then I should see an error about uploading proof

        # error: uploaded preference document too large
        When I upload a too-large "Gas bill" as my proof of preference for "liveInSf"
        Then I should see an error about the file being too large
        And I opt out of "Live/Work" preference

        # error: address not entered for Alice Griffith
        When I select "Jane Doe" for "aliceGriffith" preference
        And I hit the Next button "1" time
        Then I should see a blank address error

        # error: address not found for Alice Griffith
        And I upload a "Letter from SFHA verifying address" as my proof of preference for "aliceGriffith"
        And I fill out an address for Alice Griffith that's a PO Box
        When I hit the Next button "1" time
        Then I should see a PO Boxes not allowed error

    Scenario: Seeing errors while filling out a senior listing with a birthday that makes you too young.
        Given I go to the first page of the "Senior Test Listing" application
        When I answer "Yes" to the community screening question
        And I hit the Next button "1" time
        # Jane Doe has a DOB with 1990
        And I fill out the Name page as "Alice Youngblood" with birth date "1/1/2000"
        And I hit the Next button "1" time
        Then I should see a form notice that says "Everyone in your household must be a Senior"
        # Now move on to test adding a too-young household member
        Then I fill out the Name page as "Alice Oldblood" with birth date "1/1/1950"
        And I hit the Next button "1" time
        Then I should be on the "Contact" page of the application
        Then I fill out the Contact page with an address, non-NRHP match, and WorkInSF
        And I confirm my address
        And I don't indicate an alternate contact
        # Household member who is too young should raise an error
        And I indicate living with other people
        And I add another household member named "Younger sibling" with same address as primary and with birth date "1/1/2000"
        And I hit the Next button "1" time
        Then I should see a form notice that says "Everyone in your household must be a Senior"
        # Household member that is old enough should not have an error
        When I cancel the household member
        And I add another household member named "Older sibling" with same address as primary and with birth date "1/1/1945"
        And I indicate being done adding people
        Then I should be on the "Priorities" page
