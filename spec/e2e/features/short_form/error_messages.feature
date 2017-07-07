Feature: Short Form Application
    As a web user
    I should see error messages when filling out the short form application
    In order to help correct mistakes with my application

    Scenario: Seeing errors while filling out the form with missing or bad data
      Given I go to the first page of the Test Listing application
      # error: not filling out the first page
      When I don't fill out the Name page
      Then I should see name field errors on the Name page
      # error: using non-latin characters
      When I fill out the Name page with non-latin characters
      Then I should see an error about providing answers in English on the Name page
      # error: invalid DOB
      When I fill out the Name page with an invalid DOB
      Then I should see DOB field errors on the Name page
      # error: address not found
      When I fill out the Name page as "Jane Doe"
      And I fill out the Contact page with an address that isn't found
      Then I should see an address error on the Contact page
      # --
      When I fill out the Contact page with an address (non-NRHP match) and WorkInSF
      And I confirm my address
      And I don't indicate an alternate contact
      And I indicate I will live alone
      And I indicate living in public housing
      And I indicate no priority
      And I indicate having vouchers
      And I fill out my income
      And I continue past the Lottery Preferences intro
      # error: preference option not chosen
      And I don't select opt out or Live/Work preference
      Then I should see an error about selecting an option
