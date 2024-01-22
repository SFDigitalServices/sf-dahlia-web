Feature: Autofill application
    As a web user with an account
    I should be able to autofill my application based on past applications

    Scenario: Setting up an account for sign in while applying tests
        Given I have a confirmed account for "Arnold Autofill" with birth date "1/1/1950"
        When I wait "5" seconds

    Scenario: I create the base application to then be able to use for autofill
        Given I go to the first page of the "Senior Test Listing" application
        When I answer "Yes" to the community screening question
        And I hit the Next button "1" time
        When I fill out the Name page as "Arnold Autofill"
        Then the application page title should be "Welcome back!"
        When I sign in as "Arnold Autofill" with my email pre-filled
        Then I should be signed in
        And I should be on the "Name" page of the application
        And I hit the Next button "1" time
        And I fill out the Contact page with an address, non-NRHP match, and WorkInSF
        And I confirm my address
        And I don't indicate an alternate contact
        And I indicate I will live alone
        And I indicate no ADA priority
        And I indicate having vouchers
        And I fill out my income as "25000"
        And I continue past the Lottery Preferences intro
        And I opt out of "Live/Work" preference
        And I don't choose COP-DTHP preferences
        And I answer "No" to the Veterans preference question
        And I continue past the general lottery notice page
        And I fill out the optional survey
        And I confirm details on the review page
        And I agree to the terms and submit
        Then I should see my lottery number on the confirmation page

    # TODO: This is just a first pass of an autofill E2E test. Additional things we should verify:
    # - Check if Houshold members and alternate contacts are autofilled
    # - Check that income is filled out as expected
    # - Enhance testing and checking around preferences
    Scenario: I then apply to another listing, with autofill
        Given I go to the first page of the "Test Listing" application
        Then the application page title should be "Save time by using the details from your last application."
        And I click the Start with these details button
        And I should be on the "Name" page of the application
        # I don't have to type in my contact info
        And I hit the Next button "2" times
        And I confirm my address
        And I don't indicate an alternate contact
        And I indicate I will live alone
        And I indicate living in public housing
        # I should see that ADA is already filled out as No.
        And I hit the Next button "1" time
        # I shouldn't have to indicate having a voucher
        And I hit the Next button "2" times
        And I continue past the Lottery Preferences intro
        And I opt out of "Assisted Housing" preference
        And I hit the Next button "2" times
        And I opt out of "Alice Griffith" preference
        And I opt out of "Live/Work" preference
        And I don't choose COP-DTHP preferences
        And I answer "No" to the Veterans preference question
        And I continue past the general lottery notice page
        And I wait "2" seconds
        Then I should land on the optional survey page
        And on the optional survey page I should see my correct info
        And I confirm details on the review page
        And I agree to the terms and submit
        Then I should see my lottery number on the confirmation page
        And I sign out without saving
