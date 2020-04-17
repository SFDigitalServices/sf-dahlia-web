Feature: Short Form Application
    As a web user
    I should be able to select a non-English language
    In order to read short form application instructions and errors in my native language

    Scenario: Using multilingual to select a non-english language and fill in a application
        Given I go to the welcome page of the "Test Listing" application
        And I select "Spanish" as my language
        And I continue past the welcome overview
        Then I should see "Español" selected in the translate bar language switcher
        Then I go to the first page of the "Test Listing" application
        And I fill out the Name page as "Jane Doe"
        And I fill out the Contact page zch, and WorkInSF
        And I confirm my address
        And I don't indicate an alternate contact
        And I indicate I will live alone
        And I indicate living in public housing
        And I indicate no ADA priority
        And I indicate having vouchers
        And I fill out my income as "25000"
        And I continue past the Lottery Preferences intro
        And I opt out of "Assisted Housing" preference
        And I opt out of "Live/Work" preference
        And I opt out of "Alice Griffith" preference
        And I don't choose COP-DTHP preferences
        And I continue past the general lottery notice page
        And I fill out the optional survey
        And I confirm details on the review page
        And I agree to the terms and submit
        Then I should see my lottery number on the confirmation page
        # now that we've submitted, also create an account
        When I click the Create Account button
        And I create an account for "Jane Doe" with my pre-filled application details
        # And I submit the page and wait
        Then I should be on the login page with the email confirmation popup
        And I select "Filipino" as my language
        Then I go to the first page of the "Senior Test Listing" application
        And I continue past the welcome overview
        Then I should see "Filipino" selected in the translate bar language switcher
