Feature: Short Form Application
    As a web user
    I should be able to fill out the short form application
    In order to apply online to a listing

    # Scenario: Submitting a basic application, creating an account on the confirmation page
    #   Given I go to the first page of the Test Listing application
    #   When I fill out the Name page as "Jane Doe"
    #   And I fill out the Contact page with an address (non-NRHP match) and WorkInSF
    #   And I confirm my address
    #   And I don't indicate an alternate contact
    #   And I indicate I will live alone
    #   And I continue past the Lottery Preferences intro
    #   And I opt out of Live/Work preference
    #   And I don't choose COP/DTHP preferences
    #   And I continue past the general lottery notice
    #   And I indicate having vouchers
    #   And I fill out my income as "25000"
    #   And I fill out the optional survey
    #   And I confirm details on the review page
    #   And I continue confirmation without signing in
    #   And I agree to the terms and submit
    #   Then I should see my lottery number on the confirmation page
    #   # now that we've submitted, also create an account
    #   When I click the Create Account button
    #   And I fill out my account info with my locked-in application email
    #   And I wait "10" seconds
    #   And I submit the Create Account form
    #   Then I should be on the login page with the email confirmation popup
    #
    # Scenario: Filling out all details of application and "Save and Finish Later"
    #   Given I go to the first page of the Test Listing application
    #   When I fill out the Name page as "Jane Valerie Doe"
    #   And I fill out the Contact page with my account email, address (NRHP match), mailing address
    #   And I confirm my address
    #   And I fill out an alternate contact
    #   And I indicate living with other people
    #   And I add another household member named "Coleman Francis" who lives at "123 Main St."
    #   And I confirm their address
    #   And I indicate being done adding people
    #   And I continue past the Lottery Preferences intro
    #   And I select "Jane Doe" for "neighborhoodResidence" preference
    #   And I upload a "Gas bill" as my proof of preference for "neighborhoodResidence"
    #   And I click the Next button on the Live in the Neighborhood page
    #   And I select "Jane Doe" for "certOfPreference" preference
    #   And I select "Coleman Francis" for "displaced" preference
    #   And I go to the income page
    #   And I do not indicate having vouchers
    #   And I fill out my income as "72000"
    #   And I fill out the optional survey
    #   # confirm everything has shown up
    #   Then on the Review Page I should see my contact details
    #   Then on the Review Page I should see my alternate contact details
    #   Then on the Review Page I should see my household member details
    #   Then on the Review Page I should see my income details
    #   Then on the Review Page I should see my preference details
    #   And I click the Save and Finish Later button
    #   And I fill out my account info
    #   And I submit the Create Account form
    #   Then I should be on the login page with the email confirmation popup

    Scenario: Logging into account (created in earlier scenario), viewing saved application
      # Given I have a confirmed account
      When I sign in
      And I go to My Applications
    #   Then I should see my draft application with a Continue Application button
    #
    # Scenario: Continuing draft and filling out all details of application
    #   Given I go to My Applications
      And I click the Continue Application button
      # And I submit the Name page with my account info
      Then on the Name page I should see my correct info for "Jane Valerie Doe"
      Then on the Contact page I should see my correct info
      Then on the Alternate Contact pages I should see my correct info


      # When I confirm details on the review page
      # And I agree to the terms and submit
      # And I view the application from My Applications
      # # then confirm again on the submitted app
      # Then I should see all my filled out details displayed as expected
      # #
      # # NOTE: if any Scenarios are added after this one, you may have to create a "sign out" step
      # #
