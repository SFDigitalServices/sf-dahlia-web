import React from "react"
import { useSignUp } from "@clerk/clerk-react"
import { screen, waitFor, cleanup } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useLocation, useNavigate } from "react-router"
import EnterCode from "../../../pages/account/enter-code"
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
    useSignUp: jest.fn(),
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

describe("<EnterCode />", () => {
  let originalLocation: Location
  let mockNavigate: jest.Mock
  let mockAttemptEmailAddressVerification: jest.Mock
  let mockPrepareEmailAddressVerification: jest.Mock
  let mockSetActive: jest.Mock

  beforeEach(async () => {
    document.documentElement.lang = "en"
    originalLocation = mockWindowLocation()
    setupUserContext({ loggedIn: false })
    mockNavigate = jest.fn()
    mockAttemptEmailAddressVerification = jest.fn()
    mockPrepareEmailAddressVerification = jest.fn().mockResolvedValue(undefined)
    mockSetActive = jest.fn().mockResolvedValue(undefined)
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    ;(useLocation as jest.Mock).mockReturnValue({ state: { email: "test@example.com" } })
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
    ;(useSignUp as jest.Mock).mockReturnValue({
      isLoaded: true,
      setActive: mockSetActive,
      signUp: {
        attemptEmailAddressVerification: mockAttemptEmailAddressVerification,
        prepareEmailAddressVerification: mockPrepareEmailAddressVerification,
      },
    })
    await renderAndLoadAsync(<EnterCode assetPaths={{}} />)
  })

  afterEach(() => {
    restoreWindowLocation(originalLocation)
    cleanup()
  })

  it("shows the enter code page", () => {
    expect(
      screen.getByRole("heading", { name: /check your email for a code/i, level: 1 })
    ).not.toBeNull()
    expect(screen.getByText(/we sent a code to:/i)).not.toBeNull()
    expect(screen.getByText("test@example.com")).not.toBeNull()
    expect(screen.getByRole("link", { name: /edit email/i }).getAttribute("href")).toBe(
      "/create-account"
    )
    expect(screen.getByRole("group", { name: /enter code/i })).not.toBeNull()
    expect(screen.getAllByRole("textbox")).toHaveLength(6)
    expect(screen.getByRole("button", { name: /confirm code/i })).not.toBeNull()
    expect(screen.getByRole("button", { name: /send again/i })).not.toBeNull()
    expect(screen.getByRole("button", { name: /how to use a one-time code/i })).not.toBeNull()
    expect(screen.getByRole("heading", { name: /get help/i })).not.toBeNull()
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
    await user.click(screen.getByRole("button", { name: /confirm code/i }))

    await waitFor(() => {
      const error = screen.getByTestId("error-message")
      expect(error).toHaveTextContent("That code did not work. Check for mistakes.")
      expect(error).toHaveTextContent("Sent more than 1 code? Use the newest one.")
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

  it("verifies a valid code", async () => {
    const user = userEvent.setup()
    mockAttemptEmailAddressVerification.mockResolvedValue({
      status: "complete",
      createdSessionId: "session_123",
    })

    await user.click(screen.getAllByRole("textbox")[0])
    await user.paste("123456")
    await user.click(screen.getByRole("button", { name: /confirm code/i }))

    await waitFor(() => {
      expect(mockAttemptEmailAddressVerification).toHaveBeenCalledWith({ code: "123456" })
    })
    expect(mockSetActive).toHaveBeenCalledWith({ session: "session_123" })
    expect(screen.queryByTestId("error-message")).toBeNull()
  })

  it("resends the code", async () => {
    const user = userEvent.setup()

    await user.click(screen.getByRole("button", { name: /send again/i }))

    await waitFor(() => {
      expect(mockPrepareEmailAddressVerification).toHaveBeenCalledWith({
        strategy: "email_code",
      })
    })
  })

  it("redirects to create account when clerk is disabled", async () => {
    cleanup()
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })
    await renderAndLoadAsync(<EnterCode assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/create-account")
    })
  })

  it("redirects to create account when email is missing", async () => {
    cleanup()
    ;(useLocation as jest.Mock).mockReturnValue({ state: null })
    await renderAndLoadAsync(<EnterCode assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/create-account")
    })
  })
})
