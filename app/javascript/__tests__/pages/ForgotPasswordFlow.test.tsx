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

  it("shows an error and does not route when requesting forgot password fails", async () => {
    const createError = { errors: [{ code: "resource_not_found" }] }
    jest.spyOn(console, "error").mockImplementation(() => {})
    mockSignInCreate.mockResolvedValue({ error: createError })

    await submit()

    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledWith({ identifier: "test@example.com" })
    })
    expect(console.error).toHaveBeenCalledWith("Forgot password error:", createError)
    expect(mockSendResetCode).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("does not submit when sign-in is currently fetching", async () => {
    cleanup()
    ;(useSignIn as jest.Mock).mockReturnValue({
      fetchStatus: "fetching",
      signIn: {
        create: mockSignInCreate,
        resetPasswordEmailCode: { sendCode: mockSendResetCode },
      },
    })
    await renderAndLoadAsync(<ForgotPasswordFlow />)

    await submit()

    expect(mockSignInCreate).not.toHaveBeenCalled()
    expect(mockSendResetCode).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
