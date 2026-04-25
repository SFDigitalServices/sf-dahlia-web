// cypress/support/pages/shortForm/householdPage.ts

export interface HouseholdMemberData {
  firstName?: string
  lastName?: string
  dobMonth?: string
  dobDay?: string
  dobYear?: string
  sameAddress?: boolean
  address1?: string
  city?: string
  workInSf?: "yes" | "no"
  relationship?: string
}

export const HOUSEHOLD_MEMBER_DEFAULTS: HouseholdMemberData = {
  dobMonth: "10",
  dobDay: "15",
  dobYear: "1985",
  relationship: "Cousin",
  sameAddress: true,
  workInSf: "no",
}

/**
 * Click the "I will live alone" option.
 */
export function indicateLivingAlone(): void {
  cy.get("#live-alone").click()
}

/**
 * Click the "I will live with other people" option.
 */
export function indicateLivingWithOthers(): void {
  cy.get("#other-people").click()
}

/**
 * Click the "Add household member" button to open the form.
 * Waits for the form to be visible before returning.
 */
export function openHouseholdMemberForm(): void {
  cy.get("#add-household-member").click()
  cy.get('[ng-model="householdMember.firstName"]').should("exist")
}

/**
 * Fill and submit the household member form. Clicks #submit to save the member.
 */
export function addHouseholdMember(data: HouseholdMemberData = {}): void {
  const merged = { ...HOUSEHOLD_MEMBER_DEFAULTS, ...data }

  if (merged.firstName) {
    cy.get('[ng-model="householdMember.firstName"]').clear().type(merged.firstName)
  }
  if (merged.lastName) {
    cy.get('[ng-model="householdMember.lastName"]').clear().type(merged.lastName)
  }

  cy.get('[ng-model="householdMember.dob_month"]').clear().type(merged.dobMonth)
  cy.get('[ng-model="householdMember.dob_day"]').clear().type(merged.dobDay)
  cy.get('[ng-model="householdMember.dob_year"]').clear().type(merged.dobYear)

  if (merged.address1) {
    cy.get("#hasSameAddressAsApplicant_no").click()
    cy.get("#householdMember_home_address_address1").clear().type(merged.address1)
    cy.get("#householdMember_home_address_city")
      .clear()
      .type(merged.city || "San Francisco")
    cy.get("#householdMember_home_address_state").select("California")
    cy.get("#householdMember_home_address_zip").clear().type("94114")
  } else if (merged.sameAddress) {
    cy.get("#hasSameAddressAsApplicant_yes").click()
  }

  if (merged.workInSf === "yes") {
    cy.get("#workInSf_yes").click()
  } else {
    cy.get("#workInSf_no").click()
  }

  cy.get('[ng-model="householdMember.relationship"]').select(merged.relationship)

  // Submit the household member form
  cy.get("#submit").click()
}

/**
 * Click submit to indicate being done adding household members.
 */
export function indicateBeingDoneAddingPeople(): void {
  cy.get("#submit").click()
}

/**
 * Indicate living in public housing and submit.
 */
export function indicateLivingInPublicHousing(): void {
  cy.get("#hasPublicHousing_yes").click()
  cy.get("#submit").click()
}

/**
 * Indicate not living in public housing and submit.
 */
export function indicateNotLivingInPublicHousing(): void {
  cy.get("#hasPublicHousing_no").click()
  cy.get("#submit").click()
}

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
 * Check the "None" ADA priority checkbox and submit.
 */
export function indicateNoAdaPriority(): void {
  checkCheckbox("adaPrioritiesSelected_none")
  cy.get("#submit").click()
}

/**
 * Confirm the household member's home address and submit.
 */
export function confirmHouseholdMemberAddress(): void {
  cy.get("#confirmed_home_address_yes").click()
  cy.get("#submit").click()
}
