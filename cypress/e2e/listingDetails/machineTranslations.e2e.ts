function verifyMachineTranslations(language, id, translations) {
  cy.visit(`${language}/listings/${id}?react=true`)
  translations.forEach((text) => {
    cy.contains(text)
  })
}

const listings = {
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
  es: "sesión de información de prueba",
  tl: "sesyon ng impormasyon ng pagsubok",
  zh: "測試信息會話",
}

const INFORMATION_SESSION_SALE_TEXT = {
  es: "La asistencia a una sesión informativa",
  tl: "Ang pagdalo sa isang sesyon ng impormasyon",
  zh: "必須由一名申請人參加信息發布會。",
}

const CREDIT_HISTORY_TEXT = {
  es:
    "Proporcione un informe de crédito con puntaje de Equifax, Experian o TransUnion fechado dentro de los treinta (30) días posteriores a la solicitud.",
  tl:
    "Magbigay ng credit report na may marka mula sa Equifax, Experian, o TransUnion na may petsa sa loob ng tatlumpung (30) araw ng aplikasyon.",
  zh: "提供 Equifax、Experian 或 TransUnion 在申請後三十",
}

const PARKING_TEXT = {
  es: "En el precio de venta de cada unidad se incluye una plaza de aparcamiento.",
  tl: "Isang parking space ang kasama sa presyo ng pagbebenta ng bawat unit.",
  zh: "每個單元的銷售價格中包含一個停車位",
}

describe("Listing Details Machine Translations", () => {
  afterEach(() => {
    // TODO: remove me once this is fixed. we shouldn't have to wait in between tests, but
    // there is a rogue loading issue beyond the scope of this story
    cy.wait(3000)
  })

  describe("Rental Listing " + listings.OPEN_RENTAL.id, () => {
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
      verifyMachineTranslations("tl", listings.OPEN_RENTAL.id, [
        INFORMATION_SESSION_RENTAL_TEXT.tl,
        CREDIT_HISTORY_TEXT.tl,
      ])
    })

    it("machine translations works in Chinese", () => {
      verifyMachineTranslations("zh", listings.OPEN_RENTAL.id, [
        INFORMATION_SESSION_RENTAL_TEXT.zh,
        CREDIT_HISTORY_TEXT.zh,
      ])
    })

    it("machine translations work in Spanish", () => {
      verifyMachineTranslations("es", listings.OPEN_RENTAL.id, [
        INFORMATION_SESSION_RENTAL_TEXT.es,
        CREDIT_HISTORY_TEXT.es,
      ])
    })
  })

  describe("Sale Listing " + listings.OPEN_SALE.id, () => {
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
      verifyMachineTranslations("tl", listings.OPEN_SALE.id, [
        INFORMATION_SESSION_SALE_TEXT.tl,
        PARKING_TEXT.tl,
      ])
    })

    it("machine translations works in Chinese", () => {
      verifyMachineTranslations("zh", listings.OPEN_SALE.id, [
        INFORMATION_SESSION_SALE_TEXT.zh,
        PARKING_TEXT.zh,
      ])
    })

    it("machine translations work in Spanish", () => {
      verifyMachineTranslations("es", listings.OPEN_SALE.id, [
        INFORMATION_SESSION_SALE_TEXT.es,
        PARKING_TEXT.es,
      ])
    })
  })
})
