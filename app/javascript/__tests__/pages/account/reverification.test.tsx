import React from "react"
import { useAuth, useSession, useUser } from "@clerk/react"
import { t } from "@bloom-housing/ui-components"
import { screen, waitFor, cleanup, fireEvent, act } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useNavigate, useSearchParams } from "react-router"
import Reverification from "../../../pages/account/reverification"
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../../__util__/renderUtils"
import { setupUserContext } from "../../__util__/accountUtils"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"
import { AUTH_FLOW } from "../../../modules/constants"
import {
  getAddPasswordPath,
  getMyAccountSettingsPath,
  getReverificationCodePath,
} from "../../../util/routeUtil"

jest.mock("@clerk/react", () => {
  const Clerk = jest.requireActual("@clerk/react")
  return {
    ...Clerk,
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
    useAuth: jest.fn(),
    useUser: jest.fn(),
    useSession: jest.fn(),
    useSignUp: () => ({ fetchStatus: "idle", signUp: {} }),
  }
})

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: jest.fn(),
  useSearchParams: jest.fn(),
}))

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ flagsReady: true, unleashFlag: true })),
}))

const clerkUser = (passwordEnabled = false) => ({
  passwordEnabled,
  primaryEmailAddressId: "email-1",
  primaryEmailAddress: { emailAddress: "test@example.com" },
  emailAddresses: [{ id: "email-1", emailAddress: "test@example.com" }],
})

describe("<Reverification />", () => {
  let originalLocation: Location
  let mockNavigate: jest.Mock
  let mockStartVerification: jest.Mock
  let mockPrepareFirstFactor: jest.Mock
  let mockAttemptFirstFactor: jest.Mock

  const renderPage = async (flow = "addPassword", passwordEnabled = false) => {
    cleanup()
    ;(useSearchParams as jest.Mock).mockReturnValue([new URLSearchParams(`flow=${flow}`)])
    ;(useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: clerkUser(passwordEnabled),
    })
    await renderAndLoadAsync(<Reverification assetPaths={{}} />)
  }

  beforeEach(() => {
    document.documentElement.lang = "en"
    document.title = "DAHLIA San Francisco Housing Portal"
    originalLocation = mockWindowLocation()
    setupUserContext({ loggedIn: true })
    mockNavigate = jest.fn()
    mockStartVerification = jest.fn().mockResolvedValue({
      supportedFirstFactors: [{ strategy: "email_code", emailAddressId: "email-1" }],
    })
    mockPrepareFirstFactor = jest.fn().mockResolvedValue(undefined)
    mockAttemptFirstFactor = jest.fn().mockResolvedValue(undefined)
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
    ;(useAuth as jest.Mock).mockReturnValue({ isLoaded: true, isSignedIn: true })
    ;(useSession as jest.Mock).mockReturnValue({
      session: {
        startVerification: mockStartVerification,
        prepareFirstFactorVerification: mockPrepareFirstFactor,
        attemptFirstFactorVerification: mockAttemptFirstFactor,
      },
    })
  })

  afterEach(() => {
    restoreWindowLocation(originalLocation)
    cleanup()
    jest.restoreAllMocks()
  })

  it("shows the code view with the prefilled, disabled email", async () => {
    await renderPage()

    expect(
      screen.getByRole("heading", { name: t("accountSettings.reverification.signIn"), level: 1 })
    ).not.toBeNull()
    const emailField = screen.getByRole("textbox", { name: /email/i })
    expect(emailField).toBeDisabled()
  })

  it("sends a code and continues to the verification code page", async () => {
    await renderPage()

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: t("createAccount.getCode") }))
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(mockPrepareFirstFactor).toHaveBeenCalledWith({
        strategy: "email_code",
        emailAddressId: "email-1",
      })
    })
    expect(mockNavigate).toHaveBeenCalledWith(getReverificationCodePath(), {
      state: {
        verificationCodeEmailAddress: "test@example.com",
        flow: AUTH_FLOW.REVERIFICATION,
        returnToAuthFlow: "addPassword",
      },
    })
  })

  it("returns to settings when the email code factor is unavailable", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    mockStartVerification.mockResolvedValue({ supportedFirstFactors: [] })
    await renderPage()

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: t("createAccount.getCode") }))
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(getMyAccountSettingsPath(), {
        state: { reverificationFailed: true },
      })
    })

    consoleError.mockRestore()
  })

  it("returns to settings when sending the code throws", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    mockPrepareFirstFactor.mockRejectedValue(new Error("clerk down"))
    await renderPage()

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: t("createAccount.getCode") }))
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(getMyAccountSettingsPath(), {
        state: { reverificationFailed: true },
      })
    })

    consoleError.mockRestore()
  })

  it("hides the password option when the user has no password", async () => {
    await renderPage("addPassword", false)

    expect(screen.queryByRole("button", { name: t("signIn.passwordInstead") })).toBeNull()
  })

  it("verifies with a password and continues to the destination", async () => {
    await renderPage("updateLoginEmail", true)

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: t("signIn.passwordInstead") }))
      await Promise.resolve()
    })

    const user = userEvent.setup()
    const passwordInput = screen
      .getAllByLabelText(/password/i)
      .find((element) => (element as HTMLInputElement).type === "password") as HTMLInputElement

    await user.type(passwordInput, "abcd1234")
    await user.click(screen.getByRole("button", { name: t("label.signIn") }))
    await user.click(screen.getByRole("button", { name: t("signIn.oneTimeCode") }))

    await waitFor(() => {
      expect(mockAttemptFirstFactor).toHaveBeenCalledWith({
        strategy: "password",
        password: "abcd1234",
      })
    })
  })

  it("shows an error when the password is incorrect", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    mockAttemptFirstFactor.mockRejectedValue(
      Object.assign(new Error("Clerk error"), {
        errors: [{ code: "form_password_incorrect" }],
      })
    )
    await renderPage("updateLoginEmail", true)

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: t("signIn.passwordInstead") }))
      await Promise.resolve()
    })

    const user = userEvent.setup()
    const passwordInput = screen
      .getAllByLabelText(/password/i)
      .find((element) => (element as HTMLInputElement).type === "password") as HTMLInputElement

    await user.type(passwordInput, "abcd1234")
    await user.click(screen.getByRole("button", { name: t("label.signIn") }))
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /password is incorrect/i })).not.toBeNull()
    })
    expect(mockNavigate).not.toHaveBeenCalledWith(getAddPasswordPath(), expect.anything())

    consoleError.mockRestore()
  })

  it("redirects to sign-in when clerk is disabled", async () => {
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })
    await renderPage()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/sign-in", { replace: true })
    })
  })

  it("redirects to sign-in when the user is signed out", async () => {
    setupUserContext({ loggedIn: false })
    await renderPage()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/sign-in", { replace: true })
    })
  })

  it("redirects to settings when the flow is missing", async () => {
    await renderPage("")

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(getMyAccountSettingsPath(), { replace: true })
    })
  })
})
