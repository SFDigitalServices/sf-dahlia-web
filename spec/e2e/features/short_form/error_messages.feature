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
      And I indicate living with other people
      And I open the household member form
      And I fill out the household member form with missing data
      # error: missing details for member
      Then I should see an error on the household member form

      When I cancel the household member
      And I add household member "1"
      And I add household member "2"
      And I add household member "3"
      And I indicate being done adding people
      # error: household too big
      Then I should see an error about household size being too big

      When I edit the last household member
      And I cancel the household member
      And I indicate being done adding people
      And I continue past the Lottery Preferences intro
      And I click the Next button on the Live/Work Preference page
      # error: preference option not chosen
      Then I should see an error about selecting an option

      When I select "Jane Doe" for "Live in San Francisco" in Live/Work preference
      And I click the Next button on the Live/Work Preference page
      # error: preference document not uploaded
      Then I should see an error about uploading proof

      When I opt out of Live/Work preference
      And I select "Jane Doe" for COP preference
      And I go to the income page
      And I do not indicate having vouchers
      And I fill out my income as "25000"
      # error: income too low
      Then I should see an error about household income being too low

      When I fill out my income as "195000"
      # error: income too high
      Then I should see an error about household income being too high

      When I fill out my income as "75000"
      # no error - income should pass
      Then I should land on the optional survey page
