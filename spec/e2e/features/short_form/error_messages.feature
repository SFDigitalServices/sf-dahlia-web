Feature: Short Form Application
    As a web user
    I should see error messages when filling out the short form application
    In order to help correct mistakes with my application

    Scenario: Seeing errors while filling out the form with missing or bad data
      Given I go to the first page of the Test Listing application
      When I don't fill out the Name page
      # error: not filling out the first page
      Then I should see name field errors on the Name page
      When I fill out the Name page with an invalid DOB
      # error: invalid DOB
      Then I should see DOB field errors on the Name page
      When I fill out the Name page as "Jane Doe"
      And I fill out the Contact page with an address that isn't found
      # error: address not found
      Then I should see an address error on the Contact page
      When I fill out the Contact page with an address (non-NRHP match) and WorkInSF
      And I confirm my address
      And I don't indicate an alternate contact
      And I indicate I will live alone
      And I continue past the Lottery Preferences intro
      And I don't select opt out or Live/Work preference
      # error: preference option not chosen
      Then I should see an error about selecting an option
