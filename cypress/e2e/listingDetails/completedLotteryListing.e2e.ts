import { RouteHandler } from "cypress/types/net-stubbing"

const listingId = "fake-listing-id"
const lotteryNumber = "123456"

const MOBILE_VIEWPORT_HEIGHT = 680
const MOBILE_VIEWPORT_WIDTH = 420

let listingDetailsFixture: RouteHandler
let amiFixture: RouteHandler
let unitsFixture: RouteHandler
let preferencesFixture: RouteHandler
let lotteryRankingFixture: RouteHandler

const visitListing = (mobile, language) => {
  const langPart = language ? `/${language}` : ""
  if (mobile) {
    cy.viewport(MOBILE_VIEWPORT_WIDTH, MOBILE_VIEWPORT_HEIGHT)
  }

  cy.intercept("GET", `/api/v1/listings/${listingId}.json`, listingDetailsFixture).as(
    "listingDetails"
  )
  cy.intercept("GET", "ami.json**", amiFixture).as("ami")
  cy.intercept("GET", "units", unitsFixture).as("units")
  cy.intercept("GET", "preferences", preferencesFixture).as("preferences")
  cy.intercept("GET", "lottery_ranking**", lotteryRankingFixture).as("lotteryRanking")

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
  beforeEach(() => {
    cy.fixture("listingDetails.json").then((listingDetails) => {
      listingDetailsFixture = listingDetails
    })
    cy.fixture("ami.json").then((ami) => {
      amiFixture = ami
    })
    cy.fixture("units.json").then((unitsJson) => {
      unitsFixture = unitsJson
    })
    cy.fixture("preferences.json").then((preferencesJson) => {
      preferencesFixture = preferencesJson
    })
    cy.fixture("lotteryRanking.json").then((lotteryRanking) => {
      lotteryRankingFixture = lotteryRanking
    })
  })

  describe("Completed Lottery Rental Listing", () => {
    it("clicking the View Lottery Results button opens the lottery results modal on mobile devices", () => {
      visitListing(true, "")
      clickLotteryResultsButton(true)
      cy.contains("Lottery results are divided into multiple lists.")
    })

    it("searching for a lottery number returns results on mobile devices", () => {
      visitListing(true, "")
      cy.wait("@listingDetails")
      cy.wait("@units")
      cy.wait("@ami")
      cy.wait("@preferences")
      clickLotteryResultsButton(true)
      searchForLotteryResults()
      cy.contains("Your preference ranking")
    })

    it("renders on desktop devices", () => {
      visitListing(false, "")
      cy.wait("@listingDetails")
      cy.wait("@units")
      cy.wait("@ami")
      cy.wait("@preferences")
      cy.contains("View Lottery Results")
    })

    it("clicking the View Lottery Results button opens the lottery results modal on desktop devices", () => {
      visitListing(false, "")
      cy.wait("@listingDetails")
      cy.wait("@units")
      cy.wait("@ami")
      cy.wait("@preferences")
      clickLotteryResultsButton(false)
      cy.contains("Lottery results are divided into multiple lists.")
    })

    it("searching for a lottery number returns results on desktop devices", () => {
      visitListing(false, "")
      cy.wait("@listingDetails")
      cy.wait("@units")
      cy.wait("@ami")
      cy.wait("@preferences")
      clickLotteryResultsButton(false)
      searchForLotteryResults()
      cy.contains("Your preference ranking")
    })
  })
})
