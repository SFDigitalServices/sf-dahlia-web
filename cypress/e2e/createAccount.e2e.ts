describe("Create Account Page", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/v1/auth", (req) => {
      console.log(req.body)
      req.reply({
        statusCode: 201,
        body: {
          data: {
            id: "123",
            email: req.body.contact.email,
            firstName: req.body.contact.firstName,
            lastName: req.body.contact.lastName,
          },
        },
      })
    }).as("createAccount")

    cy.visit("/create-account")
  })

  it("should fill out the form and create an account successfully", () => {
    cy.get('input[name="firstName"]').clear().type("John")
    cy.get('input[name="lastName"]').clear().type("Doe")
    cy.get('input[name="dobObject.birthMonth"]').clear().type("01")
    cy.get('input[name="dobObject.birthDay"]').clear().type("01")
    cy.get('input[name="dobObject.birthYear"]').clear().type("2000")
    cy.get('input[name="email"]').clear().type("john.doe@example.com")
    cy.get('input[name="password"]').clear().type("password123")

    cy.get('button[type="submit"]').click()

    cy.wait("@createAccount")

    cy.url().should("include", "/sign-in")
    cy.contains("Check your email to finish creating your account").should("be.visible")
  })

  it("should show validation errors if form is incomplete or wrong", () => {
    cy.get('button[type="submit"]').click()

    cy.contains("Enter first name").should("be.visible")
    cy.contains("Enter last name").should("be.visible")
    cy.contains("Enter date of birth").should("be.visible")
    cy.contains("Enter email address").should("be.visible")
    cy.contains("Enter new password").should("be.visible")

    cy.get('input[name="email"]').clear().type("john.doeexample.com")
    cy.contains("Email missing @ symbol. Enter email like: example@web.com").should("be.visible")
    cy.contains("button", "Email missing @ symbol").click()

    cy.get('input[name="email"]').should("be.focused").clear().type("john.doe@example.com")
    cy.contains("Email missing @ symbol. Enter email like: example@web.com").should("not.exist")
  })
})
