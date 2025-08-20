/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { render } from "@testing-library/react"
import { mockWindowLocation, restoreWindowLocation } from "../__util__/renderUtils"
import { withAuthentication } from "../../authentication/withAuthentication"
import UserContext, { ContextProps } from "../../authentication/context/UserContext"
import { isTokenValid, parseUrlParams } from "../../authentication/token"
import { getLocalizedPath, RedirectType } from "../../util/routeUtil"
import { getCurrentLanguage } from "../../util/languageUtil"
import TagManager from "react-gtm-module"

// Mock the useGTMDataLayer hook
jest.mock("react-gtm-module", () => ({
  initialize: jest.fn(),
  dataLayer: jest.fn(),
}))

jest.mock("react-gtm-module", () => ({
  initialize: jest.fn(),
  dataLayer: jest.fn(),
}))

jest.mock("../../authentication/token", () => ({
  isTokenValid: jest.fn(),
  parseUrlParams: jest.fn(() => ({
    get: jest.fn((_) => null),
  })),
}))

jest.mock("../../util/languageUtil", () => ({
  getCurrentLanguage: jest.fn(() => "en"),
  getPathWithoutLanguagePrefix: jest.fn((path) => path),
}))

jest.mock("../../util/routeUtil", () => ({
  getLocalizedPath: jest.fn((path) => path),
}))

describe("withAuthentication", () => {
  let mockContextValue: ContextProps
  let originalLocation: Location
  const TestComponent = () => <div>Protected Component</div>
  const WrappedComponent = withAuthentication(TestComponent)

  beforeEach(() => {
    originalLocation = mockWindowLocation()
    mockContextValue = {
      profile: {
        uid: "123",
        email: "test@example.com",
        created_at: new Date(),
        updated_at: new Date(),
        id: 0,
      },
      signIn: jest.fn(),
      signOut: jest.fn(),
      timeOut: jest.fn(),
      saveProfile: jest.fn(),
      loading: false,
      initialStateLoaded: true,
    }

    // Reset all mocks before each test
    ;(getCurrentLanguage as jest.Mock).mockReturnValue("en")
    ;(isTokenValid as jest.Mock).mockReset()
    ;(parseUrlParams as jest.Mock).mockReset()

    // Setup default mock return values
    ;(parseUrlParams as jest.Mock).mockReturnValue({
      get: jest.fn((_) => null),
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    restoreWindowLocation(originalLocation)
  })

  it("renders the wrapped component when authenticated", () => {
    ;(isTokenValid as jest.Mock).mockReturnValue(true)

    const { getByText } = render(
      <UserContext.Provider value={mockContextValue}>
        <WrappedComponent />
      </UserContext.Provider>
    )

    expect(getByText("Protected Component")).toBeInTheDocument()
  })

  it("redirects to sign-in when token is invalid", () => {
    ;(isTokenValid as jest.Mock).mockReturnValue(false)
    ;(getLocalizedPath as jest.Mock).mockReturnValue("/sign-in")

    render(
      <UserContext.Provider value={mockContextValue}>
        <WrappedComponent />
      </UserContext.Provider>
    )

    expect(getLocalizedPath).toHaveBeenCalledWith("/sign-in", "en", "")
    expect(window.location.assign).toHaveBeenCalledWith("/sign-in")
  })

  it("redirects to sign-in with redirect param when specified", () => {
    ;(isTokenValid as jest.Mock).mockReturnValue(false)
    ;(getLocalizedPath as jest.Mock).mockReturnValue("/sign-in?redirect=test-path")
    const WrappedWithRedirect = withAuthentication(TestComponent, {
      redirectType: "test-path" as RedirectType,
    })

    render(
      <UserContext.Provider value={mockContextValue}>
        <WrappedWithRedirect />
      </UserContext.Provider>
    )

    expect(getLocalizedPath).toHaveBeenCalledWith("/sign-in", "en", "?redirect=test-path")
    expect(window.location.assign).toHaveBeenCalledWith("/sign-in?redirect=test-path")
  })

  it("returns null while loading", () => {
    ;(isTokenValid as jest.Mock).mockReturnValue(true)
    mockContextValue.loading = true

    const { container } = render(
      <UserContext.Provider value={mockContextValue}>
        <WrappedComponent />
      </UserContext.Provider>
    )

    expect(container.firstChild).toBeNull()
  })

  it("returns null when profile is undefined", () => {
    ;(isTokenValid as jest.Mock).mockReturnValue(true)
    mockContextValue.profile = undefined

    const { container } = render(
      <UserContext.Provider value={mockContextValue}>
        <WrappedComponent />
      </UserContext.Provider>
    )

    expect(container.firstChild).toBeNull()
  })

  it("sets display name for debugging", () => {
    const TestComponentWithName = () => <div>Named Component</div>
    TestComponentWithName.displayName = "TestComponentWithName"
    const WrappedWithName = withAuthentication(TestComponentWithName)

    expect(WrappedWithName.displayName).toBe("WithAuthentication(TestComponentWithName)")
  })

  it("pushes to data layer and cleans URL when account is confirmed", () => {
    // Setup token as valid
    ;(isTokenValid as jest.Mock).mockReturnValue(true)

    // Mock URL params for account confirmation
    const mockGet = jest.fn((key: string) => {
      if (key === "access-token") return "test-token"
      if (key === "accountConfirmed") return "true"
      if (key === "account_confirmation_success") return "true"
      return null
    })
    ;(parseUrlParams as jest.Mock).mockReturnValue({
      get: mockGet,
    })

    // Mock window.history.replaceState
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originalReplaceState = window.history.replaceState
    window.history.replaceState = jest.fn()

    // Set up mock location
    const mockLocation = {
      origin: "http://dahlia.com",
      pathname: "/account",
      href: "http://dahlia.com/account?access-token=test-token&accountConfirmed=true&account_confirmation_success=true",
    }
    Object.defineProperty(window, "location", { value: mockLocation, writable: true })

    render(
      <UserContext.Provider value={mockContextValue}>
        <WrappedComponent />
      </UserContext.Provider>
    )

    // Verify data layer was called with correct params
    expect(TagManager.dataLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        dataLayer: expect.objectContaining({
          event: "account_create_completed",
          user_id: mockContextValue.profile?.id,
        }),
      })
    )

    // Verify URL params were cleaned up
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(window.history.replaceState).toHaveBeenCalledWith(
      {},
      document.title,
      window.location?.origin + "/account"
    )

    // Restore original replaceState
    window.history.replaceState = originalReplaceState
  })
})
