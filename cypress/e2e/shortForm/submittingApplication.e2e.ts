// cypress/e2e/shortForm/submittingApplication.e2e.ts
// Migrated from: spec/e2e/features/short_form/submitting_application.feature
// Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7

import {
  fillNamePage,
  NAME_DEFAULTS,
  expectNamePageValues,
  fillContactPage,
  CONTACT_DEFAULTS,
  expectContactPageValues,
  fillAlternateContactType,
  fillAlternateContactName,
  fillAlternateContactContact,
  ALTERNATE_CONTACT_DEFAULTS,
  indicateLivingAlone,
  indicateLivingWithOthers,
  openHouseholdMemberForm,
  addHouseholdMember,
  indicateBeingDoneAddingPeople,
  indicateLivingInPublicHousing,
  indicateNotLivingInPublicHousing,
  indicateNoAdaPriority,
  fillIncomePage,
  indicateHavingVouchers,
  indicateNoVouchers,
  fillDemographicSurvey,
  confirmReviewDetails,
  agreeToTermsAndSubmit,
  expectReviewPageContains,
  optOutOfPreference,
  selectPreference,
  uploadPreferenceProof,
  selectRentBurdenPreference,
  uploadRentBurdenProof,
  fillAliceGriffithAddress,
  selectVeteransPreference,
  clickNext,
  clickSaveAndFinishLater,
  confirmModal,
  cancelModal,
  navigateToSection,
} from "../../support/pages/shortForm"
import { createTestAccount, TestAccount } from "../../support/helpers/testData"

// NOTE: showVeteransApplicationQuestion is false in the Protractor suite (page-util.coffee)
// so veterans-related steps are conditionally skipped in the original tests.
// We mirror that behavior here.
const SHOW_VETERANS_QUESTION = false

describe("Short Form Application", { testIsolation: false }, () => {
  // Create test accounts used across scenarios
  const basicAccount: TestAccount = createTestAccount("Jane Doe")
  // birthDate must match NAME_DEFAULTS (2/22/1990) since fillNamePage uses those defaults
  const fullAccount: TestAccount = createTestAccount(
    "Jane Valerie Doe",
    `${NAME_DEFAULTS.dobMonth}/${NAME_DEFAULTS.dobDay}/${NAME_DEFAULTS.dobYear}`
  )

  // ─── Scenario 1: Submitting a basic application ───
  it("Submitting a basic application", () => {
    cy.goToApplication("test")

    // Name page — fill with defaults + account email
    fillNamePage({
      firstName: basicAccount.firstName,
      middleName: "",
      lastName: basicAccount.lastName,
      email: basicAccount.email,
    })
    clickNext()

    // Contact page — default address (non-NRHP), workInSf=yes
    fillContactPage()
    clickNext()

    // Address confirmation
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    // Skip alternate contact
    cy.get("#alternate_contact_none").click()
    cy.get("#submit").click()

    // Live alone
    indicateLivingAlone()

    // Living in public housing
    indicateLivingInPublicHousing()

    // No ADA priority
    indicateNoAdaPriority()

    // Having vouchers
    indicateHavingVouchers()

    // Income
    fillIncomePage("25000", "per-year")
    clickNext()

    // Continue past Lottery Preferences intro
    clickNext()

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

    // Verify lottery number on confirmation page
    cy.get("#lottery_number").should("exist")
  })

  // ─── Scenario 1 continued: Creating an account on the confirmation page ───
  it("Creating an account on the confirmation page", () => {
    // Create account with pre-filled application details
    cy.createAccountFromConfirmation({
      email: basicAccount.email,
      password: basicAccount.password,
      fullName: basicAccount.fullName,
      birthDate: basicAccount.birthDate,
    })

    // Verify on login page with email confirmation popup
    cy.get("#confirmation_needed").should("exist")
  })

  // ─── Scenario 2: Leaving the application pops up a modal ───
  it("Leaving the application pops up a modal", () => {
    cy.goToApplication("test")

    // Try to navigate to Favorites
    cy.get("a").filter(":visible").contains("My Favorites").first().click()

    // Cancel modal — stay on application page
    cancelModal()
    cy.url().should("contain", "apply")

    // Try to navigate again
    cy.get("a").filter(":visible").contains("My Favorites").first().click()

    // Confirm modal — leave application
    confirmModal()

    // Verify on Favorites page
    cy.url().should("contain", "favorites")
  })

  // ─── Scenario 3: Filling out all details and saving draft ───
  it("Filling out all details and saving draft", () => {
    cy.goToApplication("test")

    // ── You section ──
    // Name page — "Jane Valerie Doe" with account email
    fillNamePage({
      firstName: fullAccount.firstName,
      middleName: "Valerie",
      lastName: fullAccount.lastName,
      email: fullAccount.email,
    })
    clickNext()

    // Contact page — NRHP address, address2, mailing address, alt phone
    fillContactPage({
      address1: "1222 Harrison St.",
      address2: "#100",
      includeAltPhone: true,
      includeMailingAddress: true,
    })
    clickNext()

    // Address confirmation
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    // Alternate contact — fill all sections
    // Type page
    fillAlternateContactType()
    clickNext()
    // Name page
    fillAlternateContactName()
    clickNext()
    // Contact page
    fillAlternateContactContact()
    clickNext()

    // ── Household section ──
    // Living with other people
    indicateLivingWithOthers()
    // Skip household overview
    clickNext()

    // Add household member "Coleman Francis" with same address
    openHouseholdMemberForm()
    addHouseholdMember({
      firstName: "Coleman",
      lastName: "Francis",
      sameAddress: true,
    })

    // Done adding people
    indicateBeingDoneAddingPeople()

    // Not living in public housing
    indicateNotLivingInPublicHousing()

    // Enter monthly rents
    cy.get(".form-income_input").each(($el) => {
      cy.wrap($el).clear().type("4000")
    })
    clickNext()

    // ADA Mobility and Vision impairments
    cy.get("#adaPrioritiesSelected_mobility-impairments").then(($el) => {
      if (!$el.is(":checked")) cy.wrap($el).click()
    })
    cy.get("#adaPrioritiesSelected_vision-impairments").then(($el) => {
      if (!$el.is(":checked")) cy.wrap($el).click()
    })
    cy.get("#submit").click()

    // ── Income section ──
    // No vouchers
    indicateNoVouchers()

    // Income
    fillIncomePage("72000", "per-year")
    clickNext()

    // ── Preferences section ──
    // Continue past Lottery Preferences intro
    clickNext()

    // Rent Burdened preference
    selectRentBurdenPreference()
    uploadRentBurdenProof("Money order")
    clickNext()

    // Neighborhood Residence preference — select primary applicant and upload Gas bill
    selectPreference("neighborhoodResidence", `${fullAccount.firstName} ${fullAccount.lastName}`)
    uploadPreferenceProof("neighborhoodResidence", "Gas bill")
    clickNext()

    // Alice Griffith preference — select "Coleman Francis", upload proof, fill address
    selectPreference("aliceGriffith", "Coleman Francis")
    uploadPreferenceProof("aliceGriffith", "Letter from SFHA verifying address")
    fillAliceGriffithAddress()
    clickNext()
    // Confirm Alice Griffith address
    cy.get("#confirmed_home_address_yes", { timeout: 10000 }).click()
    cy.get("#submit").click()

    // COP-DTHP preferences
    // Select primary applicant for certOfPreference
    selectPreference("certOfPreference", `${fullAccount.firstName} ${fullAccount.lastName}`)
    cy.get("#certOfPreference-certificate").clear().type("11223344")
    // Select "Coleman Francis" for displaced
    selectPreference("displaced", "Coleman Francis")
    cy.get("#displaced-certificate").clear().type("11223344")
    clickNext()

    // Veterans preference — answer Yes for primary applicant (if shown)
    if (SHOW_VETERANS_QUESTION) {
      selectVeteransPreference(`${fullAccount.firstName} ${fullAccount.lastName}`)
      clickNext()
    }

    // ── Review section ──
    // Fill demographic survey
    fillDemographicSurvey()

    // Verify review page data
    expectReviewPageContains({
      "full-name": fullAccount.fullName,
      dob: fullAccount.birthDate,
      email: fullAccount.email,
      phone: "(222) 222-2222",
      "alt-phone": "(555) 111-1111",
    })

    // Verify address on review page
    cy.get(".info-item_name").should("contain.text", "1222 HARRISON ST # 100")
    cy.get(".info-item_name").should("contain.text", CONTACT_DEFAULTS.mailingAddress1)

    // Verify alternate contact details
    const altContactFullName = `${ALTERNATE_CONTACT_DEFAULTS.firstName} ${ALTERNATE_CONTACT_DEFAULTS.lastName}`
    expectReviewPageContains({
      "alt-contact-name": altContactFullName,
      "alt-contact-email": ALTERNATE_CONTACT_DEFAULTS.email,
      "alt-contact-phone": "(123) 123-1234",
    })
    cy.get("#review-alt-contact-mailing-address .info-item_name").should(
      "contain.text",
      ALTERNATE_CONTACT_DEFAULTS.address
    )

    // Verify household member details
    expectReviewPageContains({
      "household-member-0-name": "Coleman Francis",
      "household-member-0-dob": "10/15/1985",
    })

    // Verify income details
    expectReviewPageContains({
      "income-vouchers": "NONE",
      "income-amount": "$72,000.00 per year",
    })

    // Verify preference details (draft)
    cy.get("#review-neighborhoodResidence .info-item_name").should(
      "contain.text",
      "Neighborhood Resident Housing Preference"
    )
    cy.get("#review-neighborhoodResidence .info-item_note").should(
      "contain.text",
      `for ${fullAccount.firstName} Doe`
    )
    cy.get("#review-neighborhoodResidence .info-item_note").should(
      "contain.text",
      "Gas bill attached"
    )
    cy.get("#review-liveInSf .info-item_name").should(
      "contain.text",
      "Live in San Francisco Preference"
    )
    cy.get("#review-certOfPreference .info-item_name").should(
      "contain.text",
      "Certificate of Preference (COP)"
    )
    cy.get("#review-certOfPreference .info-item_note.t-bold").should(
      "contain.text",
      "Certificate Number: 11223344"
    )
    cy.get("#review-displaced .info-item_name").should(
      "contain.text",
      "Displaced Tenant Housing Preference (DTHP)"
    )
    cy.get("#review-displaced .info-item_note").should("contain.text", "for Coleman Francis")
    cy.get("#review-displaced .info-item_note.t-bold").should(
      "contain.text",
      "Certificate Number: 11223344"
    )
    cy.get("#review-rentBurden .info-item_name").should("contain.text", "Rent Burdened Preference")
    // Draft shows detailed rent burden info
    cy.get("#review-rentBurden .info-item_note").should(
      "contain.text",
      "for 1222 HARRISON ST # 100"
    )
    cy.get("#review-rentBurden .info-item_note").should(
      "contain.text",
      "Copy of Lease and Money order attached"
    )

    if (SHOW_VETERANS_QUESTION) {
      cy.get("#review-veterans .info-item_name").should("contain.text", "Yes, someone is a veteran")
      cy.get("#review-veterans .info-item_note").should(
        "contain.text",
        `for ${fullAccount.firstName} Doe`
      )
    }

    // Save and Finish Later
    clickSaveAndFinishLater()

    // Create account with pre-filled details
    cy.createAccountFromConfirmation({
      email: fullAccount.email,
      password: fullAccount.password,
      fullName: fullAccount.fullName,
      birthDate: fullAccount.birthDate,
    })

    // Verify on login page with confirmation popup
    cy.get("#confirmation_needed").should("exist")
  })

  // ─── Scenario 4: Continuing draft and submitting ───
  it("Continuing draft and submitting", () => {
    // Confirm account by email
    cy.confirmAccountByEmail(fullAccount.email)

    // Sign in
    cy.visit("/sign-in")
    cy.get("#auth_email").type(fullAccount.email)
    cy.get("#auth_password").type(fullAccount.password)
    cy.get("#sign-in").click()

    // Go to My Applications
    cy.visit("/my-applications")

    // Click Continue Application
    cy.contains("a", "Continue Application").click()

    // Should land back on the Review page — verify contact details
    expectReviewPageContains({
      "full-name": fullAccount.fullName,
      dob: fullAccount.birthDate,
      email: fullAccount.email,
      phone: "(222) 222-2222",
      "alt-phone": "(555) 111-1111",
    })

    // ── Navigate to "You" section and verify all data ──
    navigateToSection("You")

    // Verify Name page data
    expectNamePageValues({
      firstName: fullAccount.firstName,
      middleName: "Valerie",
      lastName: fullAccount.lastName,
      dobMonth: NAME_DEFAULTS.dobMonth,
      dobDay: NAME_DEFAULTS.dobDay,
      dobYear: NAME_DEFAULTS.dobYear,
      email: fullAccount.email,
    })
    clickNext()

    // Verify Contact page data
    expectContactPageValues({
      address1: "1222 HARRISON ST # 100",
      includeAltPhone: true,
      includeMailingAddress: true,
    })
    clickNext()

    // Verify Alternate Contact data — type page
    cy.get("#alternateContactType_other").should("have.value", "Other")
    cy.get('[ng-model="alternateContact.alternateContactTypeOther"]').should(
      "have.value",
      ALTERNATE_CONTACT_DEFAULTS.typeOther
    )
    clickNext()

    // Alternate Contact name page
    cy.get('[ng-model="alternateContact.firstName"]').should(
      "have.value",
      ALTERNATE_CONTACT_DEFAULTS.firstName
    )
    cy.get('[ng-model="alternateContact.lastName"]').should(
      "have.value",
      ALTERNATE_CONTACT_DEFAULTS.lastName
    )
    clickNext()

    // Alternate Contact contact page
    cy.get('[ng-model="alternateContact.phone"]').should("have.value", "(123) 123-1234")
    cy.get('[ng-model="alternateContact.email"]').should(
      "have.value",
      ALTERNATE_CONTACT_DEFAULTS.email
    )
    cy.get("#alternateContact_mailing_address_address1").should(
      "have.value",
      ALTERNATE_CONTACT_DEFAULTS.address
    )
    clickNext()

    // ── Verify Household data ──
    cy.get("#household-primary .info-item_name").should(
      "contain.text",
      `${fullAccount.firstName} Doe`
    )
    cy.get("#household-member-0 .info-item_name").should("contain.text", "Coleman Francis")
    indicateBeingDoneAddingPeople()

    // Public Housing page
    cy.get("#hasPublicHousing_no").should("be.checked")
    clickNext()

    // Monthly Rent page
    cy.get('[id="monthlyRent_0"]').should("have.value", "4,000.00")
    clickNext()

    // ADA Priorities page
    cy.get("#adaPrioritiesSelected_mobility-impairments").should("be.checked")
    cy.get("#adaPrioritiesSelected_vision-impairments").should("be.checked")
    clickNext()

    // ── Verify Income data ──
    cy.get("#householdVouchersSubsidies_no").should("be.checked")
    clickNext()
    cy.get("#incomeTotal").should("have.value", "72,000.00")
    clickNext()

    // ── Verify Preferences data ──
    // Continue past Lottery Preferences intro
    clickNext()

    // Rent Burdened page
    cy.get("#preferences-rentBurden").should("be.checked")
    cy.get("#uploaded-rentBurden_leaseFile .media-body strong").should(
      "contain.text",
      "Copy of Lease"
    )
    cy.get("#uploaded-rentBurden_rentFile .media-body strong").should("contain.text", "Money order")
    clickNext()

    // Neighborhood Residence page
    cy.get("#preferences-neighborhoodResidence").should("be.checked")
    cy.get("#uploaded-neighborhoodResidence_proofFile .media-body strong").should(
      "contain.text",
      "Gas bill"
    )
    clickNext()

    // Alice Griffith page
    cy.get("#preferences-aliceGriffith").should("be.checked")
    cy.get("#uploaded-aliceGriffith_proofFile .media-body strong").should(
      "contain.text",
      "Letter from SFHA verifying address"
    )
    cy.get("#aliceGriffith_aliceGriffith_address_address1").should("have.value", "1234 MARKET ST")
    clickNext()

    // COP-DTHP Preferences Programs page
    cy.get("#preferences-certOfPreference").should("be.checked")
    cy.get("#certOfPreference-certificate").should("have.value", "11223344")
    cy.get("#preferences-displaced").should("be.checked")
    cy.get("#displaced-certificate").should("have.value", "11223344")
    clickNext()

    // Veterans preference page (if shown)
    if (SHOW_VETERANS_QUESTION) {
      cy.get("#isAnyoneAVeteran_yes").should("be.checked")
      clickNext()
    }

    // ── Verify Survey data ──
    // The survey page should show previously entered data
    cy.get("#user_gender").should("have.value", "Not Listed")
    cy.get("#genderOther").should("have.value", "Dothraki")
    clickNext()

    // ── Back on Review page — verify again ──
    expectReviewPageContains({
      "full-name": fullAccount.fullName,
      email: fullAccount.email,
    })

    // Verify preference details on draft
    cy.get("#review-neighborhoodResidence .info-item_name").should(
      "contain.text",
      "Neighborhood Resident Housing Preference"
    )
    cy.get("#review-certOfPreference .info-item_name").should(
      "contain.text",
      "Certificate of Preference (COP)"
    )
    cy.get("#review-displaced .info-item_name").should(
      "contain.text",
      "Displaced Tenant Housing Preference (DTHP)"
    )
    cy.get("#review-rentBurden .info-item_name").should("contain.text", "Rent Burdened Preference")

    // Confirm and submit
    confirmReviewDetails()
    agreeToTermsAndSubmit()

    // Verify lottery number
    cy.get("#lottery_number").should("exist")
  })

  // ─── Scenario 4 continued: Viewing submitted application ───
  it("Viewing submitted application", () => {
    // View submitted application from My Applications
    cy.contains(".button", "Go to My Applications").click()
    cy.contains(".button", "View Application").click()

    // Verify all details on submitted application view
    expectReviewPageContains({
      "full-name": fullAccount.fullName,
      dob: fullAccount.birthDate,
      email: fullAccount.email,
      phone: "(222) 222-2222",
      "alt-phone": "(555) 111-1111",
    })

    // Verify address
    cy.get(".info-item_name").should("contain.text", "1222 HARRISON ST # 100")
    cy.get(".info-item_name").should("contain.text", CONTACT_DEFAULTS.mailingAddress1)

    // Verify alternate contact
    const altContactFullName = `${ALTERNATE_CONTACT_DEFAULTS.firstName} ${ALTERNATE_CONTACT_DEFAULTS.lastName}`
    expectReviewPageContains({
      "alt-contact-name": altContactFullName,
      "alt-contact-email": ALTERNATE_CONTACT_DEFAULTS.email,
      "alt-contact-phone": "(123) 123-1234",
    })

    // Verify household member
    expectReviewPageContains({
      "household-member-0-name": "Coleman Francis",
      "household-member-0-dob": "10/15/1985",
    })

    // Verify income
    expectReviewPageContains({
      "income-vouchers": "NONE",
      "income-amount": "$72,000.00 per year",
    })

    // Verify preferences on submitted application
    cy.get("#review-neighborhoodResidence .info-item_name").should(
      "contain.text",
      "Neighborhood Resident Housing Preference"
    )
    cy.get("#review-neighborhoodResidence .info-item_note").should(
      "contain.text",
      `for ${fullAccount.firstName} Doe`
    )
    cy.get("#review-neighborhoodResidence .info-item_note").should(
      "contain.text",
      "Gas bill attached"
    )
    cy.get("#review-liveInSf .info-item_name").should(
      "contain.text",
      "Live in San Francisco Preference"
    )
    cy.get("#review-aliceGriffith .info-item_note").should(
      "contain.text",
      "Letter from SFHA verifying address"
    )
    cy.get("#review-certOfPreference .info-item_name").should(
      "contain.text",
      "Certificate of Preference (COP)"
    )
    cy.get("#review-certOfPreference .info-item_note").should(
      "contain.text",
      `for ${fullAccount.firstName} Doe`
    )
    cy.get("#review-certOfPreference .info-item_note.t-bold").should(
      "contain.text",
      "Certificate Number: 11223344"
    )
    cy.get("#review-displaced .info-item_name").should(
      "contain.text",
      "Displaced Tenant Housing Preference (DTHP)"
    )
    cy.get("#review-displaced .info-item_note").should("contain.text", "for Coleman Francis")
    cy.get("#review-displaced .info-item_note.t-bold").should(
      "contain.text",
      "Certificate Number: 11223344"
    )
    cy.get("#review-rentBurden .info-item_name").should("contain.text", "Rent Burdened Preference")
    // Submitted app shows "for your household" instead of specific address
    cy.get("#review-rentBurden .info-item_note").should("contain.text", "for your household")

    if (SHOW_VETERANS_QUESTION) {
      cy.get("#review-veterans .info-item_name").should("contain.text", "Yes, someone is a veteran")
      cy.get("#review-veterans .info-item_note").should(
        "contain.text",
        `for ${fullAccount.firstName} Doe`
      )
    }
  })

  // ─── Scenario 5: Signing out ───
  it("Signing out", () => {
    // Click My Account dropdown, then Sign Out
    cy.contains("a", "My Account").click()
    cy.get("#my-account-dropdown").contains("a", "Sign Out").click()

    // Verify on Sign In page
    cy.contains("h1", "Sign In").should("exist")

    // Verify sign out success message
    cy.contains("p.alert-body", "You have successfully logged out of your account.").should("exist")
  })
})
