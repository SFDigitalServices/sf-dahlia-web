import React from "react"
import { useSignUp } from "@clerk/clerk-react"
import { screen, waitFor, cleanup } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useLocation, useNavigate } from "react-router"
import EnterCode from "../../../pages/account/enter-code"
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../../__util__/renderUtils"
import { setupUserContext } from "../../__util__/accountUtils"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"

jest.mock("@clerk/clerk-react", () => {
  const Clerk = jest.requireActual("@clerk/clerk-react")
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
  useLocation: jest.fn(),
}))

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ flagsReady: true, unleashFlag: true })),
}))

describe("<EnterCode />", () => {
  let originalLocation: Location
  let mockNavigate: jest.Mock

  beforeEach(async () => {
    document.documentElement.lang = "en"
    originalLocation = mockWindowLocation()
    setupUserContext({ loggedIn: false })
    mockNavigate = jest.fn()
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    ;(useLocation as jest.Mock).mockReturnValue({ state: { email: "test@example.com" } })
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
    ;(useSignUp as jest.Mock).mockReturnValue({ isLoaded: true })
    await renderAndLoadAsync(<EnterCode assetPaths={{}} />)
  })

  afterEach(() => {
    restoreWindowLocation(originalLocation)
    cleanup()
  })

  it("shows the enter code form", () => {
    expect(
      screen.getByRole("heading", { name: /check your email for a code/i, level: 1 })
    ).not.toBeNull()
    expect(screen.getByText(/we sent a code to:/i)).not.toBeNull()
    expect(screen.getByText("test@example.com")).not.toBeNull()
    expect(screen.getByRole("link", { name: /edit email/i }).getAttribute("href")).toBe(
      "/create-account"
    )
    expect(screen.getByRole("textbox", { name: /enter code/i })).not.toBeNull()
    expect(screen.getByRole("button", { name: /confirm code/i })).not.toBeNull()
    expect(screen.getByRole("button", { name: /send again/i })).not.toBeNull()
    expect(screen.getByRole("heading", { name: /get help/i })).not.toBeNull()
    expect(
      screen
        .getByRole("link", { name: /how to create an account or find help/i })
        .getAttribute("href")
    ).toBe("https://www.sf.gov/learn-how-to-create-dahlia-account")
  })

  it("shows an error when code is missing", async () => {
    const user = userEvent.setup()
    const codeField = screen.getByRole("textbox", { name: /enter code/i })

    await user.type(codeField, "1")
    await user.clear(codeField)

    expect(codeField).toBeInvalid()
    expect(screen.getByTestId("error-message")).toHaveTextContent("Enter code")
  })

  it("redirects to create account when clerk is disabled", async () => {
    cleanup()
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })
    await renderAndLoadAsync(<EnterCode assetPaths={{}} />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/create-account")
    })
  })
})
