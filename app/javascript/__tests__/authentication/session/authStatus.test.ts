import {
  bearerToken,
  deriveClerkStatus,
  isAuthInitialized,
  INITIALIZING,
  NO_CREDENTIALS,
  SIGNED_IN,
  SIGNED_OUT,
} from "../../../authentication/session/authStatus"

describe("deriveClerkStatus", () => {
  it("is initializing until Clerk has booted", () => {
    expect(deriveClerkStatus({ isLoaded: false, isSignedIn: false })).toBe(INITIALIZING)
    expect(deriveClerkStatus({ isLoaded: false, isSignedIn: true })).toBe(INITIALIZING)
  })

  it("returns the same reference for the same answer, so effects do not loop", () => {
    expect(deriveClerkStatus({ isLoaded: true, isSignedIn: true })).toBe(
      deriveClerkStatus({ isLoaded: true, isSignedIn: true })
    )
  })

  it("takes Clerk's answer once it has booted", () => {
    expect(deriveClerkStatus({ isLoaded: true, isSignedIn: true })).toBe(SIGNED_IN)
    expect(deriveClerkStatus({ isLoaded: true, isSignedIn: false })).toBe(SIGNED_OUT)
  })

  it("does not wait on the DAHLIA profile", () => {
    // e.g. a signed-in user on their way to add-profile.
    expect(deriveClerkStatus({ isLoaded: true, isSignedIn: true })).toBe(SIGNED_IN)
  })
})

describe("isAuthInitialized", () => {
  it("is false only while initializing", () => {
    expect(isAuthInitialized(INITIALIZING)).toBe(false)
    expect(isAuthInitialized(SIGNED_OUT)).toBe(true)
    expect(isAuthInitialized(SIGNED_IN)).toBe(true)
  })
})

describe("bearerToken", () => {
  it("unwraps a token-bearing credential", () => {
    expect(bearerToken({ kind: "bearerToken", token: "abc" })).toBe("abc")
  })

  it("is undefined when there is no usable session", () => {
    expect(bearerToken(NO_CREDENTIALS)).toBeUndefined()
  })
})
