import React from "react"
import { useAuth, useSignIn, useSignUp, useClerk } from "@clerk/react"
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

jest.mock("@clerk/react", () => {
  const Clerk = jest.requireActual("@clerk/react")
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

const switchToVerificationCodeView = async () => {
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
  let mockSendEmailCode: jest.Mock
  let mockFinalize: jest.Mock
  let mockNavigate: jest.Mock
  let mockSignInResource: {
    status: string
    create: jest.Mock
    emailCode: { sendCode: jest.Mock }
    finalize: jest.Mock
  }

  beforeEach(() => {
    document.documentElement.lang = "en"
    originalLocation = mockWindowLocation()
    setupUserContext({ loggedIn: false })
    mockNavigate = jest.fn()
    mockSendEmailCode = jest.fn().mockResolvedValue(undefined)
    mockSignInCreate = jest.fn().mockResolvedValue({ error: null })
    mockFinalize = jest.fn().mockImplementation(async ({ navigate }) => {
      await navigate({ decorateUrl: (url: string) => url })
    })
    mockSignInResource = {
      status: "complete",
      create: mockSignInCreate,
      emailCode: { sendCode: mockSendEmailCode },
      finalize: mockFinalize,
    }
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    ;(useAuth as jest.Mock).mockReturnValue({ isLoaded: true, isSignedIn: false })
    ;(useSignIn as jest.Mock).mockReturnValue({
      signIn: mockSignInResource,
      fetchStatus: "idle",
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

  it("shows a loading state until Clerk loads", async () => {
    ;(useSignIn as jest.Mock).mockReturnValue({
      signIn: null,
      fetchStatus: "fetching",
    })

    const { container } = await renderAndLoadAsync(<SignIn assetPaths={{}} />)

    expect(container.querySelector("[aria-busy='true']")).not.toBeNull()
    expect(screen.queryByLabelText(/^password$/i)).toBeNull()
    expect(screen.queryByRole("button", { name: /^get a code$/i })).toBeNull()
    expect(screen.queryByRole("group", { name: /email/i })).toBeNull()
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
    await switchToVerificationCodeView()

    expect(
      screen.getByText(/enter your email address and we'll send you a code to sign in/i)
    ).not.toBeNull()
    expect(screen.getByRole("button", { name: /^get a code$/i })).not.toBeNull()
    expect(screen.getByRole("button", { name: /sign in with a password instead/i })).not.toBeNull()
    expect(screen.queryByLabelText(/^password$/i)).toBeNull()
  })

  it("returns to the password flow from the code sign in flow", async () => {
    await renderAndLoadAsync(<SignIn assetPaths={{}} />)
    const user = await switchToVerificationCodeView()
    await user.click(screen.getByRole("button", { name: /sign in with a password instead/i }))

    expect(screen.getByRole("group", { name: /^password$/i })).not.toBeNull()
    expect(screen.getByRole("button", { name: /^sign in$/i })).not.toBeNull()
    expect(screen.queryByRole("button", { name: /^get a code$/i })).toBeNull()
  })

  it("navigates to the sign-in code page when requesting a code", async () => {
    mockSignInResource.status = "needs_first_factor"
    await renderAndLoadAsync(<SignIn assetPaths={{}} />)
    const user = await switchToVerificationCodeView()
    const emailGroup = screen.getByRole("group", { name: /email/i })
    await user.type(within(emailGroup).getByRole("textbox"), "test@test.com")
    await user.click(screen.getByRole("button", { name: /^get a code$/i }))

    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledWith({ identifier: "test@test.com" })
    })
    expect(mockSendEmailCode).toHaveBeenCalledWith({ emailAddress: "test@test.com" })
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
    mockSignInResource.status = "complete"
    await renderAndLoadAsync(<SignIn assetPaths={{}} />)
    await submitCredentials()

    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledWith({
        identifier: "test@test.com",
        password: "abcd1234",
      })
    })
    expect(mockFinalize).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith("/account")
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
    expect(mockFinalize).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })
})
