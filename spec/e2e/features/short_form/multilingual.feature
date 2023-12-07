Feature: Short Form Application
    As a web user
    I should be able to select a non-English language
    In order to read short form application instructions and errors in my native language

    Scenario: Using multilingual to select a non-english language and fill in a application
        Given I go to the welcome page of the "Test Listing" application
        And I select "Spanish" as my language
        And I continue past the welcome overview
        Then I should see "Español" selected in the translate bar language switcher
        And I fill out the Name page as "Janifer Doe"
        And I fill out the Contact page in Español
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
        And I answer "No" to the Veterans preference question
        And I continue past the general lottery notice page
        And I fill out the optional survey
        And I confirm details on the review page
        And I agree to the terms and submit
        Then I should see my lottery number on the confirmation page
        When I click the Create Account button
        And I create an account for "Janifer Doe" with my pre-filled application details
        Then I should be on the login page with the email confirmation popup
        And I have confirmed the account for "Janifer Doe"
        And I go to the Sign In page
        And I sign in as "Janifer Doe"
        Given I go to the welcome page of the "Senior Test Listing" application
        And I select "Filipino" as my language
        And I continue past the welcome overview
        When I wait "1" seconds
        When I answer "Yes" to the community screening question
        And I hit the Next button "1" time
        Then I should see "Filipino" selected in the translate bar language switcher
        And I go to the welcome page of the "Senior Test Listing" application
        And I select "English" as my language
        And I sign out
