// cypress/e2e/shortForm/signInWhileApplying.e2e.ts
// Migrated from: spec/e2e/features/short_form/sign_in_while_applying.feature
// Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11

import {
  fillNamePage,
  expectNamePageValues,
  expectNameFieldsDisabled,
  fillContactPage,
  expectContactFieldsEmpty,
  indicateLivingAlone,
  indicateLivingInPublicHousing,
  indicateNoAdaPriority,
  indicateHavingVouchers,
  fillIncomePage,
  optOutOfPreference,
  selectAssistedHousingPreference,
  uploadAssistedHousingProof,
  clickNext,
  clickNextTimes,
  clickSaveAndFinishLater,
  confirmModal,
  closeModal,
  continueWithoutSigningIn,
  navigateToSection,
  fillDemographicSurvey,
  confirmReviewDetails,
  agreeToTermsAndSubmit,
} from "../../support/pages/shortForm"
import { createTestAccount, createAccountViaUI, LISTING_IDS, TestAccount } from "../../support/helpers/testData"

// SHOW_VETERANS_QUESTION = false (same as submittingApplication)
const SHOW_VETERANS_QUESTION = false

describe("Sign-in while filling out application", () => {
  // ── Shared test accounts ──
  const aliceAccount: TestAccount = createTestAccount("Alice Walker", "1/1/2000")
  let octaviaAccount: TestAccount
  let harperAccount: TestAccount

  // ── Setup: create and confirm Alice Walker account ──
  before(() => {
    createAccountViaUI(aliceAccount)
    cy.wait(5000)
  })

  // ─── Scenario 1: Senior listing DOB disqualification — create new account ───
  it("Senior listing DOB disqualification — create new account", () => {
    // Go to senior listing
    cy.goToApplication("senior")

    // Answer "No" to community screening
    cy.get("#answeredCommunityScreening_no").click()
    cy.get("#submit").click()

    // Should see senior notice
    cy.get(".form-note").should("contain.text", "Everyone in your household must be a Senior")

    cy.wait(1000)

    // Answer "Yes" to community screening
    cy.get("#answeredCommunityScreening_yes").click()
    cy.get("#submit").click()

    // Continue past welcome page
    clickNext()

    // Fill Name page as Alice Walker with DOB 1/1/1900 (qualifies for senior)
    fillNamePage({
      firstName: aliceAccount.firstName,
      middleName: "",
      lastName: aliceAccount.lastName,
      dobMonth: "1",
      dobDay: "1",
      dobYear: "1900",
      email: aliceAccount.email,
    })
    clickNext()

    // Sign in as Alice Walker with email pre-filled
    cy.get("#sign-in").click()
    cy.get("#auth_password").clear().type(aliceAccount.password)
    cy.get("#sign-in").click()

    // Should see senior notice (account DOB 1/1/2000 disqualifies)
    cy.get(".form-note").should("contain.text", "Everyone in your household must be a Senior")

    // Choose to create a new account
    cy.get("#create-account").click()
    cy.get("#submit").click()

    // Should be signed out
    cy.get('.nav-menu a[href="/sign-in"]').should("contain.text", "Sign In")

    // Should see alert about creating new account
    cy.get(".alert-box").should(
      "contain.text",
      "Create a new account with a different email address"
    )

    // Create account for Octavia Butler
    octaviaAccount = createTestAccount("Octavia Butler")
    createAccountViaUI(octaviaAccount)

    // Continue saved draft for Senior Test Listing
    cy.visit(`/continue-draft-sign-in/${LISTING_IDS.senior}`)

    // Sign in as Octavia Butler
    cy.get("#auth_email").clear().type(octaviaAccount.email)
    cy.get("#auth_password").clear().type(octaviaAccount.password)
    cy.get("#sign-in").click()

    cy.wait(1000)

    // Answer "Yes" to community screening
    cy.get("#answeredCommunityScreening_yes").click()
    cy.get("#submit").click()

    // Continue past welcome page
    clickNext()

    // Should be on Name page
    cy.url().should("contain", "apply/name")

    // Should see Octavia Butler's account info
    expectNamePageValues({
      firstName: octaviaAccount.firstName,
      lastName: octaviaAccount.lastName,
    })

    // Sign out without saving
    cy.contains("a", "My Account").click()
    cy.get("#my-account-dropdown").contains("a", "Sign Out").click()
    cy.contains("button", "Leave").click()
  })

  // ─── Scenario 2: Senior listing DOB disqualification — continue anonymously ───
  it("Senior listing DOB disqualification — continue anonymously", () => {
    // Go to senior listing
    cy.goToApplication("senior")

    // Answer "Yes" to community screening
    cy.get("#answeredCommunityScreening_yes").click()
    cy.get("#submit").click()

    // Continue past welcome page
    clickNext()

    // Fill Name page as Alice Walker with DOB 1/1/1900
    fillNamePage({
      firstName: aliceAccount.firstName,
      middleName: "",
      lastName: aliceAccount.lastName,
      dobMonth: "1",
      dobDay: "1",
      dobYear: "1900",
      email: aliceAccount.email,
    })
    clickNext()

    // Sign in as Alice Walker with email pre-filled
    cy.get("#sign-in").click()
    cy.get("#auth_password").clear().type(aliceAccount.password)
    cy.get("#sign-in").click()

    // Should see senior notice
    cy.get(".form-note").should("contain.text", "Everyone in your household must be a Senior")

    // Choose to continue without an account
    cy.get("#continue-as-guest").click()
    cy.get("#submit").click()

    // Should be on Contact page
    cy.url().should("contain", "apply/contact")
  })

  // ─── Scenario 3: Welcome back page displayed and sign in with matching details ───
  it("Welcome back page displayed and sign in with matching details", () => {
    // Go to test listing
    cy.goToApplication("test")

    // Fill Name page as Alice Walker (matching account details)
    fillNamePage({
      firstName: aliceAccount.firstName,
      middleName: "",
      lastName: aliceAccount.lastName,
      dobMonth: "1",
      dobDay: "1",
      dobYear: "2000",
      email: aliceAccount.email,
    })
    clickNext()

    // Should see "Welcome back!" title
    cy.get("h2.app-card_question").should("contain.text", "Welcome back!")

    // Sign in as Alice Walker with email pre-filled
    cy.get("#sign-in").click()
    cy.get("#auth_password").clear().type(aliceAccount.password)
    cy.get("#sign-in").click()

    // Should be signed in
    cy.get('nav a[href="/my-account"]').should("contain.text", "My Account")

    // Should be on Name page
    cy.url().should("contain", "apply/name")

    // Fields should be disabled (edit from account settings only)
    expectNameFieldsDisabled()

    // Should see Alice Walker's account info
    expectNamePageValues({
      firstName: aliceAccount.firstName,
      lastName: aliceAccount.lastName,
      dobMonth: "1",
      dobDay: "1",
      dobYear: "2000",
      email: aliceAccount.email,
    })

    // Delete application for next test
    cy.visit("/my-applications")
    cy.contains("a", "Delete").click()
    confirmModal()

    // Sign out
    cy.contains("a", "My Account").click()
    cy.get("#my-account-dropdown").contains("a", "Sign Out").click()
  })

  // ─── Scenario 4: Sign in with different DOB ───
  it("Sign in with different DOB", () => {
    // Go to test listing
    cy.goToApplication("test")

    // Fill Name page as Alice Walker with different DOB
    fillNamePage({
      firstName: aliceAccount.firstName,
      middleName: "",
      lastName: aliceAccount.lastName,
      dobMonth: "1",
      dobDay: "5",
      dobYear: "1955",
      email: aliceAccount.email,
    })
    clickNext()

    // Sign in as Alice Walker with email pre-filled
    cy.get("#sign-in").click()
    cy.get("#auth_password").clear().type(aliceAccount.password)
    cy.get("#sign-in").click()

    // Should be on Name page
    cy.url().should("contain", "apply/name")

    // Should see alert about details updated
    cy.get(".alert-box").should(
      "contain.text",
      "Your application details were updated to match your account settings"
    )

    // Save application for next set of tests
    clickNext()

    // Fill Contact page with NRHP address and WorkInSF
    fillContactPage({ address1: "1222 Harrison St." })
    clickNext()

    // Address confirmation
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    // Save and Finish Later
    clickSaveAndFinishLater()

    // Sign out
    cy.contains("a", "My Account").click()
    cy.get("#my-account-dropdown").contains("a", "Sign Out").click()
  })

  // ─── Scenario 5: Continue draft application ───
  it("Continue draft application", () => {
    // Go to test listing
    cy.goToApplication("test")

    // Fill Name page as Alice Walker
    fillNamePage({
      firstName: aliceAccount.firstName,
      middleName: "",
      lastName: aliceAccount.lastName,
      dobMonth: "1",
      dobDay: "1",
      dobYear: "2000",
      email: aliceAccount.email,
    })
    clickNext()

    // Sign in as Alice Walker with email pre-filled
    cy.get("#sign-in").click()
    cy.get("#auth_password").clear().type(aliceAccount.password)
    cy.get("#sign-in").click()

    // Should see "Pick up where you left off"
    cy.get("h2.app-card_question").should("contain.text", "Pick up where you left off")

    // Choose to continue saved draft
    cy.get("#continue-previous-draft").click()

    // Should be on Contact page
    cy.url().should("contain", "apply/contact")

    // Should see NRHP address
    cy.get("#applicant_home_address_address1").should("have.value", "1222 HARRISON ST")

    // Sign out without saving
    cy.contains("a", "My Account").click()
    cy.get("#my-account-dropdown").contains("a", "Sign Out").click()
    cy.contains("button", "Leave").click()
  })

  // ─── Scenario 6: Start from scratch with draft ───
  it("Start from scratch with draft", () => {
    // Go to test listing
    cy.goToApplication("test")

    // Fill Name page as Alice Walker
    fillNamePage({
      firstName: aliceAccount.firstName,
      middleName: "",
      lastName: aliceAccount.lastName,
      dobMonth: "1",
      dobDay: "1",
      dobYear: "2000",
      email: aliceAccount.email,
    })
    clickNext()

    // Sign in as Alice Walker with email pre-filled
    cy.get("#sign-in").click()
    cy.get("#auth_password").clear().type(aliceAccount.password)
    cy.get("#sign-in").click()

    // Should see "Pick up where you left off"
    cy.get("h2.app-card_question").should("contain.text", "Pick up where you left off")

    // Choose to start from scratch
    cy.get("#start-from-scratch").click()

    // Should be on Name page
    cy.url().should("contain", "apply/name")

    // Submit Name page with account info
    cy.get("#submit").click()

    // Contact page fields should be empty
    expectContactFieldsEmpty()

    // Sign out without saving
    cy.contains("a", "My Account").click()
    cy.get("#my-account-dropdown").contains("a", "Sign Out").click()
    cy.contains("button", "Leave").click()
  })

  // ─── Scenario 7: Save and Finish Later — use original application ───
  it("Save and Finish Later — use original application", () => {
    // Go to test listing
    cy.goToApplication("test")

    // Fill Name page as Alice Walker with DOB 12/12/1912
    fillNamePage({
      firstName: aliceAccount.firstName,
      middleName: "",
      lastName: aliceAccount.lastName,
      dobMonth: "12",
      dobDay: "12",
      dobYear: "1912",
      email: aliceAccount.email,
    })
    clickNext()

    // Continue without signing in
    continueWithoutSigningIn()

    // Save and Finish Later
    clickSaveAndFinishLater()

    // Click Sign In button
    cy.get("#sign-in").click()

    // Sign in as Alice Walker with email pre-filled
    cy.get("#auth_password").clear().type(aliceAccount.password)
    cy.get("#sign-in").click()

    // Should be on Choose Draft page
    cy.get(".alert-box").should(
      "contain.text",
      "Please choose which version of the application you want to use."
    )

    // Select original application and submit
    cy.get("#choose_draft_original").click()
    cy.get("#submit").click()

    // Should land on My Applications page
    cy.contains("h1", "My Applications").should("exist")

    // Sign out
    cy.contains("a", "My Account").click()
    cy.get("#my-account-dropdown").contains("a", "Sign Out").click()
  })

  // ─── Scenario 8: Save and Finish Later — continue anonymously ───
  it("Save and Finish Later — continue anonymously", () => {
    // Go to test listing
    cy.goToApplication("test")

    // Fill Name page as Alice Walker with DOB 4/4/1954
    fillNamePage({
      firstName: aliceAccount.firstName,
      middleName: "",
      lastName: aliceAccount.lastName,
      dobMonth: "4",
      dobDay: "4",
      dobYear: "1954",
      email: aliceAccount.email,
    })
    clickNext()

    // Continue without signing in
    continueWithoutSigningIn()

    // Save and Finish Later
    clickSaveAndFinishLater()

    // Click Sign In button
    cy.get("#sign-in").click()

    // Sign in as Alice Walker with email pre-filled
    cy.get("#auth_password").clear().type(aliceAccount.password)
    cy.get("#sign-in").click()

    // Select recent application and submit
    cy.get("#choose_draft_recent").click()
    cy.get("#submit").click()

    // Choose to continue without an account
    cy.get("#continue-as-guest").click()
    cy.get("#submit").click()

    // Should be signed out
    cy.get('.nav-menu a[href="/sign-in"]').should("contain.text", "Sign In")

    // Should be on Contact page
    cy.url().should("contain", "apply/contact")

    // Contact fields should be empty
    expectContactFieldsEmpty()
  })

  // ─── Scenario 9: Save and Finish Later — create new account ───
  it("Save and Finish Later — create new account", () => {
    // Continuing from previous test — already on Contact page with anonymous application

    // Fill Contact page with NRHP address and WorkInSF
    fillContactPage({ address1: "1222 Harrison St." })
    clickNext()

    // Address confirmation
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    // Don't indicate an alternate contact
    cy.get("#alternate_contact_none").click()
    cy.get("#submit").click()

    // Indicate living alone
    indicateLivingAlone()

    // Indicate living in public housing
    indicateLivingInPublicHousing()

    // No ADA priority
    indicateNoAdaPriority()

    // Having vouchers
    indicateHavingVouchers()

    // Fill income
    fillIncomePage("50000", "per-year")
    clickNext()

    // Continue past Lottery Preferences intro
    clickNext()

    // Select Assisted Housing Preference
    selectAssistedHousingPreference()

    // Select Alice Walker for assistedHousing preference
    cy.get("#assistedHousing_household_member").filter(":visible").first().click()
    cy.get("#assistedHousing_household_member option")
      .filter(":visible")
      .contains("Alice Walker")
      .then(($opt) => {
        cy.get("#assistedHousing_household_member")
          .filter(":visible")
          .first()
          .select($opt.val()!)
      })

    // Upload proof for Assisted Housing
    uploadAssistedHousingProof()
    cy.wait(1000)

    // Save and Finish Later
    clickSaveAndFinishLater()

    // Click Sign In button
    cy.get("#sign-in").click()

    // Sign in as Alice Walker with email pre-filled
    cy.get("#auth_password").clear().type(aliceAccount.password)
    cy.get("#sign-in").click()

    // Select recent application and submit
    cy.get("#choose_draft_recent").click()
    cy.get("#submit").click()

    // Choose to create a new account
    cy.get("#create-account").click()
    cy.get("#submit").click()

    // Should be signed out
    cy.get('.nav-menu a[href="/sign-in"]').should("contain.text", "Sign In")

    // Should see alert about creating new account
    cy.get(".alert-box").should(
      "contain.text",
      "Create a new account with a different email address"
    )

    // Try to create account with Alice Walker's email (should fail — already in use)
    const aliceDupeAccount = createTestAccount("Alice Walker")
    const [adMonth, adDay, adYear] = aliceDupeAccount.birthDate.split("/")
    cy.get('[ng-model="userAuth.contact.firstName"]').clear().type(aliceDupeAccount.firstName)
    cy.get('[ng-model="userAuth.contact.lastName"]').clear().type(aliceDupeAccount.lastName)
    cy.get('[ng-model="userAuth.contact.dob_month"]').clear().type(adMonth)
    cy.get('[ng-model="userAuth.contact.dob_day"]').clear().type(adDay)
    cy.get('[ng-model="userAuth.contact.dob_year"]').clear().type(adYear)
    cy.get('[ng-model="userAuth.user.email"]').clear().type(aliceAccount.email)
    cy.get('[ng-model="userAuth.user.email_confirmation"]').clear().type(aliceAccount.email)
    cy.get('[ng-model="userAuth.user.password"]').clear().type(aliceDupeAccount.password)
    cy.get('[ng-model="userAuth.user.password_confirmation"]').clear().type(aliceDupeAccount.password)
    cy.get("#submit").click()

    // Should see "Email is already in use" error
    cy.get(".alert-box").should("contain.text", "Email is already in use")

    // Create account for Harper Lee (reuses the form already on screen)
    harperAccount = createTestAccount("Harper Lee")
    const [hlMonth, hlDay, hlYear] = harperAccount.birthDate.split("/")
    cy.get('[ng-model="userAuth.contact.firstName"]').clear().type(harperAccount.firstName)
    cy.get('[ng-model="userAuth.contact.lastName"]').clear().type(harperAccount.lastName)
    cy.get('[ng-model="userAuth.contact.dob_month"]').clear().type(hlMonth)
    cy.get('[ng-model="userAuth.contact.dob_day"]').clear().type(hlDay)
    cy.get('[ng-model="userAuth.contact.dob_year"]').clear().type(hlYear)
    cy.get('[ng-model="userAuth.user.email"]').clear().type(harperAccount.email)
    cy.get('[ng-model="userAuth.user.email_confirmation"]').clear().type(harperAccount.email)
    cy.get('[ng-model="userAuth.user.password"]').clear().type(harperAccount.password)
    cy.get('[ng-model="userAuth.user.password_confirmation"]').clear().type(harperAccount.password)
    cy.get("#submit").click()
    cy.confirmAccountByEmail(harperAccount.email)

    // Wait for account confirmation
    cy.wait(5000)

    // Continue saved draft for Test Listing
    cy.visit(`/continue-draft-sign-in/${LISTING_IDS.test}`)

    // Sign in as Harper Lee
    cy.get("#auth_email").clear().type(harperAccount.email)
    cy.get("#auth_password").clear().type(harperAccount.password)
    cy.get("#sign-in").click()

    // Should be on Name page
    cy.url().should("contain", "apply/name")

    // Fields should be disabled
    expectNameFieldsDisabled()

    // Should not be able to navigate to Income section
    cy.url().then((currentUrl) => {
      cy.get(".progress-nav_item").contains("Income").click()
      cy.url().should("eq", currentUrl)
    })

    // Should not be able to navigate to Preferences section
    cy.url().then((currentUrl) => {
      cy.get(".progress-nav_item").contains("Preferences").click()
      cy.url().should("eq", currentUrl)
    })

    // Should see Harper Lee's account info
    expectNamePageValues({
      firstName: harperAccount.firstName,
      lastName: harperAccount.lastName,
      email: harperAccount.email,
    })

    // Verify NRHP address on Contact page
    cy.get("#applicant_home_address_address1").should("have.value", "1222 HARRISON ST")

    // Navigate through to preferences to verify assistedHousing is cleared
    clickNext()

    // Indicate living alone
    indicateLivingAlone()

    // Click Next 5 times to get through household/income/preferences sections
    clickNextTimes(5)

    // Verify assistedHousing checkbox is unchecked
    cy.get("#preferences-assistedHousing").should("not.be.checked")

    // Sign out without saving
    cy.contains("a", "My Account").click()
    cy.get("#my-account-dropdown").contains("a", "Sign Out").click()
    cy.contains("button", "Leave").click()
  })

  // ─── Scenario 10: Save and Finish Later — use new application ───
  it("Save and Finish Later — use new application", () => {
    // Go to test listing
    cy.goToApplication("test")

    // Fill Name page as Alice Walker with DOB 2/2/1952
    fillNamePage({
      firstName: aliceAccount.firstName,
      middleName: "",
      lastName: aliceAccount.lastName,
      dobMonth: "2",
      dobDay: "2",
      dobYear: "1952",
      email: aliceAccount.email,
    })
    clickNext()

    // Continue without signing in
    continueWithoutSigningIn()

    // Fill Contact page with non-NRHP address and WorkInSF
    fillContactPage({ workInSf: "no" })
    clickNext()

    // Address confirmation
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    // Don't indicate an alternate contact
    cy.get("#alternate_contact_none").click()
    cy.get("#submit").click()

    // Indicate living alone
    indicateLivingAlone()

    // Indicate living in public housing
    indicateLivingInPublicHousing()

    // No ADA priority
    indicateNoAdaPriority()

    // Having vouchers
    indicateHavingVouchers()

    // Fill income
    fillIncomePage("50000", "per-year")
    clickNext()

    // Continue past Lottery Preferences intro
    clickNext()

    // Select Assisted Housing Preference
    selectAssistedHousingPreference()

    // Select Alice Walker for assistedHousing preference
    cy.get("#assistedHousing_household_member").filter(":visible").first().click()
    cy.get("#assistedHousing_household_member option")
      .filter(":visible")
      .contains("Alice Walker")
      .then(($opt) => {
        cy.get("#assistedHousing_household_member")
          .filter(":visible")
          .first()
          .select($opt.val()!)
      })

    // Upload proof for Assisted Housing
    uploadAssistedHousingProof()
    cy.wait(1000)

    // Save and Finish Later
    clickSaveAndFinishLater()

    // Click Sign In button
    cy.get("#sign-in").click()

    // Sign in as Alice Walker with email pre-filled
    cy.get("#auth_password").clear().type(aliceAccount.password)
    cy.get("#sign-in").click()

    // Should be on Choose Draft page
    cy.get(".alert-box").should(
      "contain.text",
      "Please choose which version of the application you want to use."
    )

    // Select recent application and submit
    cy.get("#choose_draft_recent").click()
    cy.get("#submit").click()

    // Should be on reconcile page
    cy.contains("h1", "don't match").should("exist")

    // Choose to change to match account details
    cy.get("#choose-applicant-details").click()
    cy.get("#submit").click()

    // Should be on Name page
    cy.url().should("contain", "apply/name")

    // Should not be able to navigate to Income section
    cy.url().then((currentUrl) => {
      cy.get(".progress-nav_item").contains("Income").click()
      cy.url().should("eq", currentUrl)
    })

    // Should not be able to navigate to Preferences section
    cy.url().then((currentUrl) => {
      cy.get(".progress-nav_item").contains("Preferences").click()
      cy.url().should("eq", currentUrl)
    })

    // Navigate to You section to verify account info
    navigateToSection("You")

    // Should see Alice Walker's account info
    expectNamePageValues({
      firstName: aliceAccount.firstName,
      lastName: aliceAccount.lastName,
      dobMonth: "1",
      dobDay: "1",
      dobYear: "2000",
      email: aliceAccount.email,
    })

    // Navigate through to preferences to verify assistedHousing is cleared
    clickNextTimes(2)

    // Indicate living alone
    indicateLivingAlone()

    // Click Next 5 times to get through remaining sections
    clickNextTimes(5)

    // Verify assistedHousing checkbox is unchecked
    cy.get("#preferences-assistedHousing").should("not.be.checked")

    // Opt out of Assisted Housing preference
    optOutOfPreference()

    // Opt out of Live/Work preference
    optOutOfPreference()

    // Opt out of Alice Griffith preference
    optOutOfPreference()

    // Don't choose COP-DTHP preferences
    clickNext()

    // Veterans preference — answer No (if shown)
    if (SHOW_VETERANS_QUESTION) {
      cy.get("#isAnyoneAVeteran_no").click()
      cy.get("#submit").click()
    }

    // Continue past general lottery notice page
    clickNext()

    // Fill demographic survey
    fillDemographicSurvey()

    // Confirm review details
    confirmReviewDetails()

    // Agree to terms and submit
    agreeToTermsAndSubmit()

    // Verify lottery number
    cy.get("#lottery_number").should("exist")

    // Sign out without saving
    cy.contains("a", "My Account").click()
    cy.get("#my-account-dropdown").contains("a", "Sign Out").click()
    cy.contains("button", "Leave").click()
  })

  // ─── Scenario 11: Already submitted application ───
  it("Already submitted application", () => {
    // Go to test listing
    cy.goToApplication("test")

    // Fill Name page as Alice Walker
    fillNamePage({
      firstName: aliceAccount.firstName,
      middleName: "",
      lastName: aliceAccount.lastName,
      dobMonth: "1",
      dobDay: "1",
      dobYear: "2000",
      email: aliceAccount.email,
    })
    clickNext()

    // Sign in as Alice Walker with email pre-filled
    cy.get("#sign-in").click()
    cy.get("#auth_password").clear().type(aliceAccount.password)
    cy.get("#sign-in").click()

    // Should be on My Applications page
    cy.url().should("contain", "my-applications")

    // Should see modal about already submitted application
    cy.get(".modal-inner").should(
      "contain.text",
      "You have already submitted an application to this listing."
    )

    // Close the modal
    closeModal()

    // Sign out
    cy.contains("a", "My Account").click()
    cy.get("#my-account-dropdown").contains("a", "Sign Out").click()
  })
})
