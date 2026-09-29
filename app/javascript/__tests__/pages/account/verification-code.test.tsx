import React from "react"
import { useSignIn, useSignUp, useAuth, useClerk, useUser } from "@clerk/react"
import { t } from "@bloom-housing/ui-components"
import { act, screen, waitFor, cleanup, fireEvent, within } from "@testing-library/react"
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
import {
  authorizeHousingCounselor,
  getProfile,
  updateAccountWithClerk,
} from "../../../api/authApiService"

// Read lazily by the @clerk/react mock below; the mock- prefix lets jest.mock reference it.
let mockSession: unknown = null

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
    useSession: () => ({ session: mockSession }),
    useSignIn: jest.fn(),
    useClerk: jest.fn(),
    useUser: jest.fn(),
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
  getProfile: jest.fn().mockResolvedValue(undefined),
  updateAccountWithClerk: jest.fn(),
}))

// Clerk recognizes its API errors by this static kind rather than by instanceof.
class ReverificationRequiredError extends Error {
  static kind = "ClerkAPIResponseError"
  errors = [{ code: "session_reverification_required" }]
}
const updateLoginEmail = (newEmailOverrides = {}) => {
  const previous = { id: "old", emailAddress: "test@example.com", destroy: jest.fn() }
  const newEmail = {
    id: "new",
    emailAddress: "new@example.com",
    verification: { status: "unverified" },
    attemptVerification: jest.fn(),
    prepareVerification: jest.fn().mockResolvedValue(undefined),
    ...newEmailOverrides,
  }
  if (!newEmail.attemptVerification.getMockImplementation()) {
    // Verifying marks the address itself verified, as Clerk's resource does.
    newEmail.attemptVerification.mockImplementation(() => {
      newEmail.verification = { status: "verified" }
      return Promise.resolve({ id: "new", verification: { status: "verified" } })
    })
  }
  return {
    emailAddresses: [previous, newEmail],
    primaryEmailAddress: previous,
    update: jest.fn(),
    previous,
    newEmail,
  }
}

// These walk the whole flow, including the reverification prompt, and run slowly alongside the
// rest of this file under fake timers.
const SLOW_STEP_MS = 8000
const SLOW_TEST_MS = 20000

const mockReverifySession = () => ({
  startVerification: jest.fn().mockResolvedValue({
    status: "needs_first_factor",
    supportedFirstFactors: [
      { strategy: "email_code", emailAddressId: "old", safeIdentifier: "t***@example.com" },
    ],
  }),
  prepareFirstFactorVerification: jest.fn().mockResolvedValue({ status: "needs_first_factor" }),
  attemptFirstFactorVerification: jest.fn().mockResolvedValue({ status: "complete" }),
})

const renderUpdateEmailFlow = async (user: unknown) => {
  cleanup()
  setupUserContext({ loggedIn: true })
  ;(useLocation as jest.Mock).mockReturnValue({
    pathname: "/update-email/code",
    state: { email: "new@example.com", flow: AUTH_FLOW.UPDATE_EMAIL },
  })
  ;(useUser as jest.Mock).mockReturnValue({ isLoaded: true, isSignedIn: true, user })
  await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)
}

const submitCode = async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
  await user.click(screen.getAllByRole("textbox")[0])
  await user.paste("123456")
  await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))
}
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
  let mockSignUpVerifyEmailCode: jest.Mock
  let mockSignUpSendEmailCode: jest.Mock
  let mockSignUpFinalize: jest.Mock
  let mockSignInVerifyCode: jest.Mock
  let mockSignInSendCode: jest.Mock
  let mockSignInFinalize: jest.Mock
  let mockResetPasswordVerifyCode: jest.Mock
  let mockResetPasswordSendCode: jest.Mock
  let mockSignUpResource: {
    status: string
    emailAddress: string
    unverifiedFields: string[]
    missingFields: string[]
    verifications: {
      verifyEmailCode: jest.Mock
      sendEmailCode: jest.Mock
    }
    create: jest.Mock
    finalize: jest.Mock
  }
  let mockSignInResource: {
    status: string
    emailAddress: string
    emailCode: {
      verifyCode: jest.Mock
      sendCode: jest.Mock
    }
    resetPasswordEmailCode: {
      verifyCode: jest.Mock
      sendCode: jest.Mock
    }
    finalize: jest.Mock
  }

  beforeEach(async () => {
    mockSession = null
    document.documentElement.lang = "en"
    document.title = "DAHLIA San Francisco Housing Portal"
    originalLocation = mockWindowLocation()
    window.location.replace = jest.fn()
    setupUserContext({ loggedIn: false })
    mockNavigate = jest.fn()
    mockSignUpCreate = jest.fn().mockResolvedValue({ error: undefined })
    mockSignUpVerifyEmailCode = jest.fn().mockResolvedValue({ error: undefined })
    mockSignUpSendEmailCode = jest.fn().mockResolvedValue({ error: undefined })
    mockSignUpFinalize = jest.fn().mockImplementation(async ({ navigate }) => {
      await navigate({ decorateUrl: (url: string) => url })
      return { error: undefined }
    })
    mockSignInVerifyCode = jest.fn().mockResolvedValue({ error: undefined })
    mockSignInSendCode = jest.fn().mockResolvedValue({ error: undefined })
    // verifySignInCode calls finalize() with no args (see SignInFlow.tsx for why), then navigates
    // manually, so this mock must not assume a `navigate` callback is always passed.
    mockSignInFinalize = jest.fn().mockImplementation(async (params?: { navigate?: unknown }) => {
      if (typeof params?.navigate === "function") {
        await (params.navigate as (args: { decorateUrl: (url: string) => string }) => unknown)({
          decorateUrl: (url: string) => url,
        })
      }
      return { error: undefined }
    })
    mockResetPasswordVerifyCode = jest.fn().mockResolvedValue({ error: undefined })
    mockResetPasswordSendCode = jest.fn().mockResolvedValue({ error: undefined })
    mockSignUpResource = {
      status: "missing_requirements",
      emailAddress: "test@example.com",
      unverifiedFields: ["email_address"],
      missingFields: [],
      verifications: {
        verifyEmailCode: mockSignUpVerifyEmailCode,
        sendEmailCode: mockSignUpSendEmailCode,
      },
      create: mockSignUpCreate,
      finalize: mockSignUpFinalize,
    }
    mockSignInResource = {
      status: "needs_first_factor",
      emailAddress: "test@example.com",
      emailCode: {
        verifyCode: mockSignInVerifyCode,
        sendCode: mockSignInSendCode,
      },
      resetPasswordEmailCode: {
        verifyCode: mockResetPasswordVerifyCode,
        sendCode: mockResetPasswordSendCode,
      },
      finalize: mockSignInFinalize,
    }
    jest.useFakeTimers()
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/create-account/code",
      state: { email: "test@example.com", flow: AUTH_FLOW.CREATE_ACCOUNT },
    })
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
    ;(useClerk as jest.Mock).mockReturnValue({ client: undefined })
    ;(useSignUp as jest.Mock).mockReturnValue({
      fetchStatus: "idle",
      signUp: mockSignUpResource,
    })
    ;(useSignIn as jest.Mock).mockReturnValue({
      fetchStatus: "idle",
      signIn: mockSignInResource,
    })
    ;(useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      user: null,
    })
    ;(getProfile as jest.Mock).mockResolvedValue(undefined)
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)
  })

  afterEach(() => {
    restoreWindowLocation(originalLocation)
    cleanup()
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
    expect(mockSignUpVerifyEmailCode).not.toHaveBeenCalled()
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
    mockSignUpResource.status = "complete"

    await submitCode()
    await waitFor(() => {
      expect(mockSignUpVerifyEmailCode).toHaveBeenCalledWith({ code: "123456" })
    })
    expect(mockSignUpFinalize).toHaveBeenCalledTimes(1)
    expect(mockSignInVerifyCode).not.toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith("/add-password", {
      state: { flow: AUTH_FLOW.CREATE_ACCOUNT },
    })
    expect(screen.queryByTestId("error-message")).toBeNull()
  })

  it("resends the code", async () => {
    expireResendVerificationCode()

    fireEvent.click(screen.getByRole("button", { name: t("createAccount.sendAgain") }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(mockSignUpSendEmailCode).toHaveBeenCalledTimes(1)
    expect(screen.getByText(t("createAccount.emailSent"))).not.toBeNull()
    expect(screen.getByText(t("createAccount.sendAgainIn", { smart_count: 30 }))).not.toBeNull()
    expect(screen.queryByRole("button", { name: t("createAccount.sendAgain") })).toBeNull()
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

  it("redirects to sign-in when clerk is disabled", async () => {
    cleanup()
    document.title = "DAHLIA San Francisco Housing Portal"
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/sign-in")
    })
  })

  it("redirects to sign-in when email is missing", async () => {
    cleanup()
    document.title = "DAHLIA San Francisco Housing Portal"
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/create-account/code",
      state: { flow: AUTH_FLOW.CREATE_ACCOUNT },
    })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/sign-in")
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
    await submitCode()

    await waitFor(() => {
      expect(mockSignInVerifyCode).toHaveBeenCalledWith({ code: "123456" })
    })
    expect(mockSignInFinalize).toHaveBeenCalledTimes(1)
    expect(mockSignUpVerifyEmailCode).not.toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith("/account")
  })

  it("transfers from sign-in to create-an-account flow when account does not exist", async () => {
    cleanup()
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/sign-in/code",
      state: { email: "test@example.com", flow: AUTH_FLOW.SIGN_IN },
    })
    mockSignInVerifyCode.mockResolvedValue({
      error: { errors: [{ code: "sign_up_if_missing_transfer" }] },
    })
    mockSignUpResource.status = "complete"
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

    await waitFor(() => {
      expect(mockSignInVerifyCode).toHaveBeenCalledWith({ code: "123456" })
      expect(mockSignUpCreate).toHaveBeenCalledWith({ transfer: true })
    })
    expect(mockSignUpFinalize).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith("/add-password", {
      state: { flow: AUTH_FLOW.CREATE_ACCOUNT },
    })
  })

  it("does not transfer to create account when sign-up is not ready", async () => {
    cleanup()
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/sign-in/code",
      state: { email: "test@example.com", flow: AUTH_FLOW.SIGN_IN },
    })
    ;(useSignUp as jest.Mock).mockReturnValue({
      fetchStatus: "fetching",
      signUp: mockSignUpResource,
    })
    mockSignInVerifyCode.mockResolvedValue({
      error: { errors: [{ code: "sign_up_if_missing_transfer" }] },
    })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

    await waitFor(() => {
      expect(mockSignInVerifyCode).toHaveBeenCalledWith({ code: "123456" })
    })
    expect(mockSignUpCreate).not.toHaveBeenCalled()
    expect(mockSignUpFinalize).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it("shows an invalid code error when transfer to create account fails", async () => {
    cleanup()
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    const createError = { errors: [{ code: "unexpected_failure" }] }
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/sign-in/code",
      state: { email: "test@example.com", flow: AUTH_FLOW.SIGN_IN },
    })
    mockSignInVerifyCode.mockResolvedValue({
      error: { errors: [{ code: "sign_up_if_missing_transfer" }] },
    })
    mockSignUpCreate.mockResolvedValue({ error: createError })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

    await waitFor(() => {
      expect(mockSignUpCreate).toHaveBeenCalledWith({ transfer: true })
    })
    expect(mockSignUpFinalize).not.toHaveBeenCalled()
    expect(consoleError).toHaveBeenCalledWith("Account creation error", createError)
    expect(mockNavigate).not.toHaveBeenCalledWith("/add-password", {
      state: { flow: AUTH_FLOW.CREATE_ACCOUNT },
    })

    consoleError.mockRestore()
  })

  it("shows an invalid code error when transfer returns a non-complete status", async () => {
    cleanup()
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/sign-in/code",
      state: { email: "test@example.com", flow: AUTH_FLOW.SIGN_IN },
    })
    mockSignInVerifyCode.mockResolvedValue({
      error: { errors: [{ code: "sign_up_if_missing_transfer" }] },
    })
    mockSignUpResource.status = "missing_requirements"
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

    await waitFor(() => {
      expect(mockSignUpCreate).toHaveBeenCalledWith({ transfer: true })
    })
    expect(mockSignUpFinalize).not.toHaveBeenCalled()
    expect(consoleError).toHaveBeenCalledWith("Account creation error:", mockSignUpResource)
    expect(mockNavigate).not.toHaveBeenCalledWith("/add-password", {
      state: { flow: AUTH_FLOW.CREATE_ACCOUNT },
    })

    consoleError.mockRestore()
  })

  it("redirects to the apply intro after sign in when a redirect url is present", async () => {
    cleanup()
    const redirectUrl = "/listings/a0W0P00000GlKfBUAV/apply-welcome/intro"
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/sign-in/code",
      state: { email: "test@example.com", flow: AUTH_FLOW.SIGN_IN, redirectUrl },
    })
    mockSignInResource.status = "complete"
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)
    await submitCode()

    await waitFor(() => {
      expect(mockSignInVerifyCode).toHaveBeenCalledWith({ code: "123456" })
    })
    expect(mockSignInFinalize).toHaveBeenCalledTimes(1)
    expect(mockSignUpVerifyEmailCode).not.toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith(redirectUrl)
  })

  it("authenticates a housing counselor with Clerk after verifying the sign-in code", async () => {
    cleanup()
    // Fake timers stop React finishing its render after submit. This test
    // doesn't check the countdown, so real timers are fine here.
    jest.useRealTimers()
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
    const user = userEvent.setup()
    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

    await waitFor(() => {
      expect(authorizeHousingCounselor).toHaveBeenCalledWith("jwt.token", "clerk-session-token")
    })
    expect(mockSignInFinalize).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith("/account")
  })

  it("signs the housing counselor in and redirects with hcAccess=0 when access is denied", async () => {
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
    ;(authorizeHousingCounselor as jest.Mock).mockRejectedValue(new Error("forbidden"))
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

    await waitFor(() => {
      expect(authorizeHousingCounselor).toHaveBeenCalledWith("jwt.token", "clerk-session-token")
    })
    expect(mockSignInFinalize).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith("/account?hcAccess=0")
  })

  it("resends the code for sign in", async () => {
    cleanup()
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/sign-in/code",
      state: { email: "test@example.com", flow: AUTH_FLOW.SIGN_IN },
    })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    expireResendVerificationCode()
    fireEvent.click(screen.getByRole("button", { name: t("createAccount.sendAgain") }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(mockSignInSendCode).toHaveBeenCalledTimes(1)
    expect(screen.getByText(t("createAccount.emailSent"))).not.toBeNull()
    expect(screen.getByText(t("createAccount.sendAgainIn", { smart_count: 30 }))).not.toBeNull()
    expect(screen.queryByRole("button", { name: t("createAccount.sendAgain") })).toBeNull()
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
  it("verifies a valid code for forgot password", async () => {
    cleanup()
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/forgot-password/code",
      state: { email: "test@example.com", flow: AUTH_FLOW.FORGOT_PASSWORD },
    })
    mockSignInResource.status = "needs_new_password"
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)
    await submitCode()

    await waitFor(() => {
      expect(mockResetPasswordVerifyCode).toHaveBeenCalledWith({ code: "123456" })
    })
    expect(mockNavigate).toHaveBeenCalledWith("/reset-password", {
      state: { email: "test@example.com", flow: AUTH_FLOW.FORGOT_PASSWORD, code: "123456" },
    })
    expect(mockSignInFinalize).not.toHaveBeenCalled()
  })

  it("shows an error when the forgot password code is invalid", async () => {
    cleanup()
    jest.spyOn(console, "error").mockImplementation(() => {})
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/forgot-password/code",
      state: { email: "test@example.com", flow: AUTH_FLOW.FORGOT_PASSWORD },
    })
    mockResetPasswordVerifyCode.mockResolvedValue({ error: new Error("bad code") })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)
    await submitCode()

    await act(async () => {
      await Promise.resolve()
    })

    expect(mockResetPasswordVerifyCode).toHaveBeenCalledWith({ code: "123456" })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("resend forgot password code", async () => {
    cleanup()
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/forgot-password/code",
      state: { email: "test@example.com", flow: AUTH_FLOW.FORGOT_PASSWORD },
    })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    expireResendVerificationCode()
    fireEvent.click(screen.getByRole("button", { name: t("createAccount.sendAgain") }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(mockResetPasswordSendCode).toHaveBeenCalledTimes(1)
  })
  it("resends the forgot password code even if email address is missing", async () => {
    cleanup()
    mockSignInResource.emailAddress = ""
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/forgot-password/code",
      state: { email: "test@example.com", flow: AUTH_FLOW.FORGOT_PASSWORD },
    })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    expireResendVerificationCode()
    fireEvent.click(screen.getByRole("button", { name: t("createAccount.sendAgain") }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(mockResetPasswordSendCode).toHaveBeenCalledTimes(1)
  })

  it("does not resend the forgot password code if there is a request error", async () => {
    cleanup()
    jest.spyOn(console, "error").mockImplementation(() => {})
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/forgot-password/code",
      state: { email: "test@example.com", flow: AUTH_FLOW.FORGOT_PASSWORD },
    })
    mockResetPasswordSendCode.mockResolvedValue({ error: new Error("resend failed") })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    expireResendVerificationCode()
    fireEvent.click(screen.getByRole("button", { name: t("createAccount.sendAgain") }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(mockResetPasswordSendCode).toHaveBeenCalledTimes(1)
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
  it("verifies the update email code, swaps the primary email, and syncs the profile", async () => {
    ;(updateAccountWithClerk as jest.Mock).mockResolvedValue({ email: "new@example.com" })
    const user = updateLoginEmail()
    await renderUpdateEmailFlow(user)
    await submitCode()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(expect.any(String), {
        state: { emailChanged: true },
      })
    })
    expect(user.newEmail.attemptVerification).toHaveBeenCalledWith({ code: "123456" })
    expect(user.update).toHaveBeenCalledWith({ primaryEmailAddressId: "new" })
    expect(user.previous.destroy).toHaveBeenCalled()
    expect(updateAccountWithClerk).toHaveBeenCalledWith(
      expect.objectContaining({ email: "new@example.com" }),
      "clerk-session-token"
    )
  })

  it(
    "asks the user to confirm it's them before making the new email their login",
    async () => {
      ;(updateAccountWithClerk as jest.Mock).mockResolvedValue({ email: "new@example.com" })
      const user = updateLoginEmail()
      user.update.mockRejectedValueOnce(new ReverificationRequiredError())
      mockSession = mockReverifySession()
      await renderUpdateEmailFlow(user)
      await submitCode()

      expect(
        await screen.findByRole(
          "heading",
          { name: /confirm it's you/i, level: 1 },
          { timeout: SLOW_STEP_MS }
        )
      ).not.toBeNull()
      expect(mockNavigate).not.toHaveBeenCalled()

      const clicker = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      await clicker.click(screen.getByRole("button", { name: /send code/i }))
      // The page's own code field is hidden underneath, so target the prompt's form.
      const confirmButton = await screen.findByRole(
        "button",
        { name: /confirm code/i },
        { timeout: SLOW_STEP_MS }
      )
      const promptForm = confirmButton.closest("form") as HTMLElement
      await clicker.click(within(promptForm).getByLabelText("1"))
      await clicker.paste("654321")
      await clicker.click(confirmButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(expect.any(String), {
          state: { emailChanged: true },
        })
      })
      expect(user.update).toHaveBeenCalledTimes(2)
    },
    SLOW_TEST_MS
  )

  it(
    "keeps the verified code when the user cancels confirming it's them",
    async () => {
      const user = updateLoginEmail()
      user.update.mockRejectedValueOnce(new ReverificationRequiredError())
      mockSession = mockReverifySession()
      await renderUpdateEmailFlow(user)
      await submitCode()

      const clicker = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      await clicker.click(
        await screen.findByRole("button", { name: /cancel/i }, { timeout: SLOW_STEP_MS })
      )

      await waitFor(() => {
        expect(screen.queryByRole("heading", { name: /confirm it's you/i })).toBeNull()
      })
      expect(screen.queryByText(/that code did not work/i)).toBeNull()
      expect(mockNavigate).not.toHaveBeenCalled()

      // Confirming again skips the code, which is already verified.
      ;(updateAccountWithClerk as jest.Mock).mockResolvedValue({ email: "new@example.com" })
      await clicker.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(expect.any(String), {
          state: { emailChanged: true },
        })
      })
      expect(user.newEmail.attemptVerification).toHaveBeenCalledTimes(1)
    },
    SLOW_TEST_MS
  )

  it(
    "shows a general error, not a code error, when making the email primary fails",
    async () => {
      jest.spyOn(console, "error").mockImplementation(() => {})
      const user = updateLoginEmail()
      user.update.mockRejectedValueOnce(new Error("server error"))
      await renderUpdateEmailFlow(user)
      await submitCode()

      expect(
        await screen.findByText(/something went wrong/i, {}, { timeout: SLOW_STEP_MS })
      ).not.toBeNull()
      expect(screen.queryByText(/that code did not work/i)).toBeNull()
      expect(mockNavigate).not.toHaveBeenCalled()
    },
    SLOW_TEST_MS
  )

  it("still finishes when syncing the profile fails", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {})
    ;(updateAccountWithClerk as jest.Mock).mockRejectedValue(new Error("salesforce down"))
    await renderUpdateEmailFlow(updateLoginEmail())
    await submitCode()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(expect.any(String), {
        state: { emailChanged: true },
      })
    })
    expect(console.error).toHaveBeenCalledWith(
      "Sync login email to profile error:",
      expect.any(Error)
    )
  })

  it("does not update the email when there is no user", async () => {
    await renderUpdateEmailFlow(null)
    await submitCode()
    await act(async () => {
      await Promise.resolve()
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("does not update the email when the email is not found", async () => {
    const user = { ...updateLoginEmail(), emailAddresses: [] }
    await renderUpdateEmailFlow(user)
    await submitCode()
    await act(async () => {
      await Promise.resolve()
    })

    expect(user.update).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("does not update the email when the code is not verified", async () => {
    const user = updateLoginEmail({
      attemptVerification: jest.fn().mockResolvedValue({ verification: { status: "unverified" } }),
    })
    await renderUpdateEmailFlow(user)
    await submitCode()
    await act(async () => {
      await Promise.resolve()
    })

    expect(user.update).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("does not update the email when verification throws", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {})
    await renderUpdateEmailFlow(
      updateLoginEmail({ attemptVerification: jest.fn().mockRejectedValue(new Error("bad code")) })
    )
    await submitCode()

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Email change code error:", expect.any(Error))
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("resends the update email code", async () => {
    await renderUpdateEmailFlow(updateLoginEmail())
    expireResendVerificationCode()
    fireEvent.click(screen.getByRole("button", { name: t("createAccount.sendAgain") }))

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: t("createAccount.sendAgain") })).toBeNull()
    })
  })

  it("does not resend the update email code when there is no user", async () => {
    await renderUpdateEmailFlow(null)
    expireResendVerificationCode()
    fireEvent.click(screen.getByRole("button", { name: t("createAccount.sendAgain") }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(screen.getByRole("button", { name: t("createAccount.sendAgain") })).not.toBeNull()
  })

  it("does not resend the update email code when sending fails", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {})
    await renderUpdateEmailFlow(
      updateLoginEmail({
        prepareVerification: jest.fn().mockRejectedValue(new Error("resend failed")),
      })
    )
    expireResendVerificationCode()
    fireEvent.click(screen.getByRole("button", { name: t("createAccount.sendAgain") }))

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Resend email change code error:",
        expect.any(Error)
      )
    })
  })
})
