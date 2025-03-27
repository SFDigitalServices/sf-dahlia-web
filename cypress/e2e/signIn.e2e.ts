import { userObjectGenerator, generateHeaders } from "../support/util"

describe("Sign In integration tests", () => {
  beforeEach(() => {
    cy.visit("/sign-in")
  })

  it("renders in English", () => {
    cy.contains("Sign in")
    cy.contains("Create an account")
    cy.contains("Fill in applications faster")
  })

  it("should show validation errors when form is submitted empty", () => {
    cy.get('button[type="submit"]').click()

    cy.contains("Email or password is incorrect.").should("be.visible")
    cy.get('a[href="/forgot-password"]').should("be.visible")
  })

  it("should navigate to create account page", () => {
    cy.get('a[href="/create-account"]').click()
    cy.url().should("include", "/create-account")
  })

  it("should show error on failed sign in", () => {
    cy.intercept("POST", "/api/v1/auth/sign_in", {
      statusCode: 401,
      body: {
        success: false,
        error: "bad_credentials",
        email: "user@example.com",
        errors: ["Invalid login credentials. Please try again."],
      },
    }).as("signInFailed")

    cy.get('input[name="email"]').type("user@example.com")
    cy.get('input[name="password"]').type("wrongpassword") // This password does not pass front end validation checks
    cy.get('button[type="submit"]').click()

    cy.wait(1000)

    cy.contains("Email or password is incorrect.").should("be.visible")
    cy.get("@signInFailed.all").should("have.length", 0)
    cy.get('[aria-label="Close"]').first().click()
    cy.contains("Email or password is incorrect.").should("not.exist")

    cy.get('input[name="email"]').clear().type("user@example.com")
    cy.get('input[name="password"]').clear().type("wrongpassword1")
    cy.get('button[type="submit"]').click()

    cy.wait("@signInFailed")
    cy.contains("Email or password is incorrect.").should("be.visible")
  })

  it("should successfully sign in and navigate to the my account page", () => {
    cy.intercept("POST", "/api/v1/auth/sign_in", (req) => {
      req.reply({
        statusCode: 201,
        body: {
          data: {
            id: "123",
            email: "user@example.com",
            firstName: "John",
            lastName: "Doe",
          },
        },
        headers: generateHeaders("user@example.com"),
      })
    }).as("signIn")
    cy.intercept("/api/v1/auth/validate_token", userObjectGenerator({ email: "user@example.com" }))

    cy.get('input[name="email"]').type("user@example.com")
    cy.get('input[name="password"]').type("correctpassword1")
    cy.get('button[type="submit"]').click()

    cy.wait("@signIn")
    cy.url().should("include", "/my-account")
  })

  it("should successfully sign in and redirect to given page", () => {
    cy.visit("/sign-in?redirect=applications")
    cy.url().should("include", "redirect=applications")
    cy.intercept("POST", "/api/v1/auth/sign_in", (req) => {
      req.reply({
        statusCode: 201,
        body: {
          data: {
            id: "123",
            email: "user@example.com",
            firstName: "John",
            lastName: "Doe",
          },
        },
        headers: generateHeaders("user@example.com"),
      })
    }).as("signIn")
    cy.intercept("/api/v1/auth/validate_token", userObjectGenerator({ email: "user@example.com" }))
    cy.intercept("/api/v1/account/my-applications", { fixture: "applications.json" })

    cy.contains("You must be signed in to see this page. Sign in to continue.").should("be.visible")

    cy.get('input[name="email"]').type("user@example.com")
    cy.get('input[name="password"]').type("correctpassword1")
    cy.get('button[type="submit"]').click()

    cy.wait("@signIn")
    cy.wait(1000)
    cy.url().should("include", "/my-applications")
  })

  it("should navigate to forgot password page with email prefilled", () => {
    cy.get('input[name="email"]').type("user@example.com")
    cy.contains("a", "Forgot password?").click()
    cy.url().should("include", "/forgot-password?email=user@example.com")
  })

  it("should show the correct banners", () => {
    cy.visit("/sign-in?alert=sign-out")
    cy.contains("You are signed out.").should("be.visible")

    cy.visit("/sign-in?alert=time-out")
    cy.contains(
      "You were inactive for more than 30 minutes, so we signed you out. We do this for your security. Sign in again to continue."
    ).should("be.visible")

    cy.visit("/sign-in?alert=connection-issue")
    cy.contains(
      "There was a connection issue, so we signed you out. We do this for your security. Sign in again to continue."
    ).should("be.visible")

    cy.visit("/sign-in?alert=login-required")
    cy.contains("You must be signed in to see this page. Sign in to continue.").should("be.visible")
  })

  it("should show the correct modals", () => {
    cy.intercept("POST", "/api/v1/auth/confirmation", {
      statusCode: 200,
      body: { success: true },
    }).as("confirmation")
    cy.visit("/sign-in?expiredUnconfirmed=user@test.com")

    cy.get('[role="dialog"]').within(() => {
      cy.contains("Confirmation link expired").should("be.visible")
      cy.contains("button", "Send a new link").click()
      cy.wait("@confirmation")
      cy.contains("Email sent. Check your email.")
      cy.get('[aria-label="Close"]').first().click()
    })

    cy.visit("/sign-in?expiredConfirmed=user@test.com")

    cy.get('[role="dialog"]').within(() => {
      cy.contains("button", "OK").should("be.visible")
      cy.contains("Account already confirmed").should("be.visible")
      cy.get('[aria-label="Close"]').click()
    })
  })
})
