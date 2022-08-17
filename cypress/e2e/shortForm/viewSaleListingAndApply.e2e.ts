describe("Short Form Application - Sale Listing", () => {
  beforeEach(() => {
    /* Using iphone-x size https://docs.cypress.io/api/commands/viewport#Usage */
    cy.viewport(375, 812)
  })

  it("goes to the listing page", () => {
    cy.visit("/listings/a0W0P00000GlKfBUAV")
    cy.contains("TEST Sale Listing (do not modify) - Homeownership Acres")
    cy.contains("1 South Van Ness Ave, San Francisco CA, 94103")
  })

  it("goes to the prerequisites form when going through the welcome screens", () => {
    cy.url().should("include", "/listings/a0W0P00000GlKfBUAV")
    cy.findByRole("button", { name: "Apply Online" }).click()
    cy.contains("Let's get started on your application")

    cy.findByRole("button", { name: "Begin" }).click()
    cy.contains("Here's what to expect for this application.")

    cy.findByRole("button", { name: "Next" }).click()
    cy.contains("First, let’s make sure you’re eligible to apply.")
  })

  it("goes to the name form when completing the prerequisites form", () => {
    cy.url().should("include", "/apply/prerequisites")
    cy.findByText("I have not owned residential property within the past 3 years.").click()
    cy.findByText("I have attended 10 hours of Homebuyer Education in the past year.").click()
    cy.findByLabelText("Homebuyer education agency").closest("select").select(1)
    cy.get(
      'input[id="ngf-Homebuyer education certificateFile"]'
    ).selectFile("cypress/fixtures/logo-city.png", { force: true })
    cy.contains("Verification Letter")

    cy.findByText(
      "I am pre-approved for a mortgage loan by a MOHCD-Approved Loan" + " Officer."
    ).click()

    // We expect lending institutions and agents to be updated frequently, so we just select the first available option.
    cy.findByLabelText("lending institution").closest("select").select(1)
    cy.findByLabelText("Loan officer").closest("select").select(1)
    cy.get('input[id="ngf-Loan pre-approvalFile"]').selectFile("cypress/fixtures/logo-city.png", {
      force: true,
    })
    cy.contains("Pre-approval letter")

    cy.findByRole("button", { name: "Next" }).click()
    cy.contains("What's your name?")
  })

  it("goes to the contact form when completing the name form", () => {
    cy.url().should("include", "/apply/name")
    cy.get('input[placeholder="First Name"]').type("Uhtred")
    cy.get('input[placeholder="Last Name"]').type("Ragnarsson")

    cy.get('input[placeholder="MM"]').type("1")
    cy.get('input[placeholder="DD"]').type("1")
    cy.get('input[placeholder="YYYY"]').type("2000")

    cy.findByLabelText("I don't have an email address").click()
    cy.findByRole("button", { name: "Next" }).click()
    cy.contains("Thanks, Uhtred. Now we need to know how to contact you.")
  })

  it("goes to household form when completing the contact form", () => {
    cy.url().should("include", "/apply/contact")
    cy.findByLabelText("I don't have a telephone number").click()

    cy.get('input[placeholder="Street Address"]').type("123 Main Street")
    cy.get('input[placeholder="City Name"]').type("San Francisco")
    cy.findByLabelText("State").closest("select").select("California")
    cy.get('input[placeholder="Zipcode"]').type("94105")

    cy.findByLabelText("Do you work in San Francisco?").findByLabelText("No").click()

    cy.findByRole("button", { name: "Next" }).click()
    cy.contains("We have located the following address. Please confirm it's correct.")

    cy.findByText("123 MAIN ST").click()
    cy.findByRole("button", { name: "Next" }).click()
    cy.contains(
      "Is there someone else you'd like to authorize us to contact if we can't reach you?"
    )

    cy.findByText("I don't have an alternate contact").click()
    cy.findByRole("button", { name: "Next" }).click()

    cy.findByRole("button", { name: "I will live alone" }).click()
    cy.contains("Let's move to income.")
  })

  it("goes to the preferences form when completing the income form", () => {
    cy.url().should("include", "/apply/income")
    cy.get('input[placeholder="Total all of your income sources"]').type("25000")
    cy.findByText("per year").click()
    cy.findByRole("button", { name: "Next" }).click()
  })

  it("displays lottery number when completing short form application", () => {
    cy.url().should("include", "/apply/preferences-intro")
    cy.findByRole("button", { name: "Get started" }).click()

    cy.findByText("I don't want this lottery preference").click()
    cy.findByRole("button", { name: "Next" }).click()

    // skip preferences
    cy.findByRole("button", { name: "Next" }).click()

    // ack being in the general lottery
    cy.findByRole("button", { name: "Next" }).click()

    // skip demographics form
    cy.findByRole("button", { name: "Next" }).click()

    cy.findByRole("button", { name: "Confirm" }).click()

    cy.findByText("I agree and understand that I cannot change anything after I submit.").click()
    cy.findByRole("button", { name: "Submit" }).click()
    cy.contains("Here's your lottery ticket number")
  })
})
