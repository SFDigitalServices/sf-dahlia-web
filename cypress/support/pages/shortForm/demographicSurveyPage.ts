// cypress/support/pages/shortForm/demographicSurveyPage.ts

export const DEMOGRAPHIC_DEFAULTS = {
  userGender: "Not Listed",
  genderOther: "Dothraki",
  userSex: "Not listed",
  userSexOther: "Ziggy Stardust",
  whiteOther: "German",
  indigenousNativeAmericanGroup: "Indigenous North American Group",
  indigenousCentralSouthAmericaGroup: "Indigenous South/Central American Group",
  userPrimaryLanguage: "Not Listed",
  otherPrimaryLanguage: "other primary language",
  referral: "Bus Ad",
} as const

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
 * Fill out the full demographic survey and click submit.
 */
export function fillDemographicSurvey(): void {
  // Gender
  cy.get("#user_gender").select(DEMOGRAPHIC_DEFAULTS.userGender)
  cy.get("#genderOther").clear().type(DEMOGRAPHIC_DEFAULTS.genderOther)

  // Sexual orientation
  cy.get("#user_sexual_orientation").select(DEMOGRAPHIC_DEFAULTS.userSex)
  cy.get("#user_sexual_orientation_other").clear().type(DEMOGRAPHIC_DEFAULTS.userSexOther)

  // Race — Black accordion
  cy.get("#panel-Black").click()
  checkCheckbox("panel-Black-African")

  // Race — Indigenous accordion
  cy.get("#panel-Indigenous").click()
  checkCheckbox("panel-Indigenous-American Indian\\/Native American")
  checkCheckbox(
    "panel-Indigenous-Indigenous from Mexico\\, the Caribbean\\, Central America\\, or South America"
  )
  cy.get("#panel-Indigenous-American Indian\\/Native American-text")
    .clear()
    .type(DEMOGRAPHIC_DEFAULTS.indigenousNativeAmericanGroup)
  cy.get(
    "#panel-Indigenous-Indigenous from Mexico\\, the Caribbean\\, Central America\\, or South America-text"
  )
    .clear()
    .type(DEMOGRAPHIC_DEFAULTS.indigenousCentralSouthAmericaGroup)

  // Race — White accordion
  cy.get("#panel-White").click()
  checkCheckbox("panel-White-European")
  checkCheckbox("panel-White-Other")
  cy.get("#panel-White-Other-text").clear().type(DEMOGRAPHIC_DEFAULTS.whiteOther)

  // Language
  cy.get("#user_primary_language").select(DEMOGRAPHIC_DEFAULTS.userPrimaryLanguage)
  cy.get("#otherLanguage").clear().type(DEMOGRAPHIC_DEFAULTS.otherPrimaryLanguage)

  // Referral
  cy.get("#referral").select(DEMOGRAPHIC_DEFAULTS.referral)

  // Submit
  cy.get("#submit").click()
}
