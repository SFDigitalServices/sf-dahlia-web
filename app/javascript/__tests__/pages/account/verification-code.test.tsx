import React from "react"
import { useSignIn, useSignUp, useAuth } from "@clerk/clerk-react"
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
import { authorizeHousingCounselor } from "../../../api/authApiService"

jest.mock("@clerk/clerk-react", () => {
  const Clerk = jest.requireActual("@clerk/clerk-react")
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
  let mockAttemptEmailAddressVerification: jest.Mock
  let mockPrepareEmailAddressVerification: jest.Mock
  let mockAttemptFirstFactor: jest.Mock
  let mockPrepareFirstFactor: jest.Mock
  let mockSetActiveSignUp: jest.Mock
  let mockSetActiveSignIn: jest.Mock

  beforeEach(async () => {
    document.documentElement.lang = "en"
    document.title = "DAHLIA San Francisco Housing Portal"
    originalLocation = mockWindowLocation()
    setupUserContext({ loggedIn: false })
    mockNavigate = jest.fn()
    mockAttemptEmailAddressVerification = jest.fn()
    mockPrepareEmailAddressVerification = jest.fn().mockResolvedValue(undefined)
    mockAttemptFirstFactor = jest.fn()
    mockPrepareFirstFactor = jest.fn().mockResolvedValue(undefined)
    mockSetActiveSignUp = jest.fn().mockResolvedValue(undefined)
    mockSetActiveSignIn = jest.fn().mockResolvedValue(undefined)
    jest.useFakeTimers()
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/create-account/code",
      state: { email: "test@example.com" },
    })
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
    ;(useSignUp as jest.Mock).mockReturnValue({
      isLoaded: true,
      setActive: mockSetActiveSignUp,
      signUp: {
        attemptEmailAddressVerification: mockAttemptEmailAddressVerification,
        prepareEmailAddressVerification: mockPrepareEmailAddressVerification,
      },
    })
    ;(useSignIn as jest.Mock).mockReturnValue({
      isLoaded: true,
      setActive: mockSetActiveSignIn,
      signIn: {
        attemptFirstFactor: mockAttemptFirstFactor,
        prepareFirstFactor: mockPrepareFirstFactor,
        supportedFirstFactors: [{ strategy: "email_code", emailAddressId: "test_email" }],
      },
    })
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
    expect(mockAttemptEmailAddressVerification).not.toHaveBeenCalled()
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
    mockAttemptEmailAddressVerification.mockResolvedValue({
      status: "complete",
      createdSessionId: "session_123",
    })

    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

    await waitFor(() => {
      expect(mockAttemptEmailAddressVerification).toHaveBeenCalledWith({ code: "123456" })
    })
    expect(mockSetActiveSignUp).toHaveBeenCalledWith({ session: "session_123" })
    expect(mockAttemptFirstFactor).not.toHaveBeenCalled()
    expect(screen.queryByTestId("error-message")).toBeNull()
  })

  it("resends the code", async () => {
    expireResendVerificationCode()

    fireEvent.click(screen.getByRole("button", { name: t("createAccount.sendAgain") }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(mockPrepareEmailAddressVerification).toHaveBeenCalledWith({
      strategy: "email_code",
    })
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
    ;(useLocation as jest.Mock).mockReturnValue({ pathname: "/create-account/code", state: null })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/sign-in")
    })
  })

  it("shows the sign-in enter code page", async () => {
    cleanup()
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/sign-in/code",
      state: { email: "test@example.com" },
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
      state: { email: "test@example.com" },
    })
    mockAttemptFirstFactor.mockResolvedValue({
      status: "complete",
      createdSessionId: "session_456",
    })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

    await waitFor(() => {
      expect(mockAttemptFirstFactor).toHaveBeenCalledWith({
        strategy: "email_code",
        code: "123456",
      })
    })
    expect(mockSetActiveSignIn).toHaveBeenCalledWith({
      session: "session_456",
      redirectUrl: "/account",
    })
    expect(mockAttemptEmailAddressVerification).not.toHaveBeenCalled()
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
      state: { email: "test@example.com", housingCounselorToken: "jwt.token" },
    })
    mockAttemptFirstFactor.mockResolvedValue({
      status: "complete",
      createdSessionId: "session_456",
    })
    ;(authorizeHousingCounselor as jest.Mock).mockResolvedValue(undefined)
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

    await waitFor(() => {
      expect(authorizeHousingCounselor).toHaveBeenCalledWith("jwt.token", "clerk-session-token")
    })
    expect(mockSetActiveSignIn).toHaveBeenCalledWith({ session: "session_456" })
    expect(mockNavigate).toHaveBeenCalledWith("/account")
  })

  it("resends the code for sign in", async () => {
    cleanup()
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/sign-in/code",
      state: { email: "test@example.com" },
    })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    expireResendVerificationCode()
    fireEvent.click(screen.getByRole("button", { name: t("createAccount.sendAgain") }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(mockPrepareFirstFactor).toHaveBeenCalledWith({
      strategy: "email_code",
      emailAddressId: "test_email",
    })
    expect(screen.getByText(t("createAccount.emailSent"))).not.toBeNull()
    expect(screen.getByText(t("createAccount.sendAgainIn", { smart_count: 30 }))).not.toBeNull()
    expect(screen.queryByRole("button", { name: t("createAccount.sendAgain") })).toBeNull()
  })

  it("redirects to sign-in when email is missing from the sign-in code page", async () => {
    cleanup()
    document.title = "DAHLIA San Francisco Housing Portal"
    ;(useLocation as jest.Mock).mockReturnValue({ pathname: "/sign-in/code", state: null })
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
})
