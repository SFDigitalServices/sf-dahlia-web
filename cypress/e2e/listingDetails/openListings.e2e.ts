/**
 * Util function to verify a listing details page
 * @param {string} language - optional language code
 * @param {string } id - listing id
 * @param {string} altPhotoText - alternative text that displays for listing image
 * @param {string} title - title of the listing
 * @param {string} address -(unfortunately) optional address for the listing
 * @param {string} applyButtonText - text for the apply button
 */
function verifyListing(language, id, altPhotoText, title, address, applyButtonText) {
  const langPart = language ? `/${language}` : ""
  cy.visit(`${langPart}/listings/${id}?react=true`)

  // verify image exists
  cy.get(`[alt="${altPhotoText}"]`).should("be.visible")

  // verify listing title
  cy.contains(title)

  // unfortunately not all test listings have an address. verify if provided
  if (address) {
    cy.contains(address)
  }

  // verify the apply link is visible
  cy.contains(applyButtonText)
}

function verifyMachineTranslations(language, id, translations) {
  cy.visit(`${language}/listings/${id}?react=true`)
  translations.forEach((text) => {
    cy.contains(text)
  })
}

const testListings = {
  OPEN_RENTAL: {
    id: "a0W0P00000F8YG4UAN",
    title: "TEST Automated Listing (do not modify)",
  },
  OPEN_SALE: {
    id: "a0W0P00000GlKfBUAV",
    address: "1 South Van Ness Ave, San Francisco, CA 94103",
    title: "TEST Sale Listing (do not modify) - Homeownership Acres",
  },
  HABITAT_SALE: {
    id: "a0W4U00000KnMyXUAV",
    address: "36 Amber Drive, San Francisco, CA 94131",
    title: "Habitat Amber Drive",
  },
}
const ALT_PHOTO_TEXT = {
  en: "A picture of the building",
  es: "Una foto del edificio",
  tl: "Isang larawan ng gusali",
  zh: "建築物照片",
}

const APPLY_BUTTON_TEXT = {
  en: "Apply Online",
  es: "Presente su solicitud en línea",
  tl: "Mag-aplay Online",
  zh: "網上申請",
}

const INFORMATION_SESSION_RENTAL_TEXT = {
  es: "sesión de información de prueba",
  tl: "sesyon ng impormasyon ng pagsubok",
  zh: "測試信息會話",
}

const INFORMATION_SESSION_SALE_TEXT = {
  es: "La asistencia a una sesión informativa por parte de un solicitante es obligatoria.",
  tl: "Ang pagdalo sa isang sesyon ng impormasyon ng isang aplikante ay sapilitan.",
  zh: "必須由一名申請人參加信息發布會。請",
}

const CREDIT_HISTORY_TEXT = {
  es:
    "Proporcione un informe de crédito con puntaje de Equifax, Experian o TransUnion fechado dentro de los treinta (30) días posteriores a la solicitud.",
  tl:
    "Magbigay ng credit report na may marka mula sa Equifax, Experian, o TransUnion na may petsa sa loob ng tatlumpung (30) araw ng aplikasyon.",
  zh: "提供 Equifax、Experian 或 TransUnion 在申請後三十 (30) 天內提供的帶有評分的信用報告",
}

const PARKING_TEXT = {
  es: "Garaje para un auto por unidad y está incluido en el precio de venta.",
  tl: "Isang garahe ng kotse bawat yunit at kasama sa presyo ng pagbebenta.",
  zh: "每個單元一個車庫，包含在銷售價格中。",
}

describe("Listing Details for Open Listings", () => {
  // afterEach(() => {
  //   // TODO: remove me once this is fixed. we shouldn't have to wait in between tests, but
  //   // there is a rogue loading issue beyond the scope of this story
  //   cy.wait(3000)
  // })

  describe("Rental Listing " + testListings.OPEN_RENTAL.id, () => {
    it("displays in English", () => {
      verifyListing(
        null,
        testListings.OPEN_RENTAL.id,
        ALT_PHOTO_TEXT.en,
        testListings.OPEN_RENTAL.title,
        null,
        APPLY_BUTTON_TEXT.en
      )
    })

    it("displays in Spanish", () => {
      verifyListing(
        "es",
        testListings.OPEN_RENTAL.id,
        ALT_PHOTO_TEXT.es,
        testListings.OPEN_RENTAL.title,
        null,
        APPLY_BUTTON_TEXT.es
      )
    })

    it("displays in Chinese", () => {
      verifyListing(
        "zh",
        testListings.OPEN_RENTAL.id,
        ALT_PHOTO_TEXT.zh,
        testListings.OPEN_RENTAL.title,
        "",
        APPLY_BUTTON_TEXT.zh
      )
    })

    it("displays in Filipino", () => {
      verifyListing(
        "tl",
        testListings.OPEN_RENTAL.id,
        ALT_PHOTO_TEXT.tl,
        testListings.OPEN_RENTAL.title,
        null,
        APPLY_BUTTON_TEXT.tl
      )
    })

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
      verifyMachineTranslations("tl", testListings.OPEN_RENTAL.id, [
        INFORMATION_SESSION_RENTAL_TEXT.tl,
        CREDIT_HISTORY_TEXT.tl,
      ])
    })

    it("machine translations works in Chinese", () => {
      verifyMachineTranslations("zh", testListings.OPEN_RENTAL.id, [
        INFORMATION_SESSION_RENTAL_TEXT.zh,
        CREDIT_HISTORY_TEXT.zh,
      ])
    })

    it("machine translations work in Spanish", () => {
      verifyMachineTranslations("es", testListings.OPEN_RENTAL.id, [
        INFORMATION_SESSION_RENTAL_TEXT.es,
        CREDIT_HISTORY_TEXT.es,
      ])
    })
  })

  describe("Sale Listing " + testListings.OPEN_SALE.id, () => {
    it("displays in English", () => {
      verifyListing(
        null,
        testListings.OPEN_SALE.id,
        ALT_PHOTO_TEXT.en,
        testListings.OPEN_SALE.title,
        testListings.OPEN_SALE.address,
        APPLY_BUTTON_TEXT.en
      )
    })

    it("displays in Spanish", () => {
      verifyListing(
        "es",
        testListings.OPEN_SALE.id,
        ALT_PHOTO_TEXT.es,
        testListings.OPEN_SALE.title,
        testListings.OPEN_SALE.address,
        APPLY_BUTTON_TEXT.es
      )
    })

    it("displays in Chinese", () => {
      verifyListing(
        "zh",
        testListings.OPEN_SALE.id,
        ALT_PHOTO_TEXT.zh,
        testListings.OPEN_SALE.title,
        testListings.OPEN_SALE.address,
        APPLY_BUTTON_TEXT.zh
      )
    })

    it("displays in Filipino", () => {
      verifyListing(
        "tl",
        testListings.OPEN_SALE.id,
        ALT_PHOTO_TEXT.tl,
        testListings.OPEN_SALE.title,
        testListings.OPEN_SALE.address,
        APPLY_BUTTON_TEXT.tl
      )
    })

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
      verifyMachineTranslations("tl", testListings.HABITAT_SALE.id, [
        INFORMATION_SESSION_SALE_TEXT.tl,
        PARKING_TEXT.tl,
      ])
    })

    it("machine translations works in Chinese", () => {
      verifyMachineTranslations("zh", testListings.HABITAT_SALE.id, [
        INFORMATION_SESSION_SALE_TEXT.zh,
        PARKING_TEXT.zh,
      ])
    })

    it("machine translations work in Spanish", () => {
      verifyMachineTranslations("es", testListings.HABITAT_SALE.id, [
        INFORMATION_SESSION_SALE_TEXT.es,
        PARKING_TEXT.es,
      ])
    })
  })
})
