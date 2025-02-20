import { userObjectGenerator } from "../../support/util"

const AUTH = {
  status: "success",
  data: {
    email: "test@test.com",
    provider: "email",
    uid: "test@test.com",
    id: 123,
    created_at: "2024-08-19T10:40:19.671-07:00",
    updated_at: "2024-09-11T12:12:57.160-07:00",
    salesforce_contact_id: "000000000000000000",
    temp_session_id: null,
    allow_password_change: false,
  },
}

describe("Account Settings", () => {
  it("runs through the account settings page", () => {
    cy.signIn()
    cy.addReactQueryParam()

    cy.get('a[href="/account-settings?react=true"]').click()
    cy.contains("We use this information to help you fill in your application.")

    // Submit a name change
    cy.get('input[name="firstName"]').clear().type("Jane")
    cy.get('input[name="lastName"]').clear().type("Smith")
    cy.contains("We will update any applications you have not submitted yet.")
    cy.intercept(
      "/api/v1/account/update",
      userObjectGenerator({ firstName: "Jane", lastName: "Smith" })
    ).as("updateName")
    cy.get('button[type="submit"]').contains("Update").first().click()
    cy.wait("@updateName").its("response.statusCode").should("eq", 200)
    // cy.contains("Your changes have been saved.")

    // Create first name error
    cy.get('input[name="firstName"]').clear()
    cy.get('input[name="lastName"]').click()

    cy.get("#firstName-error").should("contain.text", "Enter first name").and("be.visible")
    cy.get('input[name="firstName"]').should("not.be.focused")
    cy.get("button").contains("Enter first name").first().click()
    cy.get('input[name="firstName"]').should("be.focused")
    cy.get('input[name="firstName"]').type("Jane")

    // Submit DOB change
    cy.get("input#dobObject\\.birthMonth").clear().type("10")
    cy.get("input#dobObject\\.birthDay").clear().type("12")
    cy.get("input#dobObject\\.birthYear").clear().type("2000")
    cy.intercept(
      "/api/v1/account/update",
      userObjectGenerator({ firstName: "Jane", lastName: "Smith", DOB: "2000-12-10" })
    ).as("updateDOB")
    cy.get('button[type="submit"]').eq(1).contains("Update").click()
    cy.wait("@updateDOB").its("response.statusCode").should("eq", 200)

    // Create DOB error
    cy.get("input#dobObject\\.birthYear").clear().type("1899")
    cy.get("input#dobObject\\.birthMonth").click()
    cy.get("input#dobObject\\.birthYear").should("not.be.focused")
    cy.contains("Enter a valid date of birth. Enter date like: MM DD YYYY")
    cy.get("button").contains("Enter a valid date of birth").click()
    cy.get("input#dobObject\\.birthYear").should("be.focused")
    cy.get("input#dobObject\\.birthYear").clear().type("2000")

    // Submit email change while validating
    cy.get('input[name="email"]').clear()
    cy.get("input#dobObject\\.birthMonth").click()
    cy.get('input[name="email"]').click()
    cy.contains("Enter email address like: example@web.com")
    cy.get("button").contains("Enter email address").click().type("t")
    cy.contains("Email missing @ symbol. Enter email like: example@web.com")
    cy.get("button").contains("Email missing @ symbol").click().type("est@")
    cy.contains("Email entered incorrectly. Enter email like: example@web.com")
    cy.get("button").contains("Email entered incorrectly").click().type("test")
    cy.contains("Email missing a dot ‘.’ in the domain. Enter email like: example@web.com")
    cy.get("button").contains("Email missing a dot ‘.’ in the domain").click().type(".com")

    cy.intercept("/api/v1/auth", AUTH).as("emailChange")
    cy.get('button[type="submit"]').eq(2).contains("Update").click()
    cy.contains(
      "We sent you an email. Check your email and follow the link to finish changing your information."
    )
    cy.wait("@emailChange").its("response.statusCode").should("eq", 200)

    // Submit password change
    cy.get('input[name="currentPassword"]').click()
    cy.get('input[name="password"]').click()
    cy.get("button").contains("Enter current password").click().type("password")
    cy.get('input[name="password"]').click()
    cy.get('input[name="currentPassword"]').click()
    cy.get("button").contains("Enter new password").click().type("password")
    cy.contains("Choose a strong password with at least 8 characters, 1 letter, and 1 number")
    cy.get("button").contains("Choose a strong password").click().type("1")
    cy.intercept("/api/v1/auth/password", {
      message: "Your password has been successfully updated.",
      ...AUTH,
    }).as("passwordChange")
    cy.get('button[type="submit"]').eq(3).contains("Update").click()
    cy.wait("@passwordChange").its("response.statusCode").should("eq", 200)
    // cy.contains("Your changes have been saved.")
  })
})
