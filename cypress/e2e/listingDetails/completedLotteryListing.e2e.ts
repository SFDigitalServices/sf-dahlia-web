const listingId: string = Cypress.env("completedLotteryListingId") || "a0W4U00000IhGZcUAN"
const lotteryNumber: string = Cypress.env("lotteryNumber") || "01150047"

const MOBILE_VIEWPORT_HEIGHT = 680
const MOBILE_VIEWPORT_WIDTH = 420

const visitListing = (mobile, language) => {
  const langPart = language ? `/${language}` : ""
  if (mobile) {
    cy.viewport(MOBILE_VIEWPORT_WIDTH, MOBILE_VIEWPORT_HEIGHT)
  }

  cy.visit(`${langPart}/listings/${listingId}?react=true`)
  if (Cypress.env("salesforceInstanceUrl") === "https://sfhousing.my.salesforce.com") {
    cy.wait("@completedRentalListing")
    cy.wait("@units")
    cy.wait("@ami")
    cy.wait("@preferences")
  }
}

const clickLotteryResultsButton = (mobile: boolean) => {
  if (mobile) {
    cy.contains("Lottery selection, important dates and contact").click()
  }
  cy.contains("View Lottery Results").click()
}

const searchForLotteryResults = () => {
  cy.get('input[placeholder="Enter Your Lottery Number"]').type(lotteryNumber)
  cy.get('[aria-label="Submit number"]').click()
}

describe("Listing Details for Completed Lottery Listing", () => {
  // afterEach(() => {
  //   // TODO: remove me once this is fixed. we shouldn't have to wait in between tests, but
  //   // there is a rogue loading issue beyond the scope of this story
  //   cy.wait(6000)
  // })
  beforeEach(() => {
    if (Cypress.env("salesforceInstanceUrl") === "https://sfhousing.my.salesforce.com") {
      cy.intercept(`/api/v1/listings/${listingId}.json`, {
        fixture: "completedRentalListing.json",
      }).as("completedRentalListing")
      cy.intercept("lottery_buckets", { fixture: "lotteryRanking.json" }).as("lotteryBuckets")
      cy.intercept("ami.json**", { fixture: "ami.json" }).as("ami")
      cy.intercept("units", { fixture: "units.json" }).as("units")
      cy.intercept("preferences", { fixture: "preferences.json" }).as("preferences")
      cy.intercept("lottery_ranking**", { fixture: "lotteryRanking.json" }).as("lotteryRanking")
    }
  })
  describe("Completed Lottery Rental Listing", () => {
    it("clicking the View Lottery Results button opens the lottery results modal on mobile devices", () => {
      visitListing(true, "")
      clickLotteryResultsButton(true)
      cy.contains("Lottery results are divided into multiple lists.")
    })

    it("searching for a lottery number returns results on mobile devices", () => {
      visitListing(true, "")
      clickLotteryResultsButton(true)
      searchForLotteryResults()
      cy.contains("Your preference ranking")
    })

    it("renders on desktop devices", () => {
      visitListing(false, "")
      cy.contains("View Lottery Results")
    })

    it("clicking the View Lottery Results button opens the lottery results modal on desktop devices", () => {
      visitListing(false, "")
      clickLotteryResultsButton(false)
      cy.contains("Lottery results are divided into multiple lists.")
    })

    it("searching for a lottery number returns results on desktop devices", () => {
      visitListing(false, "")
      clickLotteryResultsButton(false)
      searchForLotteryResults()
      cy.contains("Your preference ranking")
    })
  })
})
