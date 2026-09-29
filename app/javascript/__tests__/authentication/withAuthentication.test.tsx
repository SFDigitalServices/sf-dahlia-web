/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { fireEvent, render, waitFor } from "@testing-library/react"
import { mockWindowLocation, restoreWindowLocation } from "../__util__/renderUtils"
import { withAuthentication } from "../../authentication/withAuthentication"
import UserContext, { ContextProps } from "../../authentication/context/UserContext"
import { isTokenValid, parseUrlParams } from "../../authentication/token"
import { useAuth } from "@clerk/react"
import { getLocalizedPath, getAddProfilePath, RedirectType } from "../../util/routeUtil"
import { getCurrentLanguage } from "../../util/languageUtil"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import TagManager from "react-gtm-module"
import {
  AuthSessionProvider,
  useAuthSession,
} from "../../authentication/session/AuthSessionProvider"

// Mock the useGTMDataLayer hook
jest.mock("react-gtm-module", () => ({
  initialize: jest.fn(),
  dataLayer: jest.fn(),
}))

jest.mock("../../api/authApiService", () => ({
  clearHousingCounselorSession: jest.fn(),
}))

jest.mock("../../authentication/token", () => ({
  clearHeaders: jest.fn(),
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
  getAddProfilePath: jest.fn(() => "/add-profile"),
}))

jest.mock("../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ flagsReady: true, unleashFlag: false })),
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
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })

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
    expect(window.history.replaceState).toHaveBeenCalledWith(
      {},
      document.title,
      window.location?.origin + "/account"
    )

    // Restore original replaceState
    window.history.replaceState = originalReplaceState
  })

  describe("when Clerk auth is enabled", () => {
    beforeEach(() => {
      ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
    })

    it("renders the wrapped component when signed in with a profile", () => {
      ;(useAuth as jest.Mock).mockReturnValue({ isLoaded: true, isSignedIn: true })

      const { getByText } = render(
        <UserContext.Provider value={mockContextValue}>
          <WrappedComponent />
        </UserContext.Provider>,
        { wrapper: AuthSessionProvider }
      )

      expect(getByText("Protected Component")).toBeInTheDocument()
    })

    it("redirects to sign-in when the user is not signed in", () => {
      ;(useAuth as jest.Mock).mockReturnValue({ isLoaded: true, isSignedIn: false })
      ;(getLocalizedPath as jest.Mock).mockReturnValue("/sign-in")

      render(
        <UserContext.Provider value={mockContextValue}>
          <WrappedComponent />
        </UserContext.Provider>,
        { wrapper: AuthSessionProvider }
      )

      expect(window.location.assign).toHaveBeenCalledWith("/sign-in")
    })

    it("redirects to add-profile when the user is signed in without a profile", () => {
      ;(useAuth as jest.Mock).mockReturnValue({ isLoaded: true, isSignedIn: true })
      ;(getAddProfilePath as jest.Mock).mockReturnValue("/add-profile")
      mockContextValue.profile = undefined

      render(
        <UserContext.Provider value={mockContextValue}>
          <WrappedComponent />
        </UserContext.Provider>,
        { wrapper: AuthSessionProvider }
      )

      expect(window.location.assign).toHaveBeenCalledWith("/add-profile")
    })

    describe("when a signed-in user's session ends while on the page", () => {
      let signedIn: boolean
      const SignOutButton = () => {
        const { signOut } = useAuthSession()
        return (
          <button
            onClick={() => {
              void signOut()
            }}
          >
            Sign out
          </button>
        )
      }
      const WrappedSignOutButton = withAuthentication(SignOutButton)
      const renderSignedIn = () =>
        render(
          <UserContext.Provider value={mockContextValue}>
            <WrappedSignOutButton />
          </UserContext.Provider>,
          { wrapper: AuthSessionProvider }
        )

      beforeEach(() => {
        signedIn = true
        ;(getLocalizedPath as jest.Mock).mockReturnValue("/sign-in")
        ;(useAuth as jest.Mock).mockImplementation(() => ({
          isLoaded: true,
          isSignedIn: signedIn,
          getToken: jest.fn(),
          signOut: jest.fn(() => {
            signedIn = false
            return Promise.resolve()
          }),
        }))
      })

      // Regression: the gate's own hard redirect used to race the sign-out caller's
      // navigation to sign-in, dropping the state that carries the sign-out toast.
      it("leaves the redirect to whoever signed the user out", async () => {
        const { getByRole, rerender } = renderSignedIn()

        fireEvent.click(getByRole("button", { name: "Sign out" }))
        await waitFor(() => expect(signedIn).toBe(false))
        rerender(
          <UserContext.Provider value={mockContextValue}>
            <WrappedSignOutButton />
          </UserContext.Provider>
        )

        expect(window.location.assign).not.toHaveBeenCalled()
      })

      it("still redirects to sign-in when the session ends some other way", () => {
        const { rerender } = renderSignedIn()

        signedIn = false
        rerender(
          <UserContext.Provider value={mockContextValue}>
            <WrappedSignOutButton />
          </UserContext.Provider>
        )

        expect(window.location.assign).toHaveBeenCalledWith("/sign-in")
      })
    })
  })
})
