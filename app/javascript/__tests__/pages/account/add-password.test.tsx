import React from "react"
import { useSignIn, useUser } from "@clerk/react"
import { screen, waitFor, cleanup } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useLocation, useNavigate } from "react-router"
import AddPassword from "../../../pages/account/add-password"
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../../__util__/renderUtils"
import { setupUserContext } from "../../__util__/accountUtils"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"
import { AUTH_FLOW } from "../../../modules/constants"

jest.mock("@clerk/react", () => {
  const Clerk = jest.requireActual("@clerk/react")
  return {
    ...Clerk,
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
    useAuth: jest.fn(),
    useUser: jest.fn(),
    useSignIn: jest.fn(),
  }
})

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}))

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ flagsReady: true, unleashFlag: true })),
}))

describe("<AddPassword />", () => {
  let originalLocation: Location
  let mockNavigate: jest.Mock
  let mockUpdatePassword: jest.Mock

  beforeEach(async () => {
    document.documentElement.lang = "en"
    document.title = "DAHLIA San Francisco Housing Portal"
    originalLocation = mockWindowLocation()
    setupUserContext({ loggedIn: true, hasProfile: false })
    mockNavigate = jest.fn()
    mockUpdatePassword = jest.fn().mockResolvedValue(undefined)
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    ;(useLocation as jest.Mock).mockReturnValue({
      state: { flow: AUTH_FLOW.CREATE_ACCOUNT },
    })
    ;(useSignIn as jest.Mock).mockReturnValue({
      fetchStatus: "idle",
      signIn: {
        resetPasswordEmailCode: { submitPassword: jest.fn().mockResolvedValue({ error: null }) },
        finalize: jest.fn().mockResolvedValue({ error: null }),
        status: null,
      },
    })
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
    ;(useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: { updatePassword: mockUpdatePassword, passwordEnabled: false },
    })
    await renderAndLoadAsync(<AddPassword assetPaths={{}} />)
  })

  afterEach(() => {
    restoreWindowLocation(originalLocation)
    cleanup()
  })

  it("shows the add password page", () => {
    expect(screen.getByRole("heading", { name: /add a password/i, level: 1 })).not.toBeNull()
    expect(screen.getByText(/it's okay to skip this step/i)).not.toBeNull()
    expect(screen.getByRole("group", { name: /choose password \(optional\)/i })).not.toBeNull()
    expect(screen.getByText(/must include at least:/i)).not.toBeNull()
    expect(screen.getByTestId("password-field")).not.toBeNull()
    expect(screen.getByLabelText(/show password/i)).not.toBeNull()
    expect(screen.getByRole("button", { name: /save password/i })).not.toBeNull()
    expect(screen.getByRole("button", { name: /skip for now/i })).not.toBeNull()
    expect(screen.getByRole("heading", { name: /get help/i })).not.toBeNull()
  })

  it("saves a valid password", async () => {
    const user = userEvent.setup()
    jest.spyOn(console, "error").mockImplementation(() => {})

    await user.type(screen.getByTestId("password-field"), "abcd1234")
    await user.click(screen.getByRole("button", { name: /save password/i }))

    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith({ newPassword: "abcd1234" })
    })
    expect(mockNavigate).toHaveBeenCalledWith("/add-profile")
    expect(screen.queryByTestId("error-message")).toBeNull()
  })

  it("shows a validation error for an invalid password", async () => {
    const user = userEvent.setup()

    await user.type(screen.getByTestId("password-field"), "abc")
    await user.click(screen.getByRole("button", { name: /save password/i }))

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Choose a strong password with at least 8 characters, 1 letter, and 1 number"
      )
    })
    expect(mockUpdatePassword).not.toHaveBeenCalled()
  })

  it("does not save a password when skipping", async () => {
    const user = userEvent.setup()

    await user.click(screen.getByRole("button", { name: /skip for now/i }))

    expect(mockUpdatePassword).not.toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith("/add-profile")
  })

  it("shows an error when the password update fails", async () => {
    const user = userEvent.setup()
    jest.spyOn(console, "error").mockImplementation(() => {})
    mockUpdatePassword.mockRejectedValue(new Error("nope"))

    await user.type(screen.getByTestId("password-field"), "abcd1234")
    await user.click(screen.getByRole("button", { name: /save password/i }))

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).not.toBeNull()
    })
  })

  it("redirects to sign-in when clerk is disabled", async () => {
    cleanup()
    document.title = "DAHLIA San Francisco Housing Portal"
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })
    await renderAndLoadAsync(<AddPassword assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/sign-in")
    })
  })

  it("redirects to sign-in when the user is not signed in", async () => {
    cleanup()
    document.title = "DAHLIA San Francisco Housing Portal"
    setupUserContext({ loggedIn: false })
    ;(useUser as jest.Mock).mockReturnValue({ isLoaded: true, isSignedIn: false, user: null })
    await renderAndLoadAsync(<AddPassword assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/sign-in")
    })
  })

  it("does not redirect when the user has no password and no profile", () => {
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(screen.getByRole("heading", { name: /add a password/i, level: 1 })).not.toBeNull()
  })

  it("redirects to add-profile when the user already has a password", async () => {
    cleanup()
    document.title = "DAHLIA San Francisco Housing Portal"
    setupUserContext({ loggedIn: true, hasProfile: false })
    ;(useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: { updatePassword: mockUpdatePassword, passwordEnabled: true },
    })
    await renderAndLoadAsync(<AddPassword assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/add-profile")
    })
  })

  it("redirects to account when the user has already set up their profile", async () => {
    cleanup()
    document.title = "DAHLIA San Francisco Housing Portal"
    setupUserContext({ loggedIn: true })
    ;(useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: { updatePassword: mockUpdatePassword, passwordEnabled: false },
    })
    await renderAndLoadAsync(<AddPassword assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/account")
    })
  })
  describe("Reset password flow", () => {
    let mockSubmitPassword: jest.Mock
    let mockFinalize: jest.Mock
    let mockSignInResource: { status: string | null }

    const renderWithStatus = async (status: string | null) => {
      cleanup()
      mockSubmitPassword = jest.fn().mockResolvedValue({ error: null })
      mockFinalize = jest.fn().mockImplementation(async (params?: { navigate?: unknown }) => {
        const navigateParam = params?.navigate as
          | ((args: { decorateUrl: (url: string) => string }) => Promise<void> | void)
          | undefined
        if (navigateParam) await navigateParam({ decorateUrl: (url: string) => url })
        return { error: null }
      })
      mockSignInResource = {
        status,
        resetPasswordEmailCode: { submitPassword: mockSubmitPassword },
        finalize: mockFinalize,
      } as unknown as { status: string | null }
      ;(useLocation as jest.Mock).mockReturnValue({
        state: { flow: AUTH_FLOW.FORGOT_PASSWORD },
      })
      ;(useSignIn as jest.Mock).mockReturnValue({
        fetchStatus: "idle",
        signIn: mockSignInResource,
      })
      await renderAndLoadAsync(<AddPassword assetPaths={{}} />)
    }

    it("redirects to forgot password page if reset status is stale", async () => {
      await renderWithStatus(null)
      expect(screen.queryByRole("button", { name: /save password/i })).toBeNull()
    })

    it("resets the password, logs user in, and redirects to account page", async () => {
      await renderWithStatus("needs_new_password")
      // v6 reports completion on the resource, not in the call's return value.
      mockSubmitPassword.mockImplementation(() => {
        mockSignInResource.status = "complete"
        return Promise.resolve({ error: null })
      })

      const user = userEvent.setup()
      await user.type(screen.getByTestId("password-field"), "abcd1234")
      await user.click(screen.getByRole("button", { name: /save password/i }))

      await waitFor(() => {
        expect(mockSubmitPassword).toHaveBeenCalledWith({ password: "abcd1234" })
      })
      expect(mockFinalize).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith("/account")
    })

    it("shows an console error when the reset does not complete", async () => {
      await renderWithStatus("needs_new_password")
      jest.spyOn(console, "error").mockImplementation(() => {})
      mockSubmitPassword.mockImplementation(() => {
        mockSignInResource.status = "needs_second_factor"
        return Promise.resolve({ error: null })
      })

      const user = userEvent.setup()
      await user.type(screen.getByTestId("password-field"), "abcd1234")
      await user.click(screen.getByRole("button", { name: /save password/i }))

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).not.toBeNull()
      })
    })
  })
})
