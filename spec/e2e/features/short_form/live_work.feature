Feature: Short Form Application - Live/Work Preference
    As a web user
    I should be able to claim the Live/Work preference on my application
    In order to increase my chances of getting an affordable housing unit

    Scenario: Applicant and/or household member living or working in SF, different combinations
      # neither live nor work in SF, alone
      Given I go to the first page of the Test Listing application
      When I fill out the Name page as "Jane Doe"
      And I fill out the Contact page with a non-SF address, no WorkInSF
      And I confirm my address
      And I don't indicate an alternate contact
      And I indicate I will live alone
      And I indicate living in public housing
      And I indicate no priority
      And I indicate having vouchers
      And I fill out my income as "50000"
      And I continue past the Lottery Preferences intro
      And I opt out of Assisted Housing preference
      Then I should see the Preferences Programs screen
      # I work but not live in SF, alone
      When I go back to the Contact page
      And I change WorkInSF to "Yes"
      And I go back to the Live/Work preference page
      Then I should see the Work Preference
      # I work and live in SF, alone
      When I go back to the Contact page
      And I fill out the Contact page with an address (non-NRHP match) and WorkInSF
      And I confirm my address
      And I go back to the Live/Work preference page
      Then I should see the Live and Work Preferences
      # Make sure the dropdowns are correct
      When I click the Live or Work in SF checkbox
      And I open the Live or Work in SF dropdown
      And I select the Live in SF preference
      Then I should see "Jane Doe" in the preference dropdown and not "Coleman Francis"
      When I select the Work in SF preference
      Then I should see "Jane Doe" in the preference dropdown and not "Coleman Francis"
      # I live but not work in SF, alone
      When I go back to the Contact page
      And I change WorkInSF to "No"
      And I go back to the Live/Work preference page
      Then I should see the Live Preference
      # I live in SF, household member lives in SF
      When I go back to the Household page
      And I indicate living with other people
      And I add another household member named "Coleman Francis" who lives at "4053 18th St."
      And I confirm their address
      And I indicate being done adding people
      And I indicate living in public housing
      And I hit the Next button "3" times
      And I continue past the Lottery Preferences intro
      Then I should see the Live Preference
      # I neither live nor work in SF, household member lives in SF
      When I go back to the Contact page
      And I fill out the Contact page with a non-SF address, no WorkInSF
      And I confirm my address
      And I go back to the Live/Work preference page
      Then I should see the Live Preference
      # I work in SF, household member lives in SF
      When I go back to the Contact page
      And I change WorkInSF to "Yes"
      And I go back to the Live/Work preference page
      Then I should see the Live and Work Preferences
      # Make sure the dropdowns are correct
      When I click the Live or Work in SF checkbox
      And I open the Live or Work in SF dropdown
      And I select the Live in SF preference
      Then I should see "Coleman Francis" in the preference dropdown and not "Jane Doe"
      When I select the Work in SF preference
      Then I should see "Jane Doe" in the preference dropdown and not "Coleman Francis"
      # I work and live in SF, household member lives in SF
      When I go back to the Contact page
      And I fill out the Contact page with an address (non-NRHP match) and WorkInSF
      And I confirm my address
      And I go back to the Live/Work preference page
      Then I should see the Live and Work Preferences
      # I work and live in SF, household member works in SF
      When I go back to the Household page
      And I edit the last household member
      And I change them to live outside SF, work in SF
      And I confirm their address
      And I indicate being done adding people
      And I indicate living in public housing
      And I hit the Next button "3" times
      And I continue past the Lottery Preferences intro
      Then I should see the Live and Work Preferences
      # I work in SF, household member works in SF
      When I go back to the Contact page
      And I fill out the Contact page with a non-SF address, yes to WorkInSF
      And I confirm my address
      And I go back to the Live/Work preference page
      Then I should see the Work Preference
      # I live in SF, household member works in SF
      When I go back to the Contact page
      And I fill out the Contact page with an address (non-NRHP match), no WorkInSF
      And I confirm my address
      And I go back to the Live/Work preference page
      Then I should see the Live and Work Preferences
      # Make sure the dropdowns are correct
      When I click the Live or Work in SF checkbox
      And I open the Live or Work in SF dropdown
      And I select the Live in SF preference
      Then I should see "Jane Doe" in the preference dropdown and not "Coleman Francis"
      When I select the Work in SF preference
      Then I should see "Coleman Francis" in the preference dropdown and not "Jane Doe"
      # I neither work nor live in SF, household member works in SF
      When I go back to the Contact page
      And I fill out the Contact page with a non-SF address, no WorkInSF
      And I confirm my address
      And I go back to the Live/Work preference page
      Then I should see the Work Preference
      # I neither work nor live in SF, household member lives and works in SF
      When I go back to the Household page
      And I edit the last household member
      And I change them to live inside SF, work in SF
      And I confirm their address
      And I indicate being done adding people
      And I indicate living in public housing
      And I hit the Next button "3" times
      And I continue past the Lottery Preferences intro
      Then I should see the Live and Work Preferences
      # Make sure the dropdowns are correct
      When I click the Live or Work in SF checkbox
      And I open the Live or Work in SF dropdown
      And I select the Live in SF preference
      Then I should see "Coleman Francis" in the preference dropdown and not "Jane Doe"
      When I select the Work in SF preference
      Then I should see "Coleman Francis" in the preference dropdown and not "Jane Doe"
      # I work in SF, household member lives and works in SF
      When I go back to the Contact page
      And I fill out the Contact page with a non-SF address, yes to WorkInSF
      And I confirm my address
      And I go back to the Live/Work preference page
      Then I should see the Live and Work Preferences
      # I live in SF, household member lives and works in SF
      When I go back to the Contact page
      And I fill out the Contact page with an address (non-NRHP match), no WorkInSF
      And I confirm my address
      And I go back to the Live/Work preference page
      Then I should see the Live and Work Preferences
      # Check that filling it out then changing required info removes from application
      When I select "Jane Doe" for "Live in San Francisco" in Live/Work preference
      And I upload a "Gas bill" as my proof of preference for "liveInSf"
      And I don't choose COP/DTHP preferences
      And I click the Next button on the Live/Work Preference page
      And I go back to the Contact page
      And I fill out the Contact page with a non-SF address, no WorkInSF
      And I confirm my address
      And I go back to the Live/Work preference page
      Then I should see the Live or Work in SF checkbox un-checked
      # see general lottery notice
      When I opt out of Live/Work preference
      And I opt out of Assisted Housing preference
      And I hit the Next button "3" times
      Then I should see the general lottery notice on the review page

    Scenario: Opting in to live/work then saying no to workInSf then uploading proof
      Given I go to the first page of the Test Listing application
      When I fill out the Name page as "Jane Doe"
      And I fill out the Contact page with an address (non-NRHP match) and WorkInSF
      And I confirm my address
      And I don't indicate an alternate contact
      And I indicate I will live alone
      And I indicate living in public housing
      And I indicate no priority
      And I indicate having vouchers
      And I fill out my income as "25000"
      And I continue past the Lottery Preferences intro
      And I select "Jane Doe" for "Live in San Francisco" in Live/Work preference
      And I go back to the Contact page
      And I change WorkInSF to "No"
      And I go back to the Live/Work preference page, skipping NRHP if exists
      Then I should still see the single Live in San Francisco preference selected
      When I upload a "Gas bill" as my proof of preference for "liveInSf"
      Then I should see the successful file upload info
      When I click the Next button on the Live/Work Preference page
      And I opt out of Assisted Housing preference
      Then I should see the Preferences Programs screen

    Scenario: Selecting live/work member, going back and forth from previous page, changing name
      Given I go to the first page of the Test Listing application
      When I fill out the Name page as "Jane Doe"
      And I fill out the Contact page with an address (NRHP match) and WorkInSF
      And I confirm my address
      And I don't indicate an alternate contact
      And I indicate I will live alone
      And I indicate living in public housing
      And I indicate no priority
      And I indicate having vouchers
      And I fill out my income as "25000"
      And I continue past the Lottery Preferences intro
      And I opt out of NRHP preference
      And I select "Jane Doe" for "Live in San Francisco" in Live/Work preference
      And I use the browser back button
      And I go back to the Live/Work preference page, skipping NRHP if exists
      Then I should still see the preference options and uploader input visible
      # Finish the application and make sure a name change doesn't unclaim the preference
      When I upload a "Gas bill" as my proof of preference for "liveInSf"
      And I click the Next button on the Live/Work Preference page
      And I opt out of Assisted Housing preference
      And I don't choose COP/DTHP preferences
      And I fill out the optional survey
      And I navigate to the "You" section
      And I fill out the Name page as "Harper Lee"
      And I navigate to the "Review" section
      And I fill out the optional survey
      Then I should see "Live in San Francisco" preference claimed for "Harper Lee"
