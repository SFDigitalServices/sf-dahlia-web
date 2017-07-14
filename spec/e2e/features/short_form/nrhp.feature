Feature: Short Form Application - Neighborhood Resident Housing Preference
    As a web user
    I should be able to claim "Live in the Neighborhood" while filling out a short form application
    In order to increase my chances of getting an affordable housing unit

    Scenario: Using an address outside the NRHP area, I should not see the preference option
      Given I go to the first page of the Test Listing application
      When I fill out the Name page as "Jane Doe"
      And I fill out the Contact page with an address (non-NRHP match) and WorkInSF
      And I confirm my address
      And I don't indicate an alternate contact
      And I indicate I will live alone
      And I continue past the Lottery Preferences intro
      # the first preference I see should be Live/Work
      Then I should be on the "Live or Work in San Francisco Preference" preference page

    Scenario: Using an address inside the NRHP area, I should see the preference option
      Given I go to the first page of the Test Listing application
      When I fill out the Name page as "Jane Doe"
      And I fill out the Contact page with an address (NRHP match) and WorkInSF
      And I confirm my address
      And I don't indicate an alternate contact
      And I indicate I will live alone
      And I continue past the Lottery Preferences intro
      # the first preference I see should be NRHP
      Then I should be on the "Live in the Neighborhood" preference page
