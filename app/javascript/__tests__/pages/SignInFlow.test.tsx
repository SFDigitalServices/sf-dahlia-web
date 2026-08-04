import React from "react"
import { useSignIn } from "@clerk/clerk-react"
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
  }
})

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: jest.fn(),
}))

const submitCredentials = async (password = "abcd1234") => {
  const user = userEvent.setup()
  const emailGroup = screen.getByRole("group", { name: /email/i })
  await user.type(within(emailGroup).getByRole("textbox"), "test@test.com")
  await user.type(screen.getByLabelText(/^password$/i), password)
  await user.click(screen.getByRole("button", { name: /^sign in$/i }))
}

describe("<SignInFlow />", () => {
  let originalLocation: Location
  let mockNavigate: jest.Mock
  let mockSignInCreate: jest.Mock
  let mockSetActive: jest.Mock

  beforeEach(async () => {
    document.documentElement.lang = "en"
    originalLocation = mockWindowLocation()
    setupUserContext({ loggedIn: false })
    mockNavigate = jest.fn()
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    mockSignInCreate = jest
      .fn()
      .mockResolvedValue({ status: "complete", createdSessionId: "session-id" })
    mockSetActive = jest.fn().mockResolvedValue(undefined)
    ;(useSignIn as jest.Mock).mockReturnValue({
      isLoaded: true,
      signIn: { create: mockSignInCreate },
      setActive: mockSetActive,
    })
    await renderAndLoadAsync(<SignIn assetPaths={{}} />)
  })

  afterEach(() => {
    restoreWindowLocation(originalLocation)
    cleanup()
  })

  it("shows the sign in form", () => {
    expect(screen.getByRole("heading", { name: /^sign in$/i, level: 1 })).not.toBeNull()
    expect(screen.getByRole("group", { name: /email/i })).not.toBeNull()
    expect(screen.getByRole("group", { name: /^password$/i })).not.toBeNull()
    expect(screen.getByRole("link", { name: /forgot password/i })).not.toBeNull()
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

  it("signs in and redirects on success", async () => {
    await submitCredentials()
    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledWith({
        identifier: "test@test.com",
        password: "abcd1234",
      })
    })
    expect(mockSetActive).toHaveBeenCalledWith({ session: "session-id" })
    expect(mockNavigate).toHaveBeenCalledWith("/account")
  })

  it("shows one alert and logs the details when sign in fails", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    const clerkError = { errors: [{ code: "form_password_incorrect" }] }
    mockSignInCreate.mockRejectedValue(clerkError)
    await submitCredentials("wrongPass1")

    await waitFor(() => {
      expect(screen.getAllByText(/email or password is incorrect/i)).toHaveLength(1)
    })
    expect(consoleError).toHaveBeenCalledWith("Sign in error", clerkError)
    expect(mockSetActive).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })
})
