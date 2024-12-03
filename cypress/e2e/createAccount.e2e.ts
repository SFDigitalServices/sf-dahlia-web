const setBirthYearAndVerifyError = (year: number, buttonText?: string) => {
  cy.get('input[name="dobObject.birthYear"]').should("be.focused").clear().type(`${year}`)
  buttonText && cy.contains("button", buttonText).click()
}

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

    cy.intercept("POST", "/api/v1/auth/confirmation", {
      statusCode: 200,
      body: {
        success: true,
      },
    }).as("confirmation")

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

    cy.contains(/send email again/i).click()

    cy.wait("@confirmation")
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

    cy.get('input[name="dobObject.birthMonth"]').clear().type("01")
    cy.get('input[name="dobObject.birthDay"]').clear().type("01")
    cy.get('input[name="dobObject.birthYear"]').clear().type("1800")
    cy.contains("button", "Enter a valid date of birth").click()
    const currentYear = new Date().getFullYear()
    setBirthYearAndVerifyError(currentYear - 1, "You must be 18 or older")
    setBirthYearAndVerifyError(currentYear + 2, "Enter a valid date of birth")
    setBirthYearAndVerifyError(currentYear - 19)

    cy.get('input[name="password"]').clear().type("password")
    cy.contains("button", "Choose a strong password").click()
    cy.get('input[name="password"]').should("be.focused").clear().type("password123")

    cy.get('input[name="firstName"]').clear().type("John")
    cy.get('input[name="lastName"]').clear().type("Doe")

    cy.intercept("POST", "/api/v1/auth", (req) => {
      console.log(req.body)
      req.reply({
        statusCode: 422,
        body: {
          status: "error",
          data: {
            id: "123",
            email: req.body.contact.email,
            firstName: req.body.contact.firstName,
            lastName: req.body.contact.lastName,
          },
          errors: {
            email: ["has already been taken", "has already been taken"],
            full_messages: ["Email has already been taken", "Email has already been taken"],
          },
        },
      })
    }).as("createAccountError")

    cy.get('button[type="submit"]').click()

    cy.wait("@createAccountError")

    cy.contains("button", "Email is already in use").click()
    cy.get('input[name="email"]').should("be.focused")
    cy.contains("a", "sign in to your account").should("have.attr", "href", "/sign-in")
  })
})
