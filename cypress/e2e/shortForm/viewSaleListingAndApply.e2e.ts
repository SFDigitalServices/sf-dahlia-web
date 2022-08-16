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

  it(
    "goes to the welcome page of the 'Test Sale Listing' application when clicking" +
      " apply button",
    () => {
      cy.findByRole("button", { name: "Apply Online" }).click()
      cy.contains("Let's get started on your application")
    }
  )

  it("starts the application in English when clicking the Begin button", () => {
    cy.findByRole("button", { name: "Begin" }).click()
    cy.contains("Here's what to expect for this application.")
  })

  it("goes to the prerequisites form of the application when clicking Next button", () => {
    cy.findByRole("button", { name: "Next" }).click()
    cy.contains("First, let’s make sure you’re eligible to apply.")
  })

  it("displays success confirmation when uploading verification letter", () => {
    cy.findByText("I have not owned residential property within the past 3 years.").click()
    cy.findByText("I have attended 10 hours of Homebuyer Education in the past year.").click()
    cy.findByLabelText("Homebuyer education agency").closest("select").select(1)
    cy.get(
      'input[id="ngf-Homebuyer education certificateFile"]'
    ).selectFile("cypress/fixtures/logo-city.png", { force: true })
    cy.contains("Verification Letter")
  })

  it("displays success confirmation when uploading pre-approval letter", () => {
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
  })

  it(
    "finishes the prerequisites form and goes to the Name page of the application" +
      " when clicking the Next button",
    () => {
      cy.findByRole("button", { name: "Next" }).click()
      cy.contains("What's your name?")
    }
  )

  it("goes to the contact form when successfully fills out the name form", () => {
    cy.get('input[placeholder="First Name"]').type("Uhtred")
    cy.get('input[placeholder="Last Name"]').type("Ragnarsson")

    cy.get('input[placeholder="MM"]').type("1")
    cy.get('input[placeholder="DD"]').type("1")
    cy.get('input[placeholder="YYYY"]').type("2000")

    cy.findByLabelText("I don't have an email address").click()
    cy.findByRole("button", { name: "Next" }).click()
    cy.contains("Thanks, Uhtred. Now we need to know how to contact you.")
  })

  it("goes to the address confirmation form when successfully fills out the contact form", () => {
    cy.findByLabelText("I don't have a telephone number").click()

    cy.get('input[placeholder="Street Address"]').type("123 Main Street")
    cy.get('input[placeholder="City Name"]').type("San Francisco")
    cy.findByLabelText("State").closest("select").select("California")
    cy.get('input[placeholder="Zipcode"]').type("94105")

    cy.findByLabelText("Do you work in San Francisco?").findByLabelText("No").click()

    cy.findByRole("button", { name: "Next" }).click()
    cy.contains("We have located the following address. Please confirm it's correct.")
  })

  it("goes to the alternate contact form when confirming address", () => {
    cy.findByText("123 MAIN ST").click()
    cy.findByRole("button", { name: "Next" }).click()
    cy.contains(
      "Is there someone else you'd like to authorize us to contact if we can't reach you?"
    )
  })
  it("goes to the household form when filling out alternate contact form", () => {
    cy.findByText("I don't have an alternate contact").click()
    cy.findByRole("button", { name: "Next" }).click()
  })

  it("goes to income form when selecting no alternate contact", () => {
    cy.findByRole("button", { name: "I will live alone" }).click()
    cy.contains("Let's move to income.")
  })

  it("goes to the preferences form when filling out income", () => {
    cy.get('input[placeholder="Total all of your income sources"]').type("25000")
    cy.findByText("per year").click()
    cy.findByRole("button", { name: "Next" }).click()
  })

  it("displays lottery ticket number when going through the rest of the views", () => {
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
