import React from "react"
import { useSignIn } from "@clerk/react"
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

jest.mock("@clerk/react", () => {
  const Clerk = jest.requireActual("@clerk/react")
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
  let mockSendResetCode: jest.Mock

  beforeEach(async () => {
    document.documentElement.lang = "en"
    originalLocation = mockWindowLocation()
    setupUserContext({ loggedIn: false })
    mockNavigate = jest.fn()
    mockSignInCreate = jest.fn().mockResolvedValue({ error: null })
    mockSendResetCode = jest.fn().mockResolvedValue({ error: null })
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    ;(useSignIn as jest.Mock).mockReturnValue({
      fetchStatus: "idle",
      signIn: {
        create: mockSignInCreate,
        resetPasswordEmailCode: { sendCode: mockSendResetCode },
      },
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
    expect(mockSendResetCode).toHaveBeenCalledWith()
    expect(mockNavigate).toHaveBeenCalledWith("/forgot-password/code", {
      state: { email: "test@example.com", flow: AUTH_FLOW.FORGOT_PASSWORD },
    })
  })

  it("routes to verification code page whether user exists or not", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {})
    mockSignInCreate.mockResolvedValue({
      error: { errors: [{ code: "form_identifier_not_found" }] },
    })

    await submit()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/forgot-password/code", {
        state: { email: "test@example.com", flow: AUTH_FLOW.FORGOT_PASSWORD },
      })
    })
    expect(mockSendResetCode).not.toHaveBeenCalled()
  })

  // v6 replaces the supportedFirstFactors lookup with resetPasswordEmailCode.sendCode(),
  // so a missing-factor case no longer exists; a failed send is reported as an error.
  it("still routes to the code page when sending the reset code fails", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    const sendError = { errors: [{ code: "form_send_failed" }] }
    mockSendResetCode.mockResolvedValue({ error: sendError })

    await submit()

    await waitFor(() => {
      expect(mockSendResetCode).toHaveBeenCalledWith()
    })
    expect(consoleError).toHaveBeenCalledWith("Forgot password error", sendError)
    expect(mockNavigate).toHaveBeenCalledWith("/forgot-password/code", {
      state: { email: "test@example.com", flow: AUTH_FLOW.FORGOT_PASSWORD },
    })
  })
})
