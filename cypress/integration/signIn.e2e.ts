// I didn't choose the title of the page ("Sign In") because that is
// also used in the navbar. "Don't have an account?" felt more unique
// to sign in.
const ENGLISH_SIGN_IN_TEXT = "Don't have an account?"

describe("Sign In integration tests", () => {
  beforeEach(() => {
    cy.visit("/sign-in")
  })

  it("renders in English", () => {
    cy.contains(ENGLISH_SIGN_IN_TEXT)
  })
})
