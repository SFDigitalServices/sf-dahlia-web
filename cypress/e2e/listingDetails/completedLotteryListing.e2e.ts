const listingId = "fake-listing-id"
const lotteryNumber = "123456"

const MOBILE_VIEWPORT_HEIGHT = 680
const MOBILE_VIEWPORT_WIDTH = 420

const visitListing = (mobile, language) => {
  cy.task("log", "This will be output to the terminal")

  const langPart = language ? `/${language}` : ""
  if (mobile) {
    cy.viewport(MOBILE_VIEWPORT_WIDTH, MOBILE_VIEWPORT_HEIGHT)
  }

  cy.fixture("listingDetails.json").then((listingDetails) => {
    cy.intercept("GET", `/api/v1/listings/${listingId}.json`, listingDetails)
  })
  cy.fixture("listing.html").then((listingHtml) => {
    cy.task("log", listingHtml)
    cy.intercept("GET", `/listings/${listingId}?react=true`, listingHtml)
  })
  cy.fixture("ami.json").then((amiJson) => {
    cy.intercept("GET", "ami.json**", amiJson)
  })
  cy.fixture("units.json").then((unitsJson) => {
    cy.intercept("GET", "units", unitsJson)
  })
  cy.fixture("preferences.json").then((preferencesJson) => {
    cy.intercept("GET", "preferences", preferencesJson)
  })
  cy.fixture("lotteryRanking.json").then((lotteryRanking) => {
    cy.intercept("GET", `lottery_ranking?lottery_number=${lotteryNumber}`, lotteryRanking)
  })

  cy.visit(`${langPart}/listings/${listingId}?react=true`)
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
