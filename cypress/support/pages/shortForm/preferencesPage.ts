// cypress/support/pages/shortForm/preferencesPage.ts

/**
 * Check a checkbox only if it is not already checked.
 */
function checkCheckbox(id: string): void {
  cy.get(`#${id}`).then(($el) => {
    if (!$el.is(":checked")) {
      cy.wrap($el).click()
    }
  })
}

/**
 * Select a preference checkbox and choose a household member from the dropdown.
 */
export function selectPreference(preference: string, memberName: string): void {
  checkCheckbox(`preferences-${preference}`)
  cy.get(`#${preference}_household_member`).filter(":visible").first().select(memberName)
}

/**
 * Opt out of a preference by checking the opt-out checkbox and submitting.
 */
export function optOutOfPreference(): void {
  checkCheckbox("preference-optout")
  cy.get("#submit").click()
}

/**
 * Upload a proof file for a preference.
 */
export function uploadPreferenceProof(preference: string, documentType: string): void {
  cy.get(`#${preference}_proofDocument`).filter(":visible").first().select(documentType)
  cy.get('input[type="file"]')
    .filter(":visible")
    .first()
    .selectFile("app/assets/images/logo-city.png", { force: true })
}

/**
 * Select the Live/Work in SF preference with a sub-preference and member.
 */
export function selectLiveWorkPreference(subPref: string, memberName: string): void {
  checkCheckbox("preferences-liveWorkInSf")
  cy.get("#liveWorkPrefOption").select(subPref)

  const pref = subPref === "Live in San Francisco" ? "liveInSf" : "workInSf"
  cy.get(`#${pref}_household_member`).filter(":visible").first().select(memberName)
}

/**
 * Select the Rent Burdened preference checkbox.
 */
export function selectRentBurdenPreference(): void {
  checkCheckbox("preferences-rentBurden")
}

/**
 * Select the Assisted Housing preference checkbox.
 */
export function selectAssistedHousingPreference(): void {
  checkCheckbox("preferences-assistedHousing")
}

/**
 * Answer "Yes" to the Veterans preference question and select a member.
 */
export function selectVeteransPreference(memberName: string): void {
  cy.get("#isAnyoneAVeteran_yes").click()
  cy.get("#selected_veteran_member").select(memberName)
}

export interface AliceGriffithAddressData {
  address1?: string
  city?: string
  state?: string
  zip?: string
}

const ALICE_GRIFFITH_DEFAULTS: AliceGriffithAddressData = {
  address1: "1234 Market St.",
  city: "San Francisco",
  state: "CA",
  zip: "94114",
}

/**
 * Fill the Alice Griffith address fields.
 */
export function fillAliceGriffithAddress(data: AliceGriffithAddressData = {}): void {
  const merged = { ...ALICE_GRIFFITH_DEFAULTS, ...data }
  cy.get("#aliceGriffith_aliceGriffith_address_address1").clear().type(merged.address1)
  cy.get("#aliceGriffith_aliceGriffith_address_city").clear().type(merged.city)
  cy.get("#aliceGriffith_aliceGriffith_address_state").select(merged.state)
  cy.get("#aliceGriffith_aliceGriffith_address_zip").clear().type(merged.zip)
}

/**
 * Upload lease and rent proof files for Rent Burdened preference.
 * ngf-select injects a hidden <input type="file"> with id="ngf-{fileInputName}".
 */
export function uploadRentBurdenProof(documentType: string): void {
  // Upload lease file via the hidden input injected by ngf-select
  cy.get("#ngf-rentBurden_leaseFile").selectFile("app/assets/images/logo-portal.png", {
    force: true,
  })
  // Wait for lease upload to register
  cy.get("#uploaded-rentBurden_leaseFile").should("exist")

  // Select rent document type and upload rent file
  cy.get("#rentBurden_rentDocument").filter(":visible").first().select(documentType)
  cy.get("#ngf-rentBurden_rentFile").selectFile("app/assets/images/logo-city.png", {
    force: true,
  })
  // Wait for rent upload to register
  cy.get("#uploaded-rentBurden_rentFile").should("exist")
}

/**
 * Upload a lease copy for Assisted Housing preference.
 */
export function uploadAssistedHousingProof(): void {
  cy.get("#ngf-assistedHousing_proofFile").selectFile("app/assets/images/logo-portal.png", {
    force: true,
  })
}

/**
 * Click submit to continue past a preference page.
 */
export function continuePreferences(): void {
  cy.get("#submit").click()
}
