Feature: Sign-in while filling out application
    As a web user with an account
    I should be able to sign-in while filling out an application anonymously
    In order to associate my application with my account and reconcile any previous applications

    Scenario: Setting up an account for sign in while applying tests
        # Birth date indicates < 65 years old for senior building tests
        Given I have a confirmed account for "Alice Walker" with birth date "1/1/2000"
        When I wait "5" seconds


    ### Applying to senior building ###


    Scenario: Signing in on the welcome back page when my account DOB disqualifies me and creating a new account
        Given I go to the first page of the "Senior Test Listing" application
        When I answer "No" to the community screening question
        Then I should see a form notice that says "Everyone in your household must be a Senior"

        When I wait "1" seconds
        And I answer "Yes" to the community screening question
        # Continue past welcome page
        And I hit the Next button "1" time
        # Email for existing account, but a different birth date than in account settings to qualify for senior listing
        And I fill out the Name page as "Alice Walker" with birth date "1/1/1900"
        And I sign in as "Alice Walker" with my email pre-filled
        Then I should see a form notice that says "Everyone in your household must be a Senior"

        When I choose to reconcile my application details by creating a new account
        Then I should be signed out
        And I should see a form alert that says "Create a new account with a different email address and you won't lose any of the information you've entered so far"

        When I create an account for "Octavia Butler"
        And I continue my saved draft for the Senior Test Listing
        And I sign in as "Octavia Butler"
        When I wait "1" seconds
        And I answer "Yes" to the community screening question
        And I hit the Next button "1" time
        Then I should be on the "Name" page of the application
        And I should see the account info for "Octavia Butler" filled in on the Name page
        And I sign out without saving

    Scenario: Signing in on the welcome back page when my account DOB disqualifies me and continuing anonymously
        Given I go to the first page of the "Senior Test Listing" application
        When I answer "Yes" to the community screening question
        And I hit the Next button "1" time
        # Email for existing account, but a different birth date than in account settings to qualify for senior listing
        And I fill out the Name page as "Alice Walker" with birth date "1/1/1900"
        And I sign in as "Alice Walker" with my email pre-filled
        Then I should see a form notice that says "Everyone in your household must be a Senior"

        When I choose to reconcile my application details by continuing without an account
        Then I should be on the "Contact" page of the application


    ### User does not have a saved draft ###


    Scenario: Signing in on the welcome back page with same account details
        Given I go to the first page of the "Test Listing" application
        When I fill out the Name page as "Alice Walker"
        Then the application page title should be "Welcome back!"
        When I sign in as "Alice Walker" with my email pre-filled
        Then I should be signed in
        And I should be on the "Name" page of the application
        And I should only by able to edit my info from account settings
        And I should see the account info for "Alice Walker" filled in on the Name page

        # Delete my automatically saved application for the next test
        When I go to the "My Applications" page
        And I delete my application for the "Test Listing"
        And I sign out

    Scenario: Signing in on the welcome back page with different account details
        Given I go to the first page of the "Test Listing" application
        # different birth date than in account settings
        When I fill out the Name page as "Alice Walker" with birth date "1/5/1955"
        And I sign in as "Alice Walker" with my email pre-filled
        Then I should be on the "Name" page of the application
        And I should see a form alert that says "Your application details were updated to match your account settings"

        # Save application for next set of tests
        Then I hit the Next button "1" time
        And I fill out the Contact page with an address, NRHP match, and WorkInSF
        And I click the Save and Finish Later button
        And I sign out


    ### User has a previously saved draft ###


    Scenario: Signing in on welcome back page with draft application and continuing draft
        Given I go to the first page of the "Test Listing" application
        And I fill out the Name page as "Alice Walker"
        And I sign in as "Alice Walker" with my email pre-filled
        Then the application page title should be "Pick up where you left off"
        When I choose to continue my saved draft
        Then I should be on the "Contact" page of the application
        And I should see my address, NRHP match, on the Contact page
        And I sign out without saving

    Scenario: Signing in on welcome back page with draft application and starting from scratch
        Given I go to the first page of the "Test Listing" application
        And I fill out the Name page as "Alice Walker"
        And I sign in as "Alice Walker" with my email pre-filled
        Then the application page title should be "Pick up where you left off"
        And I choose to start from scratch
        Then I should be on the "Name" page of the application
        When I submit the Name page with my account info
        Then the Contact page fields should be empty
        And I sign out without saving

    Scenario: Signing in to save and finish later with different account details and using original application
        And I go to the first page of the "Test Listing" application
        And I fill out the Name page as "Alice Walker" with birth date "12/12/1912"
        And I continue without signing in
        And I click the Save and Finish Later button
        And I click the Sign In button
        And I sign in as "Alice Walker" with my email pre-filled
        Then I should be on the Choose Draft page
        When I select my original application and submit
        Then I should land on the My Applications page
        And I sign out

    Scenario: Signing in to save and finish later while different account details and continuing anonymously
        Given I go to the first page of the "Test Listing" application
        # different birth date than in account settings
        When I fill out the Name page as "Alice Walker" with birth date "4/4/1954"
        And I continue without signing in
        And I click the Save and Finish Later button
        And I click the Sign In button
        When I sign in as "Alice Walker" with my email pre-filled
        And I select my recent application and submit
        And I choose to reconcile my application details by continuing without an account
        Then I should be signed out
        And I should be on the "Contact" page of the application
        # Contact fields should be blank, unlike saved application
        And the Contact page fields should be empty

    Scenario: Signing in to save and finish later with different account details and creating a new account
        # Already started with anonymous application in previous test
        When I fill out the Contact page with an address, NRHP match, and WorkInSF
        And I confirm my address
        And I don't indicate an alternate contact
        And I indicate I will live alone
        And I indicate living in public housing
        And I indicate no ADA priority
        And I indicate having vouchers
        And I fill out my income as "50000"

        # Preferences
        And I continue past the Lottery Preferences intro
        And I select Assisted Housing Preference
        And I select "Alice Walker" for "assistedHousing" preference
        And I upload a Copy of Lease as my proof for Assisted Housing
        And I click the Save and Finish Later button
        And I click the Sign In button
        And I sign in as "Alice Walker" with my email pre-filled
        And I select my recent application and submit
        And I choose to reconcile my application details by creating a new account
        Then I should be signed out
        And I should see a form alert that says "Create a new account with a different email address and you won't lose any of the information you've entered so far"

        When I create an account for "Alice Walker"
        Then I should see a form alert that says "Email is already in use"

        When I create an account for "Harper Lee"
        # wait a moment for account confirmation
        And I wait "5" seconds
        And I continue my saved draft for the Test Listing
        And I sign in as "Harper Lee"
        Then I should be on the "Name" page of the application
        And I should only by able to edit my info from account settings
        And I should not be able to navigate to the "Income" section
        And I should not be able to navigate to the "Preferences" section
        And I should see the account info for "Harper Lee" filled in on the Name page
        And I should see my address, NRHP match, on the Contact page

        When I hit the Next button "1" time
        And I indicate I will live alone
        And I hit the Next button "5" times
        Then I should see the "assistedHousing" checkbox un-checked
        And I sign out without saving

    Scenario: Signing in to save and finish later with different account details and using new application
        Given I go to the first page of the "Test Listing" application
        # different birth date than in account settings
        When I fill out the Name page as "Alice Walker" with birth date "2/2/1952"
        And I continue without signing in
        And I fill out the Contact page with an address, non-NRHP match, and WorkInSF
        And I confirm my address
        And I don't indicate an alternate contact
        And I indicate I will live alone
        And I indicate living in public housing
        And I indicate no ADA priority
        And I indicate having vouchers
        And I fill out my income as "50000"
        # Preferences
        And I continue past the Lottery Preferences intro
        And I select Assisted Housing Preference
        And I select "Alice Walker" for "assistedHousing" preference
        And I upload a Copy of Lease as my proof for Assisted Housing
        And I click the Save and Finish Later button
        And I click the Sign In button
        And I sign in as "Alice Walker" with my email pre-filled
        Then I should be on the Choose Draft page

        When I select my recent application and submit
        Then I should be on a page to reconcile my application details

        When I choose to reconcile my application details by changing them to match my account details
        Then I should be on the "Name" page of the application
        And I should not be able to navigate to the "Income" section
        And I should not be able to navigate to the "Preferences" section
        When I navigate to the "You" section
        Then I should see the account info for "Alice Walker" filled in on the Name page

        When I hit the Next button "2" times
        And I indicate I will live alone
        And I hit the Next button "5" times
        Then I should see the "assistedHousing" checkbox un-checked

        # Submit application for next set of tests
        When I opt out of "Assisted Housing" preference
        And I opt out of "Live/Work" preference
        And I opt out of "Alice Griffith" preference
        And I don't choose COP-DTHP preferences
        And I answer "No" to the Veterans preference question
        And I continue past the general lottery notice page
        And I fill out the optional survey
        And I confirm details on the review page
        And I agree to the terms and submit
        And I sign out without saving


    ### User has a previously submitted application ###


    Scenario: Signing in to save and finish later with an already submitted application
        Given I go to the first page of the "Test Listing" application
        When I fill out the Name page as "Alice Walker"
        And I sign in as "Alice Walker" with my email pre-filled
        Then I should be on the "My Applications" page
        And I should see a modal that says "You have already submitted an application to this listing."

        And I close the modal
        And I sign out
