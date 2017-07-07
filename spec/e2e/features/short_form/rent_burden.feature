Feature: Short Form Application - Live/Work Preference
    As a web user
    I should be able to claim the Rent Burdened / Assisted Housing preference on my application
    In order to increase my chances of getting an affordable housing unit

    Scenario: Being eligible for Rent Burden preference with a single address
      Given I go to the first page of the Test Listing application
      When I fill out the Name page as "Jane Doe"
      And I fill out the Contact page with an address (non-NRHP match) and WorkInSF
      And I confirm my address
      And I don't indicate an alternate contact
      And I indicate other people will live with me
      And I add another household member named "Jonny Doe"
      And I indicate being done adding other people
      And I indicate not living in public housing
      And I enter "1200" for my monthly rent
      And I indicate no priority
      And I indicate having vouchers
      And I fill out my income
      And I continue past the Lottery Preferences intro
      And I opt out of Live/Work preference
      And I select Rent Burden Preference
      Then I should see proof uploaders for rent burden files
      # as opposed to seeing rent burden dashboard, which could be its own test...
