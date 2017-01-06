Feature: Short Form Application
    As a web user
    I should be able to fill out the short form application
    In order to apply online to a listing

    # Scenario: Submitting a basic application
    #   Given I go to the first page of the application
    #   When I fill out the short form Name page
    #   And I fill out the short form Contact page
    #   And I don't indicate an alternate contact
    #   And I indicate I will live alone
    #   And I don't choose any preferences
    #   And I indicate having vouchers
    #   And I fill out my income
    #   And I fill out the optional survey
    #   And I confirm details on the review page
    #   And I agree to the terms and submit
    #   Then I should see my lottery number on the confirmation page

    Scenario: Creating an account to "Save and Finish Later"
      Given I go to the first page of the application
      When I fill out the short form Name page
      And I click the Save and Finish Later button
      And I fill out my account info
      And I submit the Create Account form
      Then I should be on the login page with the email confirmation popup
