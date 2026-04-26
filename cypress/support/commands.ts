import "@testing-library/cypress/add-commands"
import { userObjectGenerator } from "./util"
import { LISTING_IDS } from "./helpers/testData"

// Any commands added here must also have a type definition added to cypress/support/index.d.ts

Cypress.Commands.add("findAndClickMenuItem", (href: string) => {
  cy.findByRole("navigation", { name: "main navigation" }).find(`a[href*="${href}"]`).click()
})

Cypress.Commands.add("signIn", (email: string = "test@test.com") => {
  cy.intercept("/api/v1/auth/sign_in", userObjectGenerator({ email }))
  cy.intercept("/api/v1/auth/validate_token", userObjectGenerator({ email }))

  cy.visit("/sign-in?react=true")
  cy.contains("Sign in")
  cy.get("input[name=email]").type("test@test.com")
  cy.get("input[name=password]").type("password123")
  cy.get("button[type=submit]").click()
})

Cypress.Commands.add("addReactQueryParam", () => {
  cy.url().then((url) => {
    // eslint-disable-next-line unicorn/prefer-includes
    const newUrl = url.indexOf("?") !== -1 ? `${url}&react=true` : `${url}?react=true`
    cy.visit(newUrl)
  })
})

Cypress.Commands.addQuery("isInViewport", () => {
  return (subject) => {
    const { top, left } = subject[0].getBoundingClientRect()
    expect(top).to.be.at.least(0)
    expect(left).to.be.at.least(0)
  }
})

Cypress.Commands.add("uploadFile", (inputSelector: string, filePath: string) => {
  cy.get(inputSelector).selectFile(filePath, { force: true })
})

Cypress.Commands.add("signInOnWelcomeBack", (email: string, password: string) => {
  cy.get("#sign-in").click()
  cy.get('input[name="email"]').should("be.visible").clear().type(email)
  cy.get('input[name="password"]').clear().type(password)
  cy.get('button[type="submit"]').click()
})

Cypress.Commands.add(
  "createAccountFromConfirmation",
  (data: { email: string; password: string; fullName: string; birthDate: string }) => {
    cy.get("#create-account").scrollIntoView().click()
    // Angular create-account form — verify pre-filled name from the application
    cy.get("#firstName").should(($el) => {
      expect(data.fullName).to.include($el.val() as string)
    })
    // Fill email (twice — email + confirmation)
    cy.get("#auth_email").clear().type(data.email)
    cy.get("#auth_email_confirmation").clear().type(data.email)
    cy.get("#auth_password").clear().type(data.password)
    cy.get("#auth_password_confirmation").clear().type(data.password)
    cy.get("#submit").click()
  }
)

Cypress.Commands.add("goToApplication", (listingType: string) => {
  const urls: Record<string, string> = {
    test: `/listings/${LISTING_IDS.test}/apply/name`,
    senior: `/listings/${LISTING_IDS.senior}/apply-welcome/community-screening`,
    sale: `/listings/${LISTING_IDS.sale}/apply-welcome/overview`,
    customEducator1: `/listings/${LISTING_IDS.customEducator1}/apply-welcome/custom-educator-screening`,
    customEducator2: `/listings/${LISTING_IDS.customEducator2}/apply-welcome/custom-educator-screening`,
  }
  const url = urls[listingType]
  if (!url) {
    throw new Error(
      `Unknown listing type "${listingType}" passed to goToApplication. Supported listing types: ${Object.keys(urls).join(", ")}`
    )
  }
  cy.visit(url)
})

Cypress.Commands.add("confirmAccountByEmail", (email: string) => {
  cy.request(`/api/v1/account/confirm/?email=${encodeURIComponent(email)}`)
})
