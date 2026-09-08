import React from "react"
import { useAuth, useSession, useUser } from "@clerk/clerk-react"
import { screen, waitFor, cleanup } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useNavigate } from "react-router"
import ChangePassword from "../../../pages/account/change-password"
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../../__util__/renderUtils"
import { setupUserContext } from "../../__util__/accountUtils"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"

jest.mock("@clerk/clerk-react", () => {
  const Clerk = jest.requireActual("@clerk/clerk-react")
  return {
    ...Clerk,
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
    useAuth: jest.fn(),
    useUser: jest.fn(),
    useSession: jest.fn(),
  }
})

jest.mock("@clerk/clerk-react/errors", () => ({
  isClerkAPIResponseError: (error: unknown) =>
    Array.isArray((error as { errors?: unknown })?.errors),
}))

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: jest.fn(),
}))

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ flagsReady: true, unleashFlag: true })),
}))

const clerkError = (code: string) =>
  Object.assign(new Error("Clerk error"), {
    errors: [{ code, message: code, longMessage: code }],
  })

describe("<ChangePassword />", () => {
  let originalLocation: Location
  let mockNavigate: jest.Mock
  let mockUpdatePassword: jest.Mock
  let mockStartVerification: jest.Mock
  let mockAttemptFirstFactor: jest.Mock

  beforeEach(async () => {
    document.documentElement.lang = "en"
    document.title = "DAHLIA San Francisco Housing Portal"
    originalLocation = mockWindowLocation()
    setupUserContext({ loggedIn: true })
    mockNavigate = jest.fn()
    mockUpdatePassword = jest.fn().mockResolvedValue(undefined)
    mockStartVerification = jest.fn().mockResolvedValue(undefined)
    mockAttemptFirstFactor = jest.fn().mockResolvedValue(undefined)
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
    ;(useAuth as jest.Mock).mockReturnValue({ isLoaded: true, isSignedIn: true })
    ;(useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: { updatePassword: mockUpdatePassword },
    })
    ;(useSession as jest.Mock).mockReturnValue({
      session: {
        startVerification: mockStartVerification,
        attemptFirstFactorVerification: mockAttemptFirstFactor,
      },
    })
    await renderAndLoadAsync(<ChangePassword assetPaths={{}} />)
  })

  afterEach(() => {
    restoreWindowLocation(originalLocation)
    cleanup()
  })

  it("shows the change password page", () => {
    expect(screen.getByRole("heading", { name: /change password/i, level: 1 })).not.toBeNull()
    expect(screen.getByLabelText(/current password/i)).not.toBeNull()
    expect(screen.getByLabelText(/choose a new password/i)).not.toBeNull()
    expect(screen.getByRole("link", { name: /forgot password/i })).toHaveAttribute(
      "href",
      "/forgot-password?email=email@email.com"
    )
  })

  it("changes the password and returns to settings", async () => {
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/current password/i), "abcd1234")
    await user.type(screen.getByLabelText(/choose a new password/i), "abcd12345")
    await user.click(screen.getByRole("button", { name: /save password/i }))

    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith({
        currentPassword: "abcd1234",
        newPassword: "abcd12345",
        signOutOfOtherSessions: true,
      })
    })
    expect(mockAttemptFirstFactor).toHaveBeenCalledWith({
      strategy: "password",
      password: "abcd1234",
    })
    expect(mockNavigate).toHaveBeenCalledWith("/account/settings", {
      state: { passwordChanged: true },
    })
  })

  it("does not submit when fields are empty", async () => {
    const user = userEvent.setup()

    await user.click(screen.getByRole("button", { name: /save password/i }))

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /enter current password/i })).not.toBeNull()
    })
    expect(mockUpdatePassword).not.toHaveBeenCalled()
  })

  it("shows an error when the current password is incorrect", async () => {
    const user = userEvent.setup()
    mockUpdatePassword.mockRejectedValue(clerkError("form_password_incorrect"))

    await user.type(screen.getByLabelText(/current password/i), "wrongpass1")
    await user.type(screen.getByLabelText(/choose a new password/i), "abcd12345")
    await user.click(screen.getByRole("button", { name: /save password/i }))

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /current password is incorrect/i })).not.toBeNull()
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("redirects to sign-in when clerk is disabled", async () => {
    cleanup()
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })
    await renderAndLoadAsync(<ChangePassword assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/sign-in")
    })
  })

  it("redirects to sign-in page when the user is not signed in", async () => {
    cleanup()
    jest.restoreAllMocks()
    setupUserContext({ loggedIn: false })
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
    ;(useAuth as jest.Mock).mockReturnValue({ isLoaded: true, isSignedIn: false })
    await renderAndLoadAsync(<ChangePassword assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/sign-in")
    })
  })
})
