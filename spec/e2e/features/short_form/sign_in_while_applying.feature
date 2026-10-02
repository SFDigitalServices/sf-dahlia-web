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
        And I sign out without saving
