import React from "react"
import { useAuth, useClerk, useSignIn, useSignUp } from "@clerk/clerk-react"
import { screen, waitFor, within, cleanup } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useNavigate } from "react-router"
import SignIn from "../../pages/sign-in"
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../__util__/renderUtils"
import { setupUserContext } from "../__util__/accountUtils"

jest.mock("@clerk/clerk-react", () => {
  const Clerk = jest.requireActual("@clerk/clerk-react")
  return {
    ...Clerk,
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
    useSignIn: jest.fn(),
    useSignUp: jest.fn(),
    useClerk: jest.fn(),
    useAuth: jest.fn(() => ({ isLoaded: true, isSignedIn: false })),
  }
})

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: jest.fn(),
}))

const mockLastAuthenticationStrategy = (strategy: string | null) => {
  ;(useClerk as jest.Mock).mockReturnValue({ client: { lastAuthenticationStrategy: strategy } })
}

const switchToCodeView = async () => {
  const user = userEvent.setup()
  await user.click(screen.getByRole("button", { name: /get a one-time code to sign in/i }))
  return user
}

const submitCredentials = async (password = "abcd1234") => {
  const user = userEvent.setup()
  const emailGroup = screen.getByRole("group", { name: /email/i })
  await user.type(within(emailGroup).getByRole("textbox"), "test@test.com")
  await user.type(screen.getByLabelText(/^password$/i), password)
  await user.click(screen.getByRole("button", { name: /^sign in$/i }))
}

describe("<SignInFlow />", () => {
  let originalLocation: Location
  let mockSignInCreate: jest.Mock
  let mockPrepareFirstFactor: jest.Mock
  let mockSetActive: jest.Mock
  let mockNavigate: jest.Mock

  beforeEach(() => {
    document.documentElement.lang = "en"
    originalLocation = mockWindowLocation()
    setupUserContext({ loggedIn: false })
    mockNavigate = jest.fn()
    mockPrepareFirstFactor = jest.fn().mockResolvedValue(undefined)
    mockSignInCreate = jest
      .fn()
      .mockResolvedValue({ status: "complete", createdSessionId: "session-id" })
    mockSetActive = jest.fn().mockResolvedValue(undefined)
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    ;(useAuth as jest.Mock).mockReturnValue({ isLoaded: true, isSignedIn: false })
    ;(useSignIn as jest.Mock).mockReturnValue({
      isLoaded: true,
      signIn: { create: mockSignInCreate, prepareFirstFactor: mockPrepareFirstFactor },
      setActive: mockSetActive,
    })
    ;(useSignUp as jest.Mock).mockReturnValue({ isLoaded: true })
    mockLastAuthenticationStrategy(null)
  })

  afterEach(() => {
    restoreWindowLocation(originalLocation)
    cleanup()
  })

  it("shows the password sign in flow by default", async () => {
    await renderAndLoadAsync(<SignIn assetPaths={{}} />)

    expect(screen.getByRole("heading", { name: /^sign in$/i, level: 1 })).not.toBeNull()
    expect(screen.getByRole("group", { name: /email/i })).not.toBeNull()
    expect(screen.getByRole("group", { name: /^password$/i })).not.toBeNull()
    expect(screen.getByRole("link", { name: /forgot password/i })).not.toBeNull()
    expect(screen.getByRole("button", { name: /^sign in$/i })).not.toBeNull()
    expect(screen.getByRole("button", { name: /get a one-time code to sign in/i })).not.toBeNull()
    expect(screen.getByText(/one-time codes make signing in easier/i)).not.toBeNull()
    expect(screen.getByRole("heading", { name: /don't have an account\?/i })).not.toBeNull()
    expect(screen.getByText(/save your progress, apply faster next time/i)).not.toBeNull()

    const createAccountLink = screen.getByRole("link", { name: /^create account$/i })
    expect(createAccountLink.getAttribute("href")).toBe("/create-account")

    expect(screen.getByRole("heading", { name: /get help/i })).not.toBeNull()
    expect(
      screen.getByRole("link", { name: /how to sign in or find help/i }).getAttribute("href")
    ).toBe("https://www.sf.gov/sign-in-to-your-dahlia-account")
  })

  it("shows the code sign in flow by default when the last strategy used was a code", async () => {
    mockLastAuthenticationStrategy("email_code")

    await renderAndLoadAsync(<SignIn assetPaths={{}} />)

    expect(
      screen.getByText(/enter your email address and we'll send you a code to sign in/i)
    ).not.toBeNull()
    expect(screen.getByRole("button", { name: /^get a code$/i })).not.toBeNull()
    expect(screen.queryByLabelText(/^password$/i)).toBeNull()
  })

  it("shows the password sign in flow when the last strategy used was a password", async () => {
    mockLastAuthenticationStrategy("password")

    await renderAndLoadAsync(<SignIn assetPaths={{}} />)

    expect(screen.getByRole("group", { name: /^password$/i })).not.toBeNull()
    expect(screen.queryByRole("button", { name: /^get a code$/i })).toBeNull()
  })

  it("switches to the code sign in flow", async () => {
    await renderAndLoadAsync(<SignIn assetPaths={{}} />)
    await switchToCodeView()

    expect(
      screen.getByText(/enter your email address and we'll send you a code to sign in/i)
    ).not.toBeNull()
    expect(screen.getByRole("button", { name: /^get a code$/i })).not.toBeNull()
    expect(screen.getByRole("button", { name: /sign in with a password instead/i })).not.toBeNull()
    expect(screen.queryByLabelText(/^password$/i)).toBeNull()
  })

  it("returns to the password flow from the code sign in flow", async () => {
    await renderAndLoadAsync(<SignIn assetPaths={{}} />)
    const user = await switchToCodeView()
    await user.click(screen.getByRole("button", { name: /sign in with a password instead/i }))

    expect(screen.getByRole("group", { name: /^password$/i })).not.toBeNull()
    expect(screen.getByRole("button", { name: /^sign in$/i })).not.toBeNull()
    expect(screen.queryByRole("button", { name: /^get a code$/i })).toBeNull()
  })

  it("navigates to the sign-in code page when requesting a code", async () => {
    mockSignInCreate.mockResolvedValue({
      supportedFirstFactors: [{ strategy: "email_code", emailAddressId: "idn_email" }],
    })
    await renderAndLoadAsync(<SignIn assetPaths={{}} />)
    const user = await switchToCodeView()
    const emailGroup = screen.getByRole("group", { name: /email/i })
    await user.type(within(emailGroup).getByRole("textbox"), "test@test.com")
    await user.click(screen.getByRole("button", { name: /^get a code$/i }))

    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledWith({ identifier: "test@test.com" })
    })
    expect(mockPrepareFirstFactor).toHaveBeenCalledWith({
      strategy: "email_code",
      emailAddressId: "idn_email",
    })
    expect(mockNavigate).toHaveBeenCalledWith("/sign-in/code", {
      state: { email: "test@test.com" },
    })
  })

  it("redirects to the account overview when already signed in", async () => {
    ;(useAuth as jest.Mock).mockReturnValue({ isLoaded: true, isSignedIn: true })

    await renderAndLoadAsync(<SignIn assetPaths={{}} />)

    expect(screen.queryByRole("heading", { name: /^sign in$/i, level: 1 })).toBeNull()
  })

  it("signs in and redirects to the account overview on success", async () => {
    await renderAndLoadAsync(<SignIn assetPaths={{}} />)
    await submitCredentials()

    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledWith({
        identifier: "test@test.com",
        password: "abcd1234",
      })
    })
    expect(mockSetActive).toHaveBeenCalledWith({
      session: "session-id",
      redirectUrl: "/account",
    })
  })

  it("shows one alert and logs the details when sign in fails", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    const clerkError = { errors: [{ code: "form_password_incorrect" }] }
    mockSignInCreate.mockRejectedValue(clerkError)

    await renderAndLoadAsync(<SignIn assetPaths={{}} />)
    await submitCredentials("wrongPass1")

    await waitFor(() => {
      expect(screen.getAllByText(/email or password is incorrect/i)).toHaveLength(1)
    })
    expect(consoleError).toHaveBeenCalledWith("Sign in error", clerkError)
    expect(mockSetActive).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })
})
