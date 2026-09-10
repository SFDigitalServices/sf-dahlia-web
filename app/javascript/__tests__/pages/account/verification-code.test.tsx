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
  getProfile: jest.fn().mockResolvedValue(undefined),
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
    document.documentElement.lang = "en"
    document.title = "DAHLIA San Francisco Housing Portal"
    originalLocation = mockWindowLocation()
    window.location.replace = jest.fn()
    setupUserContext({ loggedIn: false })
    mockNavigate = jest.fn()
    mockSignUpVerifyEmailCode = jest.fn().mockResolvedValue({ error: undefined })
    mockSignUpSendEmailCode = jest.fn().mockResolvedValue({ error: undefined })
    mockSignUpFinalize = jest.fn().mockImplementation(async ({ navigate }) => {
      await navigate({ decorateUrl: (url: string) => url })
      return { error: undefined }
    })
    mockSignInVerifyCode = jest.fn().mockResolvedValue({ error: undefined })
    mockSignInSendCode = jest.fn().mockResolvedValue({ error: undefined })
    mockSignInFinalize = jest.fn().mockImplementation(async ({ navigate }) => {
      await navigate({ decorateUrl: (url: string) => url })
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
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    mockSignUpResource.status = "complete"

    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

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

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

    await waitFor(() => {
      expect(mockSignInVerifyCode).toHaveBeenCalledWith({ code: "123456" })
    })
    expect(mockSignInFinalize).toHaveBeenCalledTimes(1)
    expect(mockSignUpVerifyEmailCode).not.toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith("/account")
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

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

    await waitFor(() => {
      expect(mockSignInVerifyCode).toHaveBeenCalledWith({ code: "123456" })
    })
    expect(mockSignInFinalize).toHaveBeenCalledTimes(1)
    expect(mockSignUpVerifyEmailCode).not.toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith(redirectUrl)
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
    expect(mockSignInFinalize).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith("/account")
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

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

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

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

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
})
