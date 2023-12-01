Feature: Short Form Application - Custom Educator Listing 1
    As a web user
    I should be able to apply to Custom Educator Listing 1

    Scenario: Answering "Yes" to the "Do you work at San Francisco Unified School District?" question
        # Screening page
        Given I go to the welcome page of the "Custom Educator 1 Test Listing" application
        And I select "English" as my language
        Then the application page title should be "Do you work at San Francisco Unified School District?"
        When I answer "Yes" to the custom educator screening question
        And I fill out the Job Code field with an invalid Job Classification Number
        And I hit the Next button "2" times
        Then I should see a Job Code field error
        When I fill out the Job Code field with a valid Job Classification Number
        And I hit the Next button "1" times
        # Standard application pages
        And I continue past the welcome overview
        And I fill out the Name page as "Jane Doe"
        And I fill out the Contact page with an address, non-NRHP match, and WorkInSF
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
        # Review page
        Then on the Review Page I should see my status as working for SF Unified School District and my Job Classification Number
        When I confirm details on the review page
        When I agree to the terms and submit
        Then I should see my lottery number on the confirmation page

    Scenario: Answering "No" to the "Do you work at San Francisco Unified School District?" question
        # Screening page
        Given I go to the welcome page of the "Custom Educator 1 Test Listing" application
        And I select "English" as my language
        Then the application page title should be "Do you work at San Francisco Unified School District?"
        When I answer "No" to the custom educator screening question
        When I hit the Next button "1" times
        Then I should see a form notice that says "You must work at SF Unified School District to apply."
        And I should not be able to hit the Next button
