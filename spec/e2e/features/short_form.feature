Feature: Short Form Application
    As a web user
    I should be able to fill out the short form application
    In order to apply online to a listing

    Scenario: Submitting a basic application
      Given I go to the first page of the application
      When I fill out the short form Name page as "Jane Doe"
      And I fill out the short form Contact page with No Address and WorkInSF
      And I don't indicate an alternate contact
      And I indicate I will live alone
      And I don't choose any preferences
      And I indicate having vouchers
      And I fill out my income
      And I fill out the optional survey
      And I confirm details on the review page
      And I agree to the terms and submit
      Then I should see my lottery number on the confirmation page

    Scenario: Creating an account in order to "Save and Finish Later"
      Given I go to the first page of the application
      When I fill out the short form Name page as "Jane Doe"
      And I click the Save and Finish Later button
      And I fill out my account info
      And I submit the Create Account form
      Then I should be on the login page with the email confirmation popup

    Scenario: Opting in to live/work then saying no to workInSf
      Given I go to the first page of the application
      When I fill out the short form Name page as "Jane Doe"
      And I fill out the short form Contact page with No Address and WorkInSF
      And I don't indicate an alternate contact
      And I indicate I will live alone
      And I go to the second page of preferences
      And I select "Jane Doe" for "Live in San Francisco" in Live/Work preference
      And I go back to the Contact page and change WorkInSF to No
      And I go back to the second page of preferences
      Then I should still see the single Live in San Francisco preference selected

    Scenario: Selecting live/work member, then going back and forth from previous page
      Given I go to the first page of the application
      When I fill out the short form Name page as "Jane Doe"
      And I fill out the short form Contact page with No Address and WorkInSF
      And I don't indicate an alternate contact
      And I indicate I will live alone
      And I go to the second page of preferences
      And I select "Jane Doe" for "Live in San Francisco" in Live/Work preference
      And I use the browser back button
      And I go to the second page of preferences
      Then I should still see the preference options and uploader input visible
