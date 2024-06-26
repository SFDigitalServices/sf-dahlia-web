const ENGLISH_HOMEPAGE_TEXT = "Apply for affordable housing"
const SPANISH_HOMEPAGE_TEXT = "Presente una solicitud para una vivienda asequible"
const TAGALOG_HOMEPAGE_TEXT = "Mag-aplay para sa abot-kayang pabahay"
const CHINESE_HOMEPAGE_TEXT = "申請可負擔房屋"

describe("Homepage integration tests", () => {
  describe("default", () => {
    beforeEach(() => {
      cy.visit("/")
    })

    it("renders in English", () => {
      cy.contains(ENGLISH_HOMEPAGE_TEXT)
    })

    it("renders the page in react", () => {
      cy.get("#ng-app").should("not.exist")
    })
  })

  describe("with specified languages", () => {
    it("loads the homepage in English", () => {
      cy.visit("/en")
      cy.contains(ENGLISH_HOMEPAGE_TEXT)
    })

    it("loads the homepage in Spanish", () => {
      cy.visit("/es")
      cy.contains(SPANISH_HOMEPAGE_TEXT)
    })

    it("loads the homepage in Tagalog", () => {
      cy.visit("/tl")
      cy.contains(TAGALOG_HOMEPAGE_TEXT)
    })

    it("loads the homepage in Chinese", () => {
      cy.visit("/zh")
      cy.contains(CHINESE_HOMEPAGE_TEXT)
    })
  })

  describe("Toggling languages", () => {
    beforeEach(() => {
      cy.visit("/")
      cy.get(".language-nav").as("LanguageNav")
      cy.get("@LanguageNav").contains("li", "English").as("EnglishToggle")
      cy.get("@LanguageNav").contains("li", "Español").as("SpanishToggle")
      cy.get("@LanguageNav").contains("li", "中文").as("ChineseToggle")
      cy.get("@LanguageNav").contains("li", "Filipino").as("TagalogToggle")
    })

    it("should switch from English to English (no-op)", () => {
      cy.contains(ENGLISH_HOMEPAGE_TEXT)
      cy.get("@EnglishToggle").click()
      cy.contains(ENGLISH_HOMEPAGE_TEXT)
      cy.location("pathname").should("eq", "/")
    })

    it("should switch from English to Spanish", () => {
      cy.contains(ENGLISH_HOMEPAGE_TEXT)
      cy.get("@SpanishToggle").click()
      cy.contains(SPANISH_HOMEPAGE_TEXT)
      cy.location("pathname").should("eq", "/es")
    })

    it("should switch from English to Chinese", () => {
      cy.contains(ENGLISH_HOMEPAGE_TEXT)
      cy.get("@ChineseToggle").click()
      cy.contains(CHINESE_HOMEPAGE_TEXT)
      cy.location("pathname").should("eq", "/zh")
    })

    it("should switch from English to Tagalog", () => {
      cy.contains(ENGLISH_HOMEPAGE_TEXT)
      cy.get("@TagalogToggle").click()
      cy.contains(TAGALOG_HOMEPAGE_TEXT)
      cy.location("pathname").should("eq", "/tl")
    })

    it("should switch from English to Tagalog to Chinese", () => {
      cy.contains(ENGLISH_HOMEPAGE_TEXT)
      cy.get("@TagalogToggle").click()
      cy.contains(TAGALOG_HOMEPAGE_TEXT)
      cy.location("pathname").should("eq", "/tl")
      cy.get("@ChineseToggle").click()
      cy.contains(CHINESE_HOMEPAGE_TEXT)
      cy.location("pathname").should("eq", "/zh")
    })
  })

  describe("using the nav bar", () => {
    beforeEach(() => {
      cy.intercept("api/v1/listings.json**", { fixture: "listings.json" }).as("listings")
    })
    describe("navigating to the for-rent page", () => {
      it("navigates to the for-rent page in english by default", () => {
        cy.visit("/")
        cy.findAndClickMenuItem("/listings/for-rent")
        cy.wait("@listings")
        cy.location("pathname").should("eq", "/listings/for-rent")
      })

      it("navigates to the for-rent page in english when specified", () => {
        cy.visit("/en")
        cy.findAndClickMenuItem("/listings/for-rent")
        cy.wait("@listings")
        cy.location("pathname").should("eq", "/listings/for-rent")
      })

      it("navigates to the for-rent page in spanish", () => {
        cy.visit("/es")
        cy.findAndClickMenuItem("/listings/for-rent")
        cy.wait("@listings")
        cy.location("pathname").should("eq", "/es/listings/for-rent")
      })

      it("navigates to the for-rent page in Chinese", () => {
        cy.visit("/zh")
        cy.findAndClickMenuItem("/listings/for-rent")
        cy.wait("@listings")
        cy.location("pathname").should("eq", "/zh/listings/for-rent")
      })

      it("navigates to the for-rent page in Tagalog", () => {
        cy.visit("/tl")
        cy.findAndClickMenuItem("/listings/for-rent")
        cy.wait("@listings")
        cy.location("pathname").should("eq", "/tl/listings/for-rent")
      })
    })

    describe("navigating to the for-sale page", () => {
      beforeEach(() => {
        cy.intercept("api/v1/listings.json**", { fixture: "listings.json" }).as("listings")
      })
      it("navigates to the for-sale page in english by default", () => {
        cy.visit("/")
        cy.findAndClickMenuItem("/listings/for-sale")
        cy.wait("@listings")
        cy.location("pathname").should("eq", "/listings/for-sale")
      })

      it("navigates to the for-sale page in spanish", () => {
        cy.visit("/es")
        cy.findAndClickMenuItem("/listings/for-sale")
        cy.wait("@listings")
        cy.location("pathname").should("eq", "/es/listings/for-sale")
      })
    })

    describe("navigating to the favorites page", () => {
      beforeEach(() => {
        cy.intercept("api/v1/listings.json**", { fixture: "listings.json" }).as("listings")
      })
      it("navigates to the favorites page in english by default", () => {
        cy.visit("/")
        cy.findAndClickMenuItem("/favorites")
        cy.wait("@listings")
        cy.location("pathname").should("eq", "/favorites")
      })

      it("navigates to the favorites page in spanish", () => {
        cy.visit("/es")
        cy.findAndClickMenuItem("/favorites")
        cy.wait("@listings")
        cy.location("pathname").should("eq", "/es/favorites")
      })
    })

    describe("navigating to the get-assistance page", () => {
      it("navigates to the get-assistance page in english by default", () => {
        cy.visit("/")
        cy.findAndClickMenuItem("/get-assistance")
        cy.location("pathname").should("eq", "/get-assistance")
      })

      it("navigates to the get-assistance page in spanish", () => {
        cy.visit("/es")
        cy.findAndClickMenuItem("/get-assistance")
        cy.location("pathname").should("eq", "/es/get-assistance")
      })
    })
    describe("navigating to the sign-in page", () => {
      it("navigates to the sign-in page in english by default", () => {
        cy.visit("/")
        cy.findAndClickMenuItem("/sign-in")
        cy.location("pathname").should("eq", "/sign-in")
      })

      it("navigates to the sign-in page in spanish", () => {
        cy.visit("/es")
        cy.findAndClickMenuItem("/sign-in")
        cy.location("pathname").should("eq", "/es/sign-in")
      })
    })
  })
})
