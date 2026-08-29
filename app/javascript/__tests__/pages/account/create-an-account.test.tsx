import React from "react"
import { useSignUp } from "@clerk/react"
import { screen, waitFor, within, cleanup } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useNavigate } from "react-router"
import CreateAnAccount from "../../../pages/account/create-an-account"
import { getVerificationCodePath } from "../../../util/routeUtil"
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
  let mockSignUpResource: {
    status: string
    unverifiedFields: string[]
    missingFields: string[]
    create: jest.Mock
    verifications: { sendEmailCode: jest.Mock }
  }

  beforeEach(async () => {
    document.documentElement.lang = "en"
    originalLocation = mockWindowLocation()
    setupUserContext({ loggedIn: false })
    mockNavigate = jest.fn()
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    mockSignUpCreate = jest.fn().mockResolvedValue({ error: null })
    mockSendEmailCode = jest.fn().mockResolvedValue(undefined)
    mockSignUpResource = {
      status: "missing_requirements",
      unverifiedFields: ["email_address"],
      missingFields: [],
      create: mockSignUpCreate,
      verifications: {
        sendEmailCode: mockSendEmailCode,
      },
    }
    ;(useSignUp as jest.Mock).mockReturnValue({
      fetchStatus: "idle",
      signUp: mockSignUpResource,
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

  it("logs account creation error when sign-up creation fails", async () => {
    const user = userEvent.setup()
    const emailGroup = screen.getByRole("group", { name: /email/i })
    const emailField = within(emailGroup).getByRole("textbox")
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    const signUpError = { errors: [{ code: "some_signup_create_error" }] }
    mockSignUpCreate.mockResolvedValue({ error: signUpError })

    await user.type(emailField, "test@example.com")
    await user.click(screen.getByRole("button", { name: /get a code/i }))

    await waitFor(() => {
      expect(mockSignUpCreate).toHaveBeenCalledWith({
        emailAddress: "test@example.com",
        locale: "en",
        unsafeMetadata: { locale: "en" },
      })
    })
    expect(consoleError).toHaveBeenCalledWith("Account creation error", signUpError)
    expect(mockSendEmailCode).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it("logs account creation error when sign-up verification state is invalid", async () => {
    const user = userEvent.setup()
    const emailGroup = screen.getByRole("group", { name: /email/i })
    const emailField = within(emailGroup).getByRole("textbox")
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    mockSignUpResource.unverifiedFields = []

    await user.type(emailField, "test@example.com")
    await user.click(screen.getByRole("button", { name: /get a code/i }))

    await waitFor(() => {
      expect(mockSendEmailCode).toHaveBeenCalledWith()
    })
    expect(consoleError).toHaveBeenCalledWith("Account creation error", mockSignUpResource)
    expect(mockNavigate).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })
})
