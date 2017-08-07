Feature: Short Form Application
    As a web user
    I should see error messages when filling out the short form application
    In order to help correct mistakes with my application

    Scenario: Seeing errors while filling out the form with missing or bad data
      # error: not filling out the first page
      Given I go to the first page of the Test Listing application
      When I don't fill out the Name page
      Then I should see name field errors on the Name page

      # error: invalid DOB
      When I fill out the Name page with an invalid DOB
      Then I should see DOB field errors on the Name page

      # error: address not found
      When I fill out the Name page as "Jane Doe"
      And I fill out the Contact page with an address that isn't found
      Then I should see an address error on the Contact page

      When I fill out the Contact page with an address (non-NRHP match) and WorkInSF
      And I confirm my address
      And I don't indicate an alternate contact
      And I indicate living with other people
      # error: missing details for member
      And I open the household member form
      And I fill out the household member form with missing data
      Then I should see an error on the household member form

      When I cancel the household member
      # error: household too big
      And I add another household member named "Jonny Doe" with same address as primary
      And I add another household member named "Karen Lee" with same address as primary
      And I add another household member named "Alex McGee" with same address as primary
      And I add another household member named "Bigtoe Willshire" with same address as primary
      And I add another household member named "Youngster Fie" with same address as primary
      And I add another household member named "Bill Nicepants" with same address as primary
      And I add another household member named "Nachos Jones" with same address as primary
      And I indicate being done adding people
      Then I should see an error about household size being too big

      When I edit the last household member
      And I cancel the household member
      # now should be valid with fewer people
      And I indicate being done adding people
      And I indicate living in public housing
      And I indicate not veteran
      And I indicate no developmental disability
      And I indicate no priority
      And I do not indicate having vouchers

      # error: income too low
      And I fill out my income as "25000"
      Then I should see an error about household income being too low

      # error: income too high
      When I fill out my income as "195000"
      Then I should see an error about household income being too high

      # no error - income should pass
      When I fill out my income as "33000"

      # error: L/W preference option not chosen (optOut / preference both blank)
      And I continue past the Lottery Preferences intro
      And I click the Next button on the Live/Work Preference page
      Then I should see an error about selecting an option

      # error: preference document not uploaded
      When I select "Jane Doe" for "Live in San Francisco" in Live/Work preference
      And I click the Next button on the Live/Work Preference page
      Then I should see an error about uploading proof
