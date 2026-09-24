import React, { useContext } from "react"
import { act, render, screen, waitFor } from "@testing-library/react"
import { AuthSessionProvider } from "../../../authentication/session/AuthSessionProvider"
import UserProvider from "../../../authentication/context/UserProvider"
import UserContext, { ContextProps } from "../../../authentication/context/UserContext"
import { exchangeClerkForDeviseHeaders, getProfile, signIn } from "../../../api/authApiService"
import { isTokenValid } from "../../../authentication/token"
import { renderAndLoadAsync } from "../../__util__/renderUtils"
import { mockProfileStub } from "../../__util__/accountUtils"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../../modules/constants"

jest.mock("../../../api/authApiService", () => ({
  exchangeClerkForDeviseHeaders: jest.fn(),
  getProfile: jest.fn(),
  signIn: jest.fn(),
}))

jest.mock("../../../authentication/token", () => {
  const actualTokenModule = jest.requireActual("../../../authentication/token")
  return {
    ...actualTokenModule,
    isTokenValid: jest.fn(),
  }
})

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(),
}))

const mockGetItem = jest.fn()
const mockSetItem = jest.fn()
const mockRemoveItem = jest.fn()
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: (...args: string[]) => mockGetItem(...args),
    setItem: (...args: string[]) => mockSetItem(...args),
    removeItem: (...args: string[]) => mockRemoveItem(...args),
  },
})

const TestComponent = () => {
  const { signIn, signOut, profile, initialStateLoaded } = useContext(UserContext) as ContextProps

  return (
    <div>
      {initialStateLoaded && <p>Initial state loaded</p>}
      {profile ? (
        <div>
          <p>Signed in as {profile.uid}</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <button
          onClick={() => {
            signIn("test@example.com", "password")
              .then(() => {})
              .catch(() => {})
          }}
        >
          Sign In
        </button>
      )}
    </div>
  )
}

describe("UserProvider", () => {
  let clerkEnabled = false

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useFeatureFlag as jest.Mock).mockImplementation((flag) => ({
      flagsReady: true,
      unleashFlag: flag === UNLEASH_FLAG.CLERK_AUTH ? clerkEnabled : false,
    }))
  })

  it("should load profile on mount if access token is available", async () => {
    ;(getProfile as jest.Mock).mockResolvedValue(mockProfileStub)
    ;(isTokenValid as jest.Mock).mockReturnValue(true)

    render(
      <AuthSessionProvider>
        <UserProvider>
          <TestComponent />
        </UserProvider>
      </AuthSessionProvider>
    )

    await waitFor(() => expect(screen.getByText("Signed in as abc123")).not.toBeNull())
  })

  it("should sign in and sign out a user", async () => {
    ;(getProfile as jest.Mock).mockRejectedValue(undefined)
    ;(signIn as jest.Mock).mockResolvedValue(mockProfileStub)
    ;(isTokenValid as jest.Mock).mockReturnValueOnce(false).mockReturnValueOnce(true)

    await renderAndLoadAsync(
      <AuthSessionProvider>
        <UserProvider>
          <TestComponent />
        </UserProvider>
      </AuthSessionProvider>
    )

    act(() => {
      screen.getByText("Sign In").click()
    })

    await waitFor(() => expect(screen.getByText("Signed in as abc123")).not.toBeNull())

    act(() => {
      screen.getByText("Sign Out").click()
    })

    await waitFor(() => expect(screen.getByText("Sign In")).not.toBeNull())
  })

  it("should handle token invalidation", async () => {
    ;(isTokenValid as jest.Mock).mockReturnValue(false)
    ;(getProfile as jest.Mock).mockRejectedValueOnce(new Error("Token expired"))

    await renderAndLoadAsync(
      <AuthSessionProvider>
        <UserProvider>
          <TestComponent />
        </UserProvider>
      </AuthSessionProvider>
    )

    await waitFor(() => expect(screen.getByText("Initial state loaded")).not.toBeNull())
  })

  it("should handle temporary auth params from URL", async () => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        href: "http://localhost:3000/reset-password?access-token=DDDDD&client=CCCCC&client_id=BBBBB&config=default&expiry=100&reset_password=true&token=AAAAAA&uid=test%40test.com",
      },
    })
    ;(isTokenValid as jest.Mock).mockReturnValue(true)
    ;(getProfile as jest.Mock).mockResolvedValue(mockProfileStub)

    await renderAndLoadAsync(
      <AuthSessionProvider>
        <UserProvider>
          <TestComponent />
        </UserProvider>
      </AuthSessionProvider>
    )

    await waitFor(() => expect(screen.getByText("Signed in as abc123")).not.toBeNull())
    expect(getProfile).toHaveBeenCalled()
  })

  it("should exchange Clerk session for Devise headers before loading profile", async () => {
    clerkEnabled = true
    const { useAuth } = jest.requireMock<typeof import("@clerk/react")>("@clerk/react")
    ;(useAuth as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      signOut: jest.fn(),
      getToken: jest.fn().mockResolvedValue("clerk-session-token"),
    })
    ;(exchangeClerkForDeviseHeaders as jest.Mock).mockResolvedValue(undefined)
    ;(getProfile as jest.Mock).mockResolvedValue(mockProfileStub)

    render(
      <AuthSessionProvider>
        <UserProvider>
          <TestComponent />
        </UserProvider>
      </AuthSessionProvider>
    )

    await waitFor(() =>
      expect(exchangeClerkForDeviseHeaders).toHaveBeenCalledWith("clerk-session-token")
    )
    await waitFor(() => expect(getProfile).toHaveBeenCalledWith("clerk-session-token"))
    expect((exchangeClerkForDeviseHeaders as jest.Mock).mock.invocationCallOrder[0]).toBeLessThan(
      (getProfile as jest.Mock).mock.invocationCallOrder[0]
    )
  })
})
