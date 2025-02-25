import React from "react"
import { render } from "@testing-library/react"
import { withAuthentication } from "../../authentication/withAuthentication"
import UserContext, { ContextProps } from "../../authentication/context/UserContext"
import { isTokenValid } from "../../authentication/token"
import { getLocalizedPath } from "../../util/routeUtil"
import { getCurrentLanguage } from "../../util/languageUtil"

jest.mock("../../authentication/token", () => ({
  isTokenValid: jest.fn(),
}))

jest.mock("../../util/languageUtil", () => ({
  getCurrentLanguage: jest.fn(() => "en"),
  getPathWithoutLanguagePrefix: jest.fn((path) => path),
}))

jest.mock("../../util/routeUtil", () => ({
  getLocalizedPath: jest.fn((path) => path),
}))

describe("withAuthentication", () => {
  let originalLocation: Location
  let mockContextValue: ContextProps
  const TestComponent = () => <div>Protected Component</div>
  const WrappedComponent = withAuthentication(TestComponent)

  beforeEach(() => {
    originalLocation = window.location
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
    jest.clearAllMocks()
    ;(getCurrentLanguage as jest.Mock).mockReturnValue("en")

    // Mock window.location
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).location
    window.location = {
      ...originalLocation,
      href: "http://test.com",
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      toString: jest.fn(),
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
    window.location = originalLocation
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
    expect(window.location.href).toBe("/sign-in")
  })

  it("redirects to sign-in with redirect param when specified", () => {
    ;(isTokenValid as jest.Mock).mockReturnValue(false)
    ;(getLocalizedPath as jest.Mock).mockReturnValue("/sign-in?redirect=test-path")
    const WrappedWithRedirect = withAuthentication(TestComponent, { redirectPath: "test-path" })

    render(
      <UserContext.Provider value={mockContextValue}>
        <WrappedWithRedirect />
      </UserContext.Provider>
    )

    expect(getLocalizedPath).toHaveBeenCalledWith("/sign-in", "en", "?redirect=test-path")
    expect(window.location.href).toBe("/sign-in?redirect=test-path")
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
})
