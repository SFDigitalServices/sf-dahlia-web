Feature: Short Form Application
    As a web user
    I should be able to fill out the short form application
    In order to apply online to a sale listing

    Scenario: Submitting a basic application, creating an account on the confirmation page
        Given I go to the first page of the "Sale Test Listing" application
        When I hit the Next button "1" time
        Then I should be on prerequisites page
        And I check complete homebuyers education
        Then I should see an error on the prerequisites form
        And I fill in prerequisites form
        Then I should be on application name page
