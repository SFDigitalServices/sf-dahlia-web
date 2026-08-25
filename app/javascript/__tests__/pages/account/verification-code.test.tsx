import React from "react"
import { useSignIn, useSignUp } from "@clerk/clerk-react"
import { t } from "@bloom-housing/ui-components"
import { screen, waitFor, cleanup } from "@testing-library/react"
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

jest.mock("@clerk/clerk-react", () => {
  const Clerk = jest.requireActual("@clerk/clerk-react")
  return {
    ...Clerk,
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
    useAuth: jest.fn(() => ({ isLoaded: true, isSignedIn: false })),
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
        supportedFirstFactors: [{ strategy: "email_code", emailAddressId: "idn_email" }],
      },
    })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)
  })

  afterEach(() => {
    restoreWindowLocation(originalLocation)
    cleanup()
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
    expect(screen.getByRole("button", { name: t("createAccount.sendAgain") })).not.toBeNull()
    expect(screen.getByRole("button", { name: t("createAccount.howToUseCode") })).not.toBeNull()
    expect(screen.getByRole("heading", { name: t("createAccount.getHelp") })).not.toBeNull()
    expect(
      screen
        .getByRole("link", { name: /how to create an account or find help/i })
        .getAttribute("href")
    ).toBe("https://www.sf.gov/learn-how-to-create-dahlia-account")
  })

  it("shows the validation error for an incomplete code", async () => {
    const user = userEvent.setup()
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
    const user = userEvent.setup()
    const digits = screen.getAllByRole("textbox")

    await user.click(digits[0])
    await user.keyboard("123")
    await user.tab()

    expect(screen.queryByTestId("error-message")).toBeNull()
    digits.forEach((digit) => expect(digit).not.toBeInvalid())
  })

  it("fills all fields when a 6-digit code is pasted", async () => {
    const user = userEvent.setup()
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
    const user = userEvent.setup()
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
    const user = userEvent.setup()

    await user.click(screen.getByRole("button", { name: t("createAccount.sendAgain") }))

    await waitFor(() => {
      expect(mockPrepareEmailAddressVerification).toHaveBeenCalledWith({
        strategy: "email_code",
      })
    })
  })

  it("redirects to create account when clerk is disabled", async () => {
    cleanup()
    document.title = "DAHLIA San Francisco Housing Portal"
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/create-account")
    })
  })

  it("redirects to create account when email is missing", async () => {
    cleanup()
    document.title = "DAHLIA San Francisco Housing Portal"
    ;(useLocation as jest.Mock).mockReturnValue({ pathname: "/create-account/code", state: null })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/create-account")
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

    const user = userEvent.setup()
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

  it("redirects to the apply intro after sign in when a redirect url is present", async () => {
    cleanup()
    const redirectUrl = "/listings/a0W0P00000GlKfBUAV/apply-welcome/intro"
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/sign-in/code",
      state: { email: "test@example.com", redirectUrl },
    })
    mockAttemptFirstFactor.mockResolvedValue({
      status: "complete",
      createdSessionId: "session_456",
    })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    const user = userEvent.setup()
    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: t("createAccount.confirmCode") }))

    await waitFor(() => {
      expect(mockSetActiveSignIn).toHaveBeenCalledWith({
        session: "session_456",
        redirectUrl,
      })
    })
    expect(mockAttemptEmailAddressVerification).not.toHaveBeenCalled()
  })

  it("resends the code for sign in", async () => {
    cleanup()
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: "/sign-in/code",
      state: { email: "test@example.com" },
    })
    await renderAndLoadAsync(<EnterVerificationCode assetPaths={{}} />)

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: t("createAccount.sendAgain") }))

    await waitFor(() => {
      expect(mockPrepareFirstFactor).toHaveBeenCalledWith({
        strategy: "email_code",
        emailAddressId: "idn_email",
      })
    })
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
})
