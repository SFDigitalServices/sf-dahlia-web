import React from "react"
import { useSignIn, useUser } from "@clerk/clerk-react"
import { screen, waitFor, cleanup } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useLocation, useNavigate } from "react-router"
import AddPassword from "../../../pages/account/add-password"
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../../__util__/renderUtils"
import { setupUserContext } from "../../__util__/accountUtils"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"
import { AUTH_FLOW } from "../../../modules/constants"

jest.mock("@clerk/clerk-react", () => {
  const Clerk = jest.requireActual("@clerk/clerk-react")
  return {
    ...Clerk,
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
    useAuth: jest.fn(),
    useUser: jest.fn(),
    useSignIn: jest.fn(),
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

describe("<AddPassword />", () => {
  let originalLocation: Location
  let mockNavigate: jest.Mock
  let mockUpdatePassword: jest.Mock

  beforeEach(async () => {
    document.documentElement.lang = "en"
    originalLocation = mockWindowLocation()
    setupUserContext({ loggedIn: false })
    mockNavigate = jest.fn()
    mockUpdatePassword = jest.fn().mockResolvedValue(undefined)
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    ;(useLocation as jest.Mock).mockReturnValue({
      state: { flow: AUTH_FLOW.CREATE_ACCOUNT },
    })
    ;(useSignIn as jest.Mock).mockReturnValue({
      isLoaded: true,
      signIn: { resetPassword: jest.fn(), status: null },
      setActive: jest.fn(),
    })
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
    ;(useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: { updatePassword: mockUpdatePassword },
    })
    await renderAndLoadAsync(<AddPassword assetPaths={{}} />)
  })

  afterEach(() => {
    restoreWindowLocation(originalLocation)
    cleanup()
  })

  it("shows the add password page", () => {
    expect(screen.getByRole("heading", { name: /add a password/i, level: 1 })).not.toBeNull()
    expect(screen.getByText(/it's okay to skip this step/i)).not.toBeNull()
    expect(screen.getByRole("group", { name: /choose password \(optional\)/i })).not.toBeNull()
    expect(screen.getByText(/must include at least:/i)).not.toBeNull()
    expect(screen.getByTestId("password-field")).not.toBeNull()
    expect(screen.getByLabelText(/show password/i)).not.toBeNull()
    expect(screen.getByRole("button", { name: /save password/i })).not.toBeNull()
    expect(screen.getByRole("button", { name: /skip for now/i })).not.toBeNull()
    expect(screen.getByRole("heading", { name: /get help/i })).not.toBeNull()
  })

  it("saves a valid password", async () => {
    const user = userEvent.setup()

    await user.type(screen.getByTestId("password-field"), "abcd1234")
    await user.click(screen.getByRole("button", { name: /save password/i }))

    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith({ newPassword: "abcd1234" })
    })
    expect(screen.queryByTestId("error-message")).toBeNull()
  })

  it("shows a validation error for an invalid password", async () => {
    const user = userEvent.setup()

    await user.type(screen.getByTestId("password-field"), "abc")
    await user.click(screen.getByRole("button", { name: /save password/i }))

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Choose a strong password with at least 8 characters, 1 letter, and 1 number"
      )
    })
    expect(mockUpdatePassword).not.toHaveBeenCalled()
  })

  it("does not save a password when skipping", async () => {
    const user = userEvent.setup()

    await user.click(screen.getByRole("button", { name: /skip for now/i }))

    expect(mockUpdatePassword).not.toHaveBeenCalled()
  })

  it("shows an error when the password update fails", async () => {
    const user = userEvent.setup()
    jest.spyOn(console, "error").mockImplementation(() => {})
    mockUpdatePassword.mockRejectedValue(new Error("nope"))

    await user.type(screen.getByTestId("password-field"), "abcd1234")
    await user.click(screen.getByRole("button", { name: /save password/i }))

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).not.toBeNull()
    })
  })

  it("redirects to create account when clerk is disabled", async () => {
    cleanup()
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })
    await renderAndLoadAsync(<AddPassword assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/create-account")
    })
  })

  it("redirects to create account when the user is not signed in", async () => {
    cleanup()
    ;(useUser as jest.Mock).mockReturnValue({ isLoaded: true, isSignedIn: false, user: null })
    await renderAndLoadAsync(<AddPassword assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/create-account")
    })
  })
})
