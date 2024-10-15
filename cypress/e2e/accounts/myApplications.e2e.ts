describe("My Applications", () => {
  beforeEach(() => {
    cy.intercept("/api/v1/short-form/listing-application/a0W0P00000Hc7RcUAJ?autofill=true", {
      fixture: "draftApplication.json",
    })
    cy.intercept("/api/v1/listings/a0W0P00000Hc7RcUAJ/preferences", {
      fixtures: "preferences.json",
    })

    cy.intercept(`/api/v1/listings/a0W0P00000Hc7RcUAJ.json`, { fixture: "completedReRental.json" })
    cy.intercept("/api/v1/listings/a0W4U00000IhGZcUAN/lottery_buckets", {
      fixture: "lotteryRanking.json",
    })

    cy.window().then((win) => {
      win.ACCOUNT_INFORMATION_PAGES_REACT = true
    })
  })

  it("runs through the my applications page", () => {
    cy.task("log", "Sign in and go to the my applications page")
    cy.signIn()
    cy.addReactQueryParam()

    cy.task("log", "Go to the My Applications page")
    cy.intercept("/api/v1/account/my-applications", { applications: [] })
    cy.get('a[href="/my-applications?react=true"]').click()

    // There should be no applications right now
    cy.contains("It looks like you haven't applied to any listings yet.")

    cy.task("log", "Go to the rental listings page")
    // Go to the rental listings page
    cy.get('a[href="/listings/for-rent"]').eq(1).click()
    cy.url().should("include", "/listings/for-rent")
    cy.contains("Rent affordable housing")
    cy.visit("/my-applications?react=true")

    cy.task("log", "Go to the sales listings page")
    // GO to the sales listings page
    cy.get('a[href="/listings/for-sale"]').eq(1).click()
    cy.url().should("include", "/listings/for-sale")
    cy.contains("Buy affordable housing")

    cy.task("log", "Continue an application")
    // Try to continue an application
    cy.intercept("/api/v1/account/my-applications", { fixture: "applications.json" })
    cy.visit("/my-applications?react=true")
    cy.get('a[href="/listings/a0W0P00000Hc7RcUAJ/apply/name"]').click()
    cy.contains("TEST Dahlia Commons Application")
    cy.task("log", "navigate back to my applications")
    cy.visit("/my-applications?react=true")

    cy.task("log", "Ensure correct number of application items")
    // Ensure correct formatting
    cy.get('[data-testid="application-item"]').its("length").should("equal", 6)
    cy.contains("Rental units")
    cy.contains("Sale units")

    // Try to delete an application
    cy.task("log", "Delete an application")
    cy.contains("TEST Dahlia Commons")
    cy.intercept("DELETE", "/api/v1/short-form/application/a0o6s000001dN5TAAU", {})
    cy.get("button").contains("Delete").click()
    cy.get("footer").find("button.is-alert").contains("Delete").click()
    cy.contains("TEST Dahlia Commons").should("not.exist")
    cy.get('[data-testid="application-item"]').its("length").should("equal", 5)

    // Verify various layout details
    cy.task("log", "Verify various layout details")
    cy.get(".application-item")
      .first()
      .within(() => {
        cy.contains("Application deadline: Sep 1, 2024")
        cy.get(".application-item__status").should("contain.text", "Status: Submitted")
        cy.contains("Your lottery number is #01543743")
      })

    // Verify various layout details and click to view the lottery results
    cy.task("log", "Verify various layout details and click to view the lottery results")
    cy.intercept("/api/v1/listings/a0W4U00000IhGZcUAN/lottery_ranking?lottery_number=01517927", {
      fixture: "lotteryRanking.json",
    })
    cy.get(".application-item")
      .eq(3)
      .within(() => {
        cy.contains("Application deadline: Dec 15, 2022")
        cy.get(".application-item__status").should("contain.text", "Status: Results posted")
        cy.get("button").contains("#01517927").click()
      })

    cy.task("log", "Verify lottery results page")
    cy.contains("Lottery Results")
    cy.contains("Your preference ranking")
    cy.get("input#lotterySearchNumber").should("have.value", "01517927")
  })
})
