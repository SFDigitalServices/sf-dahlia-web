Feature: Short Form Application
    As a web user
    I should be able to select a non-English language
    In order to read short form application instructions and errors in my native language

    Scenario: Using multilingual to select a non-english language
      Given I go to the welcome page of the Test Listing application
      And I select "Spanish" as my language
      And I continue past the community screening and welcome overview
      Then I should see "Español" selected in the short form language switcher
      When I go to the listings page in Spanish
      Then I should be redirected back to the listings page in English
