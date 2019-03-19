Feature: Short Form Application - Sale Listing
    As a web user
    I should be able to fill out the short form application
    In order to apply online to a sale listing

    Scenario: Navigating through a basic application
        Given I go to the first page of the "Sale Test Listing" application
        When I hit the Next button "1" time
        Then I should be on the "Prerequisites" page of the application
        And I check complete homebuyers education
        Then I should see an error on the prerequisites form
        And I fill in prerequisites form
        Then I should be on the "Name" page of the application
        When I fill out the Name page as "Jane Doe"
        And I fill out the Contact page with an address, non-NRHP match, and WorkInSF
        And I confirm my address
        And I don't indicate an alternate contact
        And I indicate I will live alone
        Then I should be on the "Income Vouchers" page
