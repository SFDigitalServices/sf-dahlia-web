const listings = {
  COMPLETED_LOTTERY: {
    id: "a0W8H000000AmpKUAS",
  },
}

const MOBILE_VIEWPORT_HEIGHT = 680
const MOBILE_VIEWPORT_WIDTH = 420

const visitListing = (mobile, language) => {
  const langPart = language ? `/${language}` : ""
  if (mobile) {
    cy.viewport(MOBILE_VIEWPORT_WIDTH, MOBILE_VIEWPORT_HEIGHT)
  }
  cy.visit(`${langPart}/listings/${listings.COMPLETED_LOTTERY.id}?react=true`)
}

const clickLotteryResultsButton = (mobile: boolean) => {
  if (mobile) {
    cy.get("h2").contains("Lottery").click()
  }
  cy.get("button").contains("View Lottery Results").click()
}

const searchForLotteryResults = () => {
  cy.get('input[placeholder="Enter Your Lottery Number"]').type("01100972")
  cy.get("form").submit()
}

const LOTTERY_BUTTON_TEXT = {
  en: "View Lottery Results",
  tl: "Ipakita ang mga Resulta ng Lottery",
  zh: "查看抽籤結果",
  es: "Ver los Resultados del Sorteo",
}

describe("Listing Details for Completed Lottery Listing", () => {
  afterEach(() => {
    // TODO: remove me once this is fixed. we shouldn't have to wait in between tests, but
    // there is a rogue loading issue beyond the scope of this story
    cy.wait(3000)
  })

  describe("Completed Lottery Rental Listing " + listings.COMPLETED_LOTTERY.id, () => {
    it("clicking the View Lottery Results button opens the lottery results button on mobile devices", () => {
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
      cy.visit(`listings/${listings.COMPLETED_LOTTERY.id}?react=true`)
      cy.contains(LOTTERY_BUTTON_TEXT.en)
    })

    it("clicking the View Lottery Results button opens the lottery results button on desktop devices", () => {
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
