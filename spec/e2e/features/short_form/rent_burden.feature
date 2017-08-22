Feature: Short Form Application - Rent Burdened Preference
    As a web user
    I should be able to claim the Rent Burdened / Assisted Housing preference on my application
    In order to increase my chances of getting an affordable housing unit

    Scenario: Being eligible for Rent Burden preference with a single address
      Given I go to the first page of the Test Listing application
      When I fill out the Name page as "Jane Doe"
      And I fill out the Contact page with an address (non-NRHP match) and WorkInSF
      And I confirm my address
      And I don't indicate an alternate contact
      And I indicate living with other people
      And I add another household member named "Jonny Doe" with same address as primary
      And I indicate being done adding people
      And I indicate not living in public housing
      # in this case, there is only one applicant + one rent input
      And I enter "2000" for each of my monthly rents
      And I indicate no ADA priority
      And I indicate having vouchers
      And I fill out my income as "35000"
      And I continue past the Lottery Preferences intro
      And I opt out of Live/Work preference
      And I select Rent Burdened Preference
      Then I should see proof uploaders for rent burden files
      # as opposed to seeing rent burden dashboard, which could be its own test...
