import React, { useContext } from "react"
import { act, render, screen, waitFor } from "@testing-library/react"
import {
  AuthSessionProvider,
  useAuthSession,
} from "../../../authentication/session/AuthSessionProvider"
import UserProvider from "../../../authentication/context/UserProvider"
import UserContext, { ContextProps } from "../../../authentication/context/UserContext"
import { getProfile, signIn } from "../../../api/authApiService"
import { isTokenValid } from "../../../authentication/token"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"
import { renderAndLoadAsync } from "../../__util__/renderUtils"
import { mockProfileStub } from "../../__util__/accountUtils"

jest.mock("../../../api/authApiService", () => ({
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

jest.mock("../../../authentication/session/AuthSessionProvider", () => {
  const actualAuthSessionModule = jest.requireActual(
    "../../../authentication/session/AuthSessionProvider"
  )
  return {
    ...actualAuthSessionModule,
    useAuthSession: jest.fn(() => ({
      status: { kind: "initializing" },
      getCredentials: jest.fn().mockResolvedValue({ kind: "none" }),
      signOut: jest.fn().mockResolvedValue(undefined),
    })),
  }
})

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ flagsReady: true, unleashFlag: false })),
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

const ProfileStateComponent = () => {
  const { profileMissing, initialStateLoaded } = useContext(UserContext) as ContextProps
  return (
    <div>
      {initialStateLoaded && <p>Initial state loaded</p>}
      {profileMissing && <p>Profile missing</p>}
    </div>
  )
}

describe("UserProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })
    ;(useAuthSession as jest.Mock).mockReturnValue({
      status: { kind: "initializing" },
      getCredentials: jest.fn().mockResolvedValue({ kind: "none" }),
      signOut: jest.fn().mockResolvedValue(undefined),
    })
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

  it("should mark profileMissing when Clerk profile lookup returns 404", async () => {
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
    ;(useAuthSession as jest.Mock).mockReturnValue({
      status: { kind: "signedIn" },
      getCredentials: jest.fn().mockResolvedValue({
        kind: "bearerToken",
        token: "clerk-session-token",
      }),
      signOut: jest.fn().mockResolvedValue(undefined),
    })
    ;(getProfile as jest.Mock).mockRejectedValue({
      isAxiosError: true,
      response: { status: 404 },
    })

    render(
      <UserProvider>
        <ProfileStateComponent />
      </UserProvider>
    )

    await waitFor(() => expect(screen.getByText("Profile missing")).not.toBeNull())
    expect(getProfile).toHaveBeenCalledWith({
      clerkEnabled: true,
      sessionToken: "clerk-session-token",
    })
  })
})
