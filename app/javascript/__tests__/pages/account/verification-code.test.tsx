import React from "react"
import { useSignIn, useSignUp, useAuth } from "@clerk/react"
import { t } from "@bloom-housing/ui-components"
import { act, screen, waitFor, cleanup, fireEvent } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useLocation, useNavigate } from "react-router"
import EnterVerificationCode from "../../../pages/account/verification-code"
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../../__util__/renderUtils"
import { setupUserContext } from "../../__util__/accountUtils"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"
import { AUTH_FLOW } from "../../../modules/constants"
import { authorizeHousingCounselor, getProfile } from "../../../api/authApiService"

jest.mock("@clerk/react", () => {
  const Clerk = jest.requireActual("@clerk/react")
  return {
    ...Clerk,
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
    useAuth: jest.fn(() => ({
      isLoaded: true,
      isSignedIn: false,
      getToken: jest.fn().mockResolvedValue("clerk-session-token"),
    })),
    useSignUp: jest.fn(),
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

jest.mock("../../../api/authApiService", () => ({
  ...jest.requireActual("../../../api/authApiService"),
  authorizeHousingCounselor: jest.fn(),
  getProfile: jest.fn(),
}))
const expireResendVerificationCode = () => {
  for (let remaining = 30; remaining > 0; remaining--) {
    act(() => {
      jest.advanceTimersByTime(1000)
    })
  }
}

describe("<EnterVerificationCode />", () => {
  let originalLocation: Location
  let mockNavigate: jest.Mock
  let mockSignUpCreate: jest.Mock
  let mockVerifySignUpCode: jest.Mock
  let mockSendSignUpCode: jest.Mock
  let mockFinalizeSignUp: jest.Mock
  let mockVerifySignInCode: jest.Mock
  let mockSendSignInCode: jest.Mock
  let mockFinalizeSignIn: jest.Mock
  let mockSignUpResource: {
    status: string
    unverifiedFields: string[]
    missingFields: string[]
    create: jest.Mock
    verifications: { sendEmailCode: jest.Mock; verifyEmailCode: jest.Mock }
    finalize: jest.Mock
  }
  let mockVerifyResetCode: jest.Mock
  let mockSendResetCode: jest.Mock
  let mockSignInResource: {
    status: string
    emailCode: { verifyCode: jest.Mock; sendCode: jest.Mock }
    resetPasswordEmailCode: { verifyCode: jest.Mock; sendCode: jest.Mock }
    finalize: jest.Mock
  }

  beforeEach(async () => {
    jest.useFakeTimers()
    document.documentElement.lang = "en"
    document.title = "DAHLIA San Francisco Housing Portal"
    originalLocation = mockWindowLocation()
    setupUserContext({ loggedIn: false })
    mockNavigate = jest.fn()
    mockSignUpCreate = jest.fn().mockResolvedValue({ error: null })
    mockVerifySignUpCode = jest.fn().mockResolvedValue({ error: null })
    mockSendSignUpCode = jest.fn().mockResolvedValue({ error: null })
    mockFinalizeSignUp = jest.fn().mockImplementation(async (params?: { navigate?: unknown }) => {
      const navigate = params?.navigate as
        | ((arg: { decorateUrl: (url: string) => string }) => Promise<void> | void)
        | undefined
      if (navigate) {
        await navigate({ decorateUrl: (url: string) => url })
      }
    })
    mockVerifySignInCode = jest.fn().mockResolvedValue({ error: null })
    mockSendSignInCode = jest.fn().mockResolvedValue({ error: null })
    mockFinalizeSignIn = jest.fn().mockImplementation(async (params?: { navigate?: unknown }) => {
      const navigate = params?.navigate as
        | ((arg: { decorateUrl: (url: string) => string }) => Promise<void> | void)
        | undefined
      if (navigate) {
        await navigate({ decorateUrl: (url: string) => url })
      }
    })
    mockSignUpResource = {
      status: "missing_requirements",
      unverifiedFields: ["email_address"],
      missingFields: [],
      create: mockSignUpCreate,
      verifications: {
        sendEmailCode: mockSendSignUpCode,
        verifyEmailCode: mockVerifySignUpCode,
      },
      finalize: mockFinalizeSignUp,
    }
    mockVerifyResetCode = jest.fn().mockResolvedValue({ error: null })
    mockSendResetCode = jest.fn().mockResolvedValue({ error: null })
    mockSignInResource = {
      status: "complete",
      emailCode: { verifyCode: mockVerifySignInCode, sendCode: mockSendSignInCode },
      resetPasswordEmailCode: { verifyCode: mockVerifyResetCode, sendCode: mockSendResetCode },
      finalize: mockFinalizeSignIn,
    }
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/create-account/code",
      state: { email: "test@example.com", flow: AUTH_FLOW.CREATE_ACCOUNT },
    })
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
    ;(useSignUp as jest.Mock).mockReturnValue({
      fetchStatus: "idle",
      signUp: mockSignUpResource,
    })
    ;(useSignIn as jest.Mock).mockReturnValue({
      fetchStatus: "idle",
      signIn: mockSignInResource,
    })
    ;(getProfile as jest.Mock).mockResolvedValue(undefined)
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)
  })

  afterEach(() => {
    restoreWindowLocation(originalLocation)
    cleanup()
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it("shows the enter code page", () => {
    expect(
      screen.getByRole("heading", { name: t("createAccount.checkEmail"), level: 1 })
    ).not.toBeNull()
    expect(screen.getByText(t("createAccount.weSentCodeTo"))).not.toBeNull()
    expect(screen.getByText("test@example.com")).not.toBeNull()
    expect(
      screen.getByRole("link", { name: t("createAccount.editEmail") }).getAttribute("href")
    ).toBe("/create-account")
    expect(screen.getByRole("group", { name: t("createAccount.enterCode") })).not.toBeNull()
    expect(screen.getAllByRole("textbox")).toHaveLength(6)
    expect(screen.getByRole("button", { name: t("createAccount.confirmCode") })).not.toBeNull()
    expect(screen.getByText(t("createAccount.emailSent"))).not.toBeNull()
    expect(screen.getByText(t("createAccount.sendAgainIn", { smart_count: 30 }))).not.toBeNull()
    expect(screen.queryByRole("button", { name: t("createAccount.sendAgain") })).toBeNull()
    expect(screen.getByRole("button", { name: t("createAccount.howToUseCode") })).not.toBeNull()
    expect(screen.getByRole("heading", { name: t("createAccount.getHelp") })).not.toBeNull()
    expect(
      screen
        .getByRole("link", { name: /how to create an account or find help/i })
        .getAttribute("href")
    ).toBe("https://www.sf.gov/learn-how-to-create-dahlia-account")
  })

  it("shows the validation error for an incomplete code", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const digits = screen.getAllByRole("textbox")

    await user.click(digits[0])
    await user.keyboard("123")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

    await waitFor(() => {
      const error = screen.getByTestId("error-message")
      expect(error).toHaveTextContent(t("createAccount.codeInvalid.p1"))
      expect(error).toHaveTextContent(t("createAccount.codeInvalid.p2"))
    })
    digits.forEach((digit) => expect(digit).toBeInvalid())
    expect(mockVerifySignUpCode).not.toHaveBeenCalled()
  })

  it("does not show an error before submit", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const digits = screen.getAllByRole("textbox")

    await user.click(digits[0])
    await user.keyboard("123")
    await user.tab()

    expect(screen.queryByTestId("error-message")).toBeNull()
    digits.forEach((digit) => expect(digit).not.toBeInvalid())
  })

  it("fills all fields when a 6-digit code is pasted", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const digits = screen.getAllByRole("textbox")

    await user.click(digits[0])
    await user.paste("123456")

    expect(digits.map((digit) => (digit as HTMLInputElement).value)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
    ])
  })

  it("verifies a valid code for create account", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    mockSignUpResource.status = "complete"

    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

    await waitFor(() => {
      expect(mockVerifySignUpCode).toHaveBeenCalledWith({ code: "123456" })
    })
    expect(mockFinalizeSignUp).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith("/add-password")
    expect(mockVerifySignInCode).not.toHaveBeenCalled()
    expect(screen.queryByTestId("error-message")).toBeNull()
  })

  it("shows an error when sign-up verification does not result in complete status", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    mockSignUpResource.status = "some_unhandled_status"

    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

    await waitFor(() => {
      expect(mockVerifySignUpCode).toHaveBeenCalledWith({ code: "123456" })
    })
    expect(consoleError).toHaveBeenCalledWith("Account creation failed:", mockSignUpResource)
    expect(mockFinalizeSignUp).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it("resends the code", async () => {
    expireResendVerificationCode()

    fireEvent.click(screen.getByRole("button", { name: t("createAccount.sendAgain") }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(mockSendSignUpCode).toHaveBeenCalledWith()
    expect(screen.getByText(t("createAccount.emailSent"))).not.toBeNull()
    expect(screen.getByText(t("createAccount.sendAgainIn", { smart_count: 30 }))).not.toBeNull()
    expect(screen.queryByRole("button", { name: t("createAccount.sendAgain") })).toBeNull()
  })

  it("logs an error when sign-up resend-code does not return missing requirements status", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    mockSignUpResource.status = "some_unhandled_status"

    expireResendVerificationCode()
    fireEvent.click(screen.getByRole("button", { name: t("createAccount.sendAgain") }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(mockSendSignUpCode).toHaveBeenCalledWith()
    expect(consoleError).toHaveBeenCalledWith("Sign up code resend error", mockSignUpResource)
    expect(screen.getByRole("button", { name: t("createAccount.sendAgain") })).not.toBeNull()
    expect(screen.queryByText(t("createAccount.emailSent"))).toBeNull()

    consoleError.mockRestore()
  })

  it("restores send again after the resend countdown", () => {
    expect(screen.getByText(t("createAccount.sendAgainIn", { smart_count: 30 }))).not.toBeNull()

    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(screen.getByText(t("createAccount.sendAgainIn", { smart_count: 29 }))).not.toBeNull()

    for (let remaining = 28; remaining > 0; remaining--) {
      act(() => {
        jest.advanceTimersByTime(1000)
      })
    }
    expect(screen.getByText(t("createAccount.sendAgainIn", { smart_count: 1 }))).not.toBeNull()

    expireResendVerificationCode()

    expect(screen.getByRole("button", { name: t("createAccount.sendAgain") })).not.toBeNull()
    expect(screen.queryByText(t("createAccount.emailSent"))).toBeNull()
    expect(screen.queryByText(t("createAccount.sendAgainIn", { smart_count: 1 }))).toBeNull()
  })

  it("redirects to the start of the flow when clerk is disabled", async () => {
    cleanup()
    document.title = "DAHLIA San Francisco Housing Portal"
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    // The fallback is now flow-aware: this is the create-account flow.
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/create-account")
    })
  })

  it("redirects to the start of the flow when email is missing", async () => {
    cleanup()
    document.title = "DAHLIA San Francisco Housing Portal"
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/create-account/code",
      state: { flow: AUTH_FLOW.CREATE_ACCOUNT },
    })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/create-account")
    })
  })

  it("shows the sign-in enter code page", async () => {
    cleanup()
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/sign-in/code",
      state: { email: "test@example.com", flow: AUTH_FLOW.SIGN_IN },
    })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    expect(
      screen.getByRole("link", { name: t("createAccount.editEmail") }).getAttribute("href")
    ).toBe("/sign-in")
    expect(
      screen.getByRole("link", { name: /how to sign in or find help/i }).getAttribute("href")
    ).toBe("https://www.sf.gov/sign-in-to-your-dahlia-account")
  })

  it("verifies a valid code for sign in", async () => {
    cleanup()
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/sign-in/code",
      state: { email: "test@example.com", flow: AUTH_FLOW.SIGN_IN },
    })
    mockSignInResource.status = "complete"
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

    await waitFor(() => {
      expect(mockVerifySignInCode).toHaveBeenCalledWith({ code: "123456" })
    })
    expect(mockFinalizeSignIn).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith("/account")
    expect(mockVerifySignUpCode).not.toHaveBeenCalled()
  })

  it("redirects to the apply intro after sign in when a redirect url is present", async () => {
    cleanup()
    const redirectUrl = "/listings/a0W0P00000GlKfBUAV/apply-welcome/intro"
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/sign-in/code",
      state: { email: "test@example.com", redirectUrl, flow: AUTH_FLOW.SIGN_IN },
    })
    mockSignInResource.status = "complete"
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

    await waitFor(() => {
      expect(mockFinalizeSignIn).toHaveBeenCalled()
    })
    expect(mockNavigate).toHaveBeenCalledWith(redirectUrl)
    expect(mockVerifySignUpCode).not.toHaveBeenCalled()
  })

  it("authenticates a housing counselor with Clerk after verifying the sign-in code", async () => {
    cleanup()
    const mockGetToken = jest.fn().mockResolvedValue("clerk-session-token")
    ;(useAuth as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      getToken: mockGetToken,
    })
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/sign-in/code",
      state: {
        email: "test@example.com",
        housingCounselorToken: "jwt.token",
        flow: AUTH_FLOW.SIGN_IN,
      },
    })
    mockSignInResource.status = "complete"
    ;(authorizeHousingCounselor as jest.Mock).mockResolvedValue(undefined)
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

    await waitFor(() => {
      expect(authorizeHousingCounselor).toHaveBeenCalledWith("jwt.token", "clerk-session-token")
    })
    expect(mockFinalizeSignIn).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith("/account")
  })

  it("shows an error when sign-in verification does not result in the correct status", async () => {
    cleanup()
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/sign-in/code",
      state: { email: "test@example.com", flow: AUTH_FLOW.SIGN_IN },
    })
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    mockSignInResource.status = "some_unhandled_status"
    mockVerifySignInCode.mockResolvedValue({ error: null })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

    await waitFor(() => {
      expect(mockVerifySignInCode).toHaveBeenCalledWith({ code: "123456" })
    })
    expect(consoleError).toHaveBeenCalledWith("Sign in failed:", mockSignInResource)
    expect(mockFinalizeSignIn).not.toHaveBeenCalled()
    expect(mockSignUpCreate).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it("shows an error when sign-in code verification fails", async () => {
    cleanup()
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/sign-in/code",
      state: { email: "test@example.com", flow: AUTH_FLOW.SIGN_IN },
    })
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    mockVerifySignInCode.mockResolvedValue({
      error: { errors: [{ code: "some_code_verification_error" }] },
    })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

    await waitFor(() => {
      expect(mockVerifySignInCode).toHaveBeenCalledWith({ code: "123456" })
    })
    // The source logs the ClerkError from the failed verifyCode call, not the resource.
    expect(consoleError).toHaveBeenCalledWith("Code verification error:", {
      errors: [{ code: "some_code_verification_error" }],
    })
    expect(mockFinalizeSignIn).not.toHaveBeenCalled()
    expect(mockSignUpCreate).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it("resends the code for sign in", async () => {
    cleanup()
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/sign-in/code",
      state: { email: "test@example.com", flow: AUTH_FLOW.SIGN_IN },
    })
    mockSignInResource.status = "needs_first_factor"
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    expireResendVerificationCode()
    fireEvent.click(screen.getByRole("button", { name: t("createAccount.sendAgain") }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(mockSendSignInCode).toHaveBeenCalledWith()
    expect(screen.getByText(t("createAccount.emailSent"))).not.toBeNull()
    expect(screen.getByText(t("createAccount.sendAgainIn", { smart_count: 30 }))).not.toBeNull()
    expect(screen.queryByRole("button", { name: t("createAccount.sendAgain") })).toBeNull()
  })

  it("logs an error when sign-in resend does not result in the correct signIn status", async () => {
    cleanup()
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/sign-in/code",
      state: { email: "test@example.com", flow: AUTH_FLOW.SIGN_IN },
    })
    mockSignInResource.status = "some_unhandled_status"
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    expireResendVerificationCode()
    fireEvent.click(screen.getByRole("button", { name: t("createAccount.sendAgain") }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(mockSendSignInCode).toHaveBeenCalledWith()
    expect(consoleError).toHaveBeenCalledWith("Sign in code resend error", mockSignInResource)
    expect(screen.getByRole("button", { name: t("createAccount.sendAgain") })).not.toBeNull()
    expect(screen.queryByText(t("createAccount.emailSent"))).toBeNull()

    consoleError.mockRestore()
  })

  it("redirects to sign-in when email is missing from the sign-in code page", async () => {
    cleanup()
    document.title = "DAHLIA San Francisco Housing Portal"
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/sign-in/code",
      state: { flow: AUTH_FLOW.SIGN_IN },
    })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/sign-in")
    })
  })

  it("does not redirect a logged-out user who has email from an in-progress flow", () => {
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(
      screen.getByRole("heading", { name: t("createAccount.checkEmail"), level: 1 })
    ).not.toBeNull()
  })

  it("redirects to add-profile when the user is signed in without a profile", async () => {
    cleanup()
    document.title = "DAHLIA San Francisco Housing Portal"
    setupUserContext({ loggedIn: true, hasProfile: false })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/add-profile")
    })
  })

  it("redirects to account when the user has already set up their profile", async () => {
    cleanup()
    document.title = "DAHLIA San Francisco Housing Portal"
    setupUserContext({ loggedIn: true })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/account")
    })
  })

  const submitTransferCode = async () => {
    cleanup()
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/sign-in/code",
      state: { email: "test@example.com", flow: AUTH_FLOW.SIGN_IN },
    })
    mockVerifySignInCode.mockResolvedValue({
      error: { errors: [{ code: "sign_up_if_missing_transfer" }] },
    })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))
  }

  it("transfers sign-in to sign-up and navigates to add password", async () => {
    mockSignUpResource.status = "complete"

    await submitTransferCode()

    await waitFor(() => {
      expect(mockSignUpCreate).toHaveBeenCalledWith({ transfer: true })
    })
    expect(mockFinalizeSignUp).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith("/add-password")
    expect(mockFinalizeSignIn).not.toHaveBeenCalled()
  })

  it("shows an error when transfer to sign-up returns an error", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    const transferError = { errors: [{ code: "some_transfer_error" }] }
    mockSignUpCreate.mockResolvedValue({ error: transferError })

    await submitTransferCode()

    await waitFor(() => {
      expect(mockSignUpCreate).toHaveBeenCalledWith({ transfer: true })
    })
    expect(consoleError).toHaveBeenCalledWith("Account creation error", transferError)
    expect(mockFinalizeSignUp).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it("shows an error when transfer to sign-up is not complete", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    mockSignUpResource.status = "missing_requirements"

    await submitTransferCode()

    await waitFor(() => {
      expect(mockSignUpCreate).toHaveBeenCalledWith({ transfer: true })
    })
    expect(consoleError).toHaveBeenCalledWith("Account creation error:", mockSignUpResource)
    expect(mockFinalizeSignUp).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it("logs when transfer to sign-up is not ready", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    ;(useSignUp as jest.Mock).mockReturnValue({
      fetchStatus: "fetching",
      signUp: mockSignUpResource,
    })

    await submitTransferCode()

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith("Sign up not ready")
    })
    expect(mockSignUpCreate).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })

  const renderForgotPasswordPage = async () => {
    cleanup()
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/forgot-password/code",
      state: { email: "test@example.com", flow: AUTH_FLOW.FORGOT_PASSWORD },
    })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)
  }

  const submitCode = async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))
  }

  it("verifies a valid code for forgot password", async () => {
    mockSignInResource.status = "needs_new_password"
    await renderForgotPasswordPage()

    await submitCode()

    await waitFor(() => {
      expect(mockVerifyResetCode).toHaveBeenCalledWith({ code: "123456" })
    })
    expect(mockNavigate).toHaveBeenCalledWith("/reset-password", {
      state: { email: "test@example.com", flow: AUTH_FLOW.FORGOT_PASSWORD, code: "123456" },
    })
    expect(mockFinalizeSignIn).not.toHaveBeenCalled()
  })

  it("shows an error when the forgot password code is invalid", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    const codeError = { errors: [{ code: "form_code_incorrect" }] }
    mockVerifyResetCode.mockResolvedValue({ error: codeError })
    await renderForgotPasswordPage()

    await submitCode()

    await waitFor(() => {
      expect(mockVerifyResetCode).toHaveBeenCalledWith({ code: "123456" })
    })
    expect(consoleError).toHaveBeenCalledWith("Reset Password code verification error:", codeError)
    expect(mockNavigate).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it("shows an error when the forgot password verification leaves an unexpected status", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    mockSignInResource.status = "needs_second_factor"
    await renderForgotPasswordPage()

    await submitCode()

    await waitFor(() => {
      expect(mockVerifyResetCode).toHaveBeenCalledWith({ code: "123456" })
    })
    expect(consoleError).toHaveBeenCalledWith(
      "Reset Password code verification error:",
      mockSignInResource
    )
    expect(mockNavigate).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it("resends the forgot password code", async () => {
    mockSignInResource.status = "needs_new_password"
    await renderForgotPasswordPage()

    expireResendVerificationCode()
    fireEvent.click(screen.getByRole("button", { name: t("createAccount.sendAgain") }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(mockSendResetCode).toHaveBeenCalledWith()
  })

  it("does not resend the forgot password code if the request errors", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    const resendError = { errors: [{ code: "form_resend_failed" }] }
    mockSendResetCode.mockResolvedValue({ error: resendError })
    mockSignInResource.status = "needs_new_password"
    await renderForgotPasswordPage()

    expireResendVerificationCode()
    fireEvent.click(screen.getByRole("button", { name: t("createAccount.sendAgain") }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(mockSendResetCode).toHaveBeenCalledWith()
    expect(consoleError).toHaveBeenCalledWith("Reset password code resend error", resendError)

    consoleError.mockRestore()
  })
})
