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
      And I indicate living in public housing
      And I indicate not veteran
      And I indicate no developmental disability
      And I indicate no priority
      And I indicate having vouchers
      And I fill out my income as "50000"
      And I continue past the Lottery Preferences intro
      # the first preference I see should be Live/Work
      Then I should be on the "Live or Work in San Francisco Preference" preference page

    Scenario: Using an address inside the NRHP area, I should see the preference option
      Given I go to the first page of the Test Listing application
      When I fill out the Name page as "Jane Doe"
      And I fill out the Contact page with an address (NRHP match) and WorkInSF
      And I confirm my address
      And I don't indicate an alternate contact
      And I indicate living with other people
      And I add another household member named "Karen Lee" who lives at "4053 18th St."
      And I confirm their address
      And I add another household member named "Jonny Doe" with same address as primary
      And I indicate being done adding people
      And I indicate living in public housing
      And I indicate not veteran
      And I indicate no developmental disability
      And I indicate no priority
      And I indicate having vouchers
      And I fill out my income as "50000"
      And I continue past the Lottery Preferences intro
      # the first preference I see should be NRHP
      Then I should be on the "Live in the Neighborhood" preference page
      When I click the Live in the Neighborhood checkbox
      # members who live within the eligible area should be in the dropdown, others should not
      Then I should see "Jane Doe, Jonny Doe" in the preference dropdown and not "Karen Lee"

      When I select "Jonny Doe" for "antiDisplacement" preference
      And I go back to the Household page
      # last household member == Jonny
      And I edit the last household member
      And I change their address to "4053 18th St."
      And I confirm their address
      And I indicate being done adding people
      And I indicate living in public housing
      And I indicate not veteran
      And I indicate no developmental disability
      And I indicate no priority
      And I indicate having vouchers
      And I fill out my income as "50000"
      And I continue past the Lottery Preferences intro
      # now that Jonny changed his address, ensure that preference is un-checked but Jane is still eligible
      Then I should see the Live in the Neighborhood checkbox un-checked
      When I click the Live in the Neighborhood checkbox
      Then I should see "Jane Doe" in the preference dropdown and not "Jonny Doe, Karen Lee"

      # have to unselect it because the next step clicks it again
      When I click the Live in the Neighborhood checkbox
      When I select "Jane Doe" for "antiDisplacement" preference
      And I upload a "School record" as my proof of preference for "antiDisplacement"
      And I click the Next button on the Live in the Neighborhood page
      And I opt out of Assisted Housing preference
      And I don't choose COP/DTHP preferences
      And I fill out the optional survey
      Then I should see "Anti-Displacement Housing" preference claimed for "Jane Doe"
