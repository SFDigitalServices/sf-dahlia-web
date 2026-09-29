import React from "react"
import { useSignIn, useSignUp } from "@clerk/react"
import { screen, waitFor, within, cleanup } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useNavigate } from "react-router"
import CreateAnAccount from "../../../pages/account/create-an-account"
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../../__util__/renderUtils"
import { setupUserContext } from "../../__util__/accountUtils"
import { AUTH_FLOW } from "../../../modules/constants"

jest.mock("@clerk/react", () => {
  const Clerk = jest.requireActual("@clerk/react")
  return {
    ...Clerk,
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
    useAuth: jest.fn(() => ({ isLoaded: true, isSignedIn: false })),
    useSignUp: jest.fn(),
    useSession: () => ({ session: null }),
    useUser: jest.fn(),
    useSignIn: jest.fn(),
    useClerk: () => ({ client: undefined }),
  }
})

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: jest.fn(),
}))

describe("<CreateAnAccount />", () => {
  let originalLocation: Location
  let mockNavigate: jest.Mock
  let mockSignUpCreate: jest.Mock
  let mockSendEmailCode: jest.Mock
  let mockSignInCreate: jest.Mock
  let mockSignInSendCode: jest.Mock
  let mockSignInResource: {
    create: jest.Mock
    status: string
    emailCode: { sendCode: jest.Mock }
  }

  beforeEach(async () => {
    document.documentElement.lang = "en"
    originalLocation = mockWindowLocation()
    setupUserContext({ loggedIn: false })
    mockNavigate = jest.fn()
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    mockSignUpCreate = jest.fn().mockResolvedValue({ error: undefined })
    mockSendEmailCode = jest.fn().mockResolvedValue(undefined)
    mockSignInCreate = jest.fn().mockResolvedValue({ error: undefined })
    mockSignInSendCode = jest.fn().mockResolvedValue({ error: undefined })
    mockSignInResource = {
      create: mockSignInCreate,
      status: "needs_first_factor",
      emailCode: {
        sendCode: mockSignInSendCode,
      },
    }
    ;(useSignUp as jest.Mock).mockReturnValue({
      fetchStatus: "idle",
      signUp: {
        create: mockSignUpCreate,
        status: "missing_requirements",
        unverifiedFields: ["email_address"],
        missingFields: [],
        verifications: {
          sendEmailCode: mockSendEmailCode,
        },
      },
    })
    ;(useSignIn as jest.Mock).mockReturnValue({
      fetchStatus: "idle",
      signIn: mockSignInResource,
    })
    await renderAndLoadAsync(<CreateAnAccount assetPaths={{}} />)
  })

  afterEach(() => {
    restoreWindowLocation(originalLocation)
    cleanup()
  })

  it("shows the create account form", () => {
    expect(screen.getByRole("heading", { name: /create an account/i, level: 1 })).not.toBeNull()
    expect(screen.getByText(/enter your email address and we'll send you a code/i)).not.toBeNull()
    expect(screen.getByRole("button", { name: /get a code/i })).not.toBeNull()
    expect(screen.getByRole("heading", { name: /already have an account\?/i })).not.toBeNull()

    const signInLinks = screen.getAllByRole("link", { name: /^sign in$/i })
    expect(signInLinks.some((link) => link.getAttribute("href") === "/sign-in")).toBe(true)

    expect(screen.getByRole("heading", { name: /get help/i })).not.toBeNull()
  })

  it("shows an error when email is missing", async () => {
    const user = userEvent.setup()
    const emailGroup = screen.getByRole("group", { name: /email/i })
    const emailField = within(emailGroup).getByRole("textbox")

    await user.click(emailField)
    await user.tab()

    expect(screen.getByText("Enter email address like: example@web.com")).not.toBeNull()
  })

  it("initializes the account creation process", async () => {
    const user = userEvent.setup()
    const emailGroup = screen.getByRole("group", { name: /email/i })
    const emailField = within(emailGroup).getByRole("textbox")

    await user.type(emailField, "test@example.com")
    await user.click(screen.getByRole("button", { name: /get a code/i }))

    await waitFor(() => {
      expect(mockSignUpCreate).toHaveBeenCalledWith({
        emailAddress: "test@example.com",
        locale: "en",
        unsafeMetadata: { locale: "en" },
      })
    })

    expect(mockSendEmailCode).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith("/create-account/code", {
      state: { email: "test@example.com", flow: AUTH_FLOW.CREATE_ACCOUNT },
    })
  })

  it("transfers from create-an-account to sign-in flow when the account already exists", async () => {
    mockSignUpCreate.mockResolvedValueOnce({
      error: { errors: [{ code: "form_identifier_exists" }] },
    })
    const user = userEvent.setup()
    const emailGroup = screen.getByRole("group", { name: /email/i })
    const emailField = within(emailGroup).getByRole("textbox")

    await user.type(emailField, "test@example.com")
    await user.click(screen.getByRole("button", { name: /get a code/i }))

    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledWith({
        identifier: "test@example.com",
        signUpIfMissing: true,
      })
    })
    expect(mockSignInSendCode).toHaveBeenCalledTimes(1)
    expect(mockSendEmailCode).not.toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith("/sign-in/code", {
      state: { email: "test@example.com", flow: AUTH_FLOW.SIGN_IN },
    })
  })

  it("logs an error when transfer sign-in creation fails", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    const signInCreateError = { errors: [{ code: "bad_request" }] }
    mockSignUpCreate.mockResolvedValueOnce({
      error: { errors: [{ code: "form_identifier_exists" }] },
    })
    mockSignInCreate.mockResolvedValueOnce({ error: signInCreateError })
    const user = userEvent.setup()
    const emailGroup = screen.getByRole("group", { name: /email/i })
    const emailField = within(emailGroup).getByRole("textbox")

    await user.type(emailField, "test@example.com")
    await user.click(screen.getByRole("button", { name: /get a code/i }))

    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledWith({
        identifier: "test@example.com",
        signUpIfMissing: true,
      })
    })
    expect(consoleError).toHaveBeenCalledWith("Sign in get code error:", signInCreateError)
    expect(mockSignInSendCode).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it("logs an error when transfer sign-in send code fails", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    const sendCodeError = { errors: [{ code: "rate_limited" }] }
    mockSignUpCreate.mockResolvedValueOnce({
      error: { errors: [{ code: "form_identifier_exists" }] },
    })
    mockSignInSendCode.mockResolvedValueOnce({ error: sendCodeError })
    const user = userEvent.setup()
    const emailGroup = screen.getByRole("group", { name: /email/i })
    const emailField = within(emailGroup).getByRole("textbox")

    await user.type(emailField, "test@example.com")
    await user.click(screen.getByRole("button", { name: /get a code/i }))

    await waitFor(() => {
      expect(mockSignInSendCode).toHaveBeenCalledTimes(1)
    })
    expect(consoleError).toHaveBeenCalledWith("Sign in send code error:", sendCodeError)
    expect(mockNavigate).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it("logs an error when transfer sign-in status is not first factor", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    mockSignUpCreate.mockResolvedValueOnce({
      error: { errors: [{ code: "form_identifier_exists" }] },
    })
    mockSignInResource.status = "complete"
    const user = userEvent.setup()
    const emailGroup = screen.getByRole("group", { name: /email/i })
    const emailField = within(emailGroup).getByRole("textbox")

    await user.type(emailField, "test@example.com")
    await user.click(screen.getByRole("button", { name: /get a code/i }))

    await waitFor(() => {
      expect(mockSignInSendCode).toHaveBeenCalledTimes(1)
    })
    expect(consoleError).toHaveBeenCalledWith("Sign in code error:", "complete")
    expect(mockNavigate).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })
})
