import React from "react"
import { useSignIn, useSignUp } from "@clerk/react"
import { screen, waitFor, within, cleanup } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useNavigate } from "react-router"
import CreateAnAccount from "../../../pages/account/create-an-account"
import { getSignInCodePath, getVerificationCodePath } from "../../../util/routeUtil"
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../../__util__/renderUtils"
import { setupUserContext } from "../../__util__/accountUtils"

jest.mock("@clerk/react", () => {
  const Clerk = jest.requireActual("@clerk/react")
  return {
    ...Clerk,
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
    useAuth: jest.fn(() => ({ isLoaded: true, isSignedIn: false })),
    useSignIn: jest.fn(),
    useSignUp: jest.fn(),
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
  let mockSignUpResource: {
    status: string
    unverifiedFields: string[]
    missingFields: string[]
    create: jest.Mock
    verifications: { sendEmailCode: jest.Mock }
  }
  let mockSignInResource: {
    status: string
    create: jest.Mock
    emailCode: { sendCode: jest.Mock }
  }

  beforeEach(async () => {
    document.documentElement.lang = "en"
    originalLocation = mockWindowLocation()
    setupUserContext({ loggedIn: false })
    mockNavigate = jest.fn()
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    mockSignUpCreate = jest.fn().mockResolvedValue({ error: null })
    mockSendEmailCode = jest.fn().mockResolvedValue(undefined)
    mockSignInCreate = jest.fn().mockResolvedValue({ error: null })
    mockSignInSendCode = jest.fn().mockResolvedValue(undefined)
    mockSignUpResource = {
      status: "missing_requirements",
      unverifiedFields: ["email_address"],
      missingFields: [],
      create: mockSignUpCreate,
      verifications: {
        sendEmailCode: mockSendEmailCode,
      },
    }
    mockSignInResource = {
      status: "needs_first_factor",
      create: mockSignInCreate,
      emailCode: {
        sendCode: mockSignInSendCode,
      },
    }
    ;(useSignUp as jest.Mock).mockReturnValue({
      fetchStatus: "idle",
      signUp: mockSignUpResource,
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

    expect(mockSendEmailCode).toHaveBeenCalledWith()
    expect(mockNavigate).toHaveBeenCalledWith(getVerificationCodePath(), {
      state: { email: "test@example.com" },
    })
  })

  it("transfers to sign-in code flow when account already exists", async () => {
    const user = userEvent.setup()
    const emailGroup = screen.getByRole("group", { name: /email/i })
    const emailField = within(emailGroup).getByRole("textbox")
    mockSignUpCreate.mockResolvedValue({ error: { errors: [{ code: "form_identifier_exists" }] } })

    await user.type(emailField, "test@example.com")
    await user.click(screen.getByRole("button", { name: /get a code/i }))

    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledWith({ identifier: "test@example.com" })
    })
    expect(mockSignInSendCode).toHaveBeenCalledWith()
    expect(mockNavigate).toHaveBeenCalledWith(getSignInCodePath(), {
      state: { email: "test@example.com" },
    })
    expect(mockSendEmailCode).not.toHaveBeenCalled()
  })

  it("logs transfer error when sign-in creation fails", async () => {
    const user = userEvent.setup()
    const emailGroup = screen.getByRole("group", { name: /email/i })
    const emailField = within(emailGroup).getByRole("textbox")
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    const transferError = { errors: [{ code: "some_signin_create_error" }] }
    mockSignUpCreate.mockResolvedValue({ error: { errors: [{ code: "form_identifier_exists" }] } })
    mockSignInCreate.mockResolvedValue({ error: transferError })

    await user.type(emailField, "test@example.com")
    await user.click(screen.getByRole("button", { name: /get a code/i }))

    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledWith({ identifier: "test@example.com" })
    })
    expect(consoleError).toHaveBeenCalledWith("Transfer to sign in code error", transferError)
    expect(mockSignInSendCode).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it("logs transfer error when sign-in is not in first-factor state", async () => {
    const user = userEvent.setup()
    const emailGroup = screen.getByRole("group", { name: /email/i })
    const emailField = within(emailGroup).getByRole("textbox")
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    mockSignUpCreate.mockResolvedValue({ error: { errors: [{ code: "form_identifier_exists" }] } })
    mockSignInResource.status = "some_unhandled_status"

    await user.type(emailField, "test@example.com")
    await user.click(screen.getByRole("button", { name: /get a code/i }))

    await waitFor(() => {
      expect(mockSignInSendCode).toHaveBeenCalledWith()
    })
    expect(consoleError).toHaveBeenCalledWith("Transfer to sign in code error", mockSignInResource)
    expect(mockNavigate).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })
})
