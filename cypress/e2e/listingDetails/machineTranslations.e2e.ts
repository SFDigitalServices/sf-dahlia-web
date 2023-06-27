const verifyMachineTranslations = (language, id, translation) => {
  cy.visit(`${language}/listings/${id}?react=true`)
  cy.wait(3000)
  // translations.forEach((text) => {
  //   cy.contains(text)
  // })
  return cy.contains(translation)
}

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

// const INFORMATION_SESSION_RENTAL_TEXT = {
//   es: "sesión de información de prueba",
//   tl: "sesyon ng impormasyon ng pagsubok",
//   zh: "測試信息會話",
// }

const INFORMATION_SESSION_SALE_TEXT = {
  es: "La asistencia a una sesión informativa",
  tl: "Ang pagdalo sa isang sesyon ng impormasyon",
  zh: "一名申請人必須參加信息發布會。",
}

const CREDIT_HISTORY_TEXT = {
  es: "Proporcione un informe de crédito",
  tl: "Magbigay ng credit report",
  zh: "提供來自",
}

// TODO: Removing flaky tests to unblock CircleCI pipeline
// DAH-1539 will be used to investigate root cause
//
// const PARKING_TEXT = {
//   es: "En el precio de venta de cada unidad se incluye una plaza de aparcamiento.",
//   tl: "Isang parking space ang kasama sa presyo ng pagbebenta ng bawat unit.",
//   zh: "每個單元的銷售價格中包含一個停車位",
// }

describe("Listing Details Machine Translations", () => {
  // afterEach(() => {
  //   // TODO: remove me once this is fixed. we shouldn't have to wait in between tests, but
  //   // there is a rogue loading issue beyond the scope of this story
  //   cy.wait(3000)
  // })

  // TODO(DAH-1424): Re-enable this test suite after figuring out why it's being flaky.
  // We are temporarily disabling this to unblock work.
  // eslint-disable-next-line jest/no-disabled-tests
  describe(`Rental Listing ${TEST_LISTINGS.OPEN_RENTAL.id}`, () => {
    /*
     * If any of these machine translation tests are failing, it could be due to:
     * 1. Google Translate updated the translation
     * 2. A Salesforce field changed
     *
     * If one of those happen, it should be fine to either update the translation string in this file or find another machine translated field
     * and test that in the same way it's happening here. These machine translation tests are just to ensure the integration is working, not testing
     * the specific translation itself.
     */

    it("machine translations works in Filipino", () => {
      verifyMachineTranslations("tl", TEST_LISTINGS.OPEN_RENTAL.id, CREDIT_HISTORY_TEXT.tl)
    })

    it("machine translations works in Chinese", () => {
      verifyMachineTranslations("zh", TEST_LISTINGS.OPEN_RENTAL.id, CREDIT_HISTORY_TEXT.zh)
    })

    it("machine translations work in Spanish", () => {
      verifyMachineTranslations("es", TEST_LISTINGS.OPEN_RENTAL.id, CREDIT_HISTORY_TEXT.es)
    })
  })

  describe(`Sale Listing ${TEST_LISTINGS.OPEN_SALE.id}`, () => {
    /*
     * If any of these machine translation tests are failing, it could be due to:
     * 1. Google Translate updated the translation
     * 2. A Salesforce field changed
     *
     * If one of those happen, it should be fine to either update the translation string in this file or find another machine translated field
     * and test that in the same way it's happening here. These machine translation tests are just to ensure the integration is working, not testing
     * the specific translation itself.
     */

    it("machine translations works in Filipino", () => {
      verifyMachineTranslations("tl", TEST_LISTINGS.OPEN_SALE.id, INFORMATION_SESSION_SALE_TEXT.tl)
    })

    it("machine translations works in Chinese", () => {
      verifyMachineTranslations("zh", TEST_LISTINGS.OPEN_SALE.id, INFORMATION_SESSION_SALE_TEXT.zh)
    })

    it("machine translations work in Spanish", () => {
      verifyMachineTranslations("es", TEST_LISTINGS.OPEN_SALE.id, INFORMATION_SESSION_SALE_TEXT.es)
    })
  })
})
