const verifyMachineTranslations = (language, id, translation) => {
  cy.intercept("POST", /^https:\/\/translate/).as("getTranslate")
  cy.visit(`${language}/listings/${id}?react=true`)
  cy.wait("@getTranslate", {
    requestTimeout: 100000,
  })
  return cy.contains(translation)
}

/*
 * If any of these machine translation tests are failing, it could be due to:
 * 1. Google Translate updated the translation
 * 2. A Salesforce field changed
 *
 * If one of those happen, it should be fine to either update the translation string in this file or find another machine translated field
 * and test that in the same way it's happening here. These machine translation tests are just to ensure the integration is working, not testing
 * the specific translation itself.
 */

const TEST_LISTINGS = {
  OPEN_RENTAL: {
    id: "a0W0P00000F8YG4UAN",
    title: "TEST Automated Listing (do not modify)",
  },
  OPEN_SALE: {
    id: "a0W0P00000GlKfB",
    address: "1 South Van Ness Ave, San Francisco, CA 94103",
    title: "TEST Sale Listing (do not modify) - Homeownership Acres",
  },
}

const INFORMATION_SESSION_RENTAL_TEXT = {
  en: "July 29, 2021",
  es: "29 de julio de 2021",
  zh: "2021年7月29日",
  tl: "Hulyo 29, 2021",
}

const INFORMATION_SESSION_SALE_TEXT = {
  en: "Attendance at an information session by one applicant is mandatory",
  es: "La asistencia a una sesión informativa",
  tl: "Ang pagdalo sa isang sesyon ng impormasyon",
  zh: "一名申請人必須參加資訊發布會。",
}

describe("Listing Detail Machine Translations", () => {
  describe(`Rental Listing: ${TEST_LISTINGS.OPEN_RENTAL.id}`, () => {
    describe("When a user views rental listing detail in English", () => {
      it(`should say '${INFORMATION_SESSION_RENTAL_TEXT.en}'`, () => {
        verifyMachineTranslations(
          "en",
          TEST_LISTINGS.OPEN_RENTAL.id,
          INFORMATION_SESSION_RENTAL_TEXT.en
        )
      })
    })
    describe("When a user views rental listing detail in Filipino", () => {
      it(`should translate '${INFORMATION_SESSION_RENTAL_TEXT.en}' to '${INFORMATION_SESSION_RENTAL_TEXT.tl}'`, () => {
        verifyMachineTranslations(
          "tl",
          TEST_LISTINGS.OPEN_RENTAL.id,
          INFORMATION_SESSION_RENTAL_TEXT.tl
        )
      })
    })
    describe("When a user views rental listing detail in Chinese", () => {
      it(`should translate '${INFORMATION_SESSION_RENTAL_TEXT.en}' to '${INFORMATION_SESSION_RENTAL_TEXT.zh}'`, () => {
        verifyMachineTranslations(
          "zh",
          TEST_LISTINGS.OPEN_RENTAL.id,
          INFORMATION_SESSION_RENTAL_TEXT.zh
        )
      })
    })
    describe("When a user views rental listing detail in Spanish", () => {
      it(`should translate '${INFORMATION_SESSION_RENTAL_TEXT.en}' to '${INFORMATION_SESSION_RENTAL_TEXT.es}'`, () => {
        verifyMachineTranslations(
          "es",
          TEST_LISTINGS.OPEN_RENTAL.id,
          INFORMATION_SESSION_RENTAL_TEXT.es
        )
      })
    })
    describe(`Sales Listing: ${TEST_LISTINGS.OPEN_SALE.id}`, () => {
      describe("When a user views sales listing detail in English", () => {
        it(`should say '${INFORMATION_SESSION_SALE_TEXT.en}'`, () => {
          verifyMachineTranslations(
            "en",
            TEST_LISTINGS.OPEN_SALE.id,
            INFORMATION_SESSION_SALE_TEXT.en
          )
        })
      })
      describe("When a user views sales listing detail in Filipino", () => {
        it(`should translate '${INFORMATION_SESSION_SALE_TEXT.en}' to '${INFORMATION_SESSION_SALE_TEXT.tl}'`, () => {
          verifyMachineTranslations(
            "tl",
            TEST_LISTINGS.OPEN_SALE.id,
            INFORMATION_SESSION_SALE_TEXT.tl
          )
        })
      })
      describe("When a user views sales listing detail in Chinese", () => {
        it(`should translate '${INFORMATION_SESSION_SALE_TEXT.en}' to '${INFORMATION_SESSION_SALE_TEXT.zh}'`, () => {
          verifyMachineTranslations(
            "zh",
            TEST_LISTINGS.OPEN_SALE.id,
            INFORMATION_SESSION_SALE_TEXT.zh
          )
        })
      })
      describe("When a user views sales listing detail in Spanish", () => {
        it(`should translate '${INFORMATION_SESSION_SALE_TEXT.en}' to '${INFORMATION_SESSION_SALE_TEXT.es}'`, () => {
          verifyMachineTranslations(
            "es",
            TEST_LISTINGS.OPEN_SALE.id,
            INFORMATION_SESSION_SALE_TEXT.es
          )
        })
      })
    })
  })
})
