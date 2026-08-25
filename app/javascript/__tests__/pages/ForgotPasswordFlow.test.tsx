import React from "react"
import { useSignIn } from "@clerk/clerk-react"
import { screen, waitFor, within, cleanup } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useNavigate } from "react-router"
import { ForgotPasswordFlow } from "../../authentication/ForgotPasswordFlow"
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../__util__/renderUtils"
import { setupUserContext } from "../__util__/accountUtils"
import { AUTH_FLOW } from "../../modules/constants"

jest.mock("@clerk/clerk-react", () => {
  const Clerk = jest.requireActual("@clerk/clerk-react")
  return {
    ...Clerk,
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
    useAuth: jest.fn(() => ({ isLoaded: true, isSignedIn: false })),
    useSignIn: jest.fn(),
  }
})

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: jest.fn(),
}))

const submit = async (email = "test@example.com") => {
  const user = userEvent.setup()
  const emailGroup = screen.getByRole("group", { name: /email/i })
  await user.type(within(emailGroup).getByRole("textbox"), email)
  await user.click(screen.getByRole("button", { name: /get a code/i }))
}
describe("<ForgotPasswordFlow />", () => {
  let originalLocation: Location
  let mockNavigate: jest.Mock
  let mockSignInCreate: jest.Mock
  let mockPrepareFirstFactor: jest.Mock

  beforeEach(async () => {
    document.documentElement.lang = "en"
    originalLocation = mockWindowLocation()
    setupUserContext({ loggedIn: false })
    mockNavigate = jest.fn()
    mockSignInCreate = jest.fn().mockResolvedValue({
      supportedFirstFactors: [
        { strategy: "reset_password_email_code", emailAddressId: "idn_email" },
      ],
    })
    mockPrepareFirstFactor = jest.fn().mockResolvedValue(undefined)
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    ;(useSignIn as jest.Mock).mockReturnValue({
      isLoaded: true,
      signIn: { create: mockSignInCreate, prepareFirstFactor: mockPrepareFirstFactor },
    })
    await renderAndLoadAsync(<ForgotPasswordFlow />)
  })

  afterEach(() => {
    restoreWindowLocation(originalLocation)
    jest.restoreAllMocks()
    cleanup()
  })

  it("shows the forgot password form", () => {
    expect(screen.getByRole("heading", { name: /forgot password/i, level: 1 })).not.toBeNull()
    expect(screen.getByRole("group", { name: /email/i })).not.toBeNull()
    expect(screen.getByRole("button", { name: /get a code/i })).not.toBeNull()
  })

  it("sends an email with reset code and routes to the verification code page", async () => {
    await submit()

    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledWith({ identifier: "test@example.com" })
    })
    expect(mockPrepareFirstFactor).toHaveBeenCalledWith({
      strategy: "reset_password_email_code",
      emailAddressId: "idn_email",
    })
    expect(mockNavigate).toHaveBeenCalledWith("/forgot-password/code", {
      state: { email: "test@example.com", flow: AUTH_FLOW.FORGOT_PASSWORD },
    })
  })

  it("routes to verification code page whether user exists or not", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {})
    mockSignInCreate.mockRejectedValue(new Error("error"))

    await submit()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/forgot-password/code", {
        state: { email: "test@example.com", flow: AUTH_FLOW.FORGOT_PASSWORD },
      })
    })
    expect(mockPrepareFirstFactor).not.toHaveBeenCalled()
  })

  it("throws error with missing reset password factor", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {})
    mockSignInCreate.mockResolvedValue({
      supportedFirstFactors: [{ strategy: "password" }],
    })

    await submit()

    await waitFor(() => {
      expect(mockPrepareFirstFactor).not.toHaveBeenCalled()
    })
  })
})
