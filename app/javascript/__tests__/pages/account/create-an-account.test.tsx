import React from "react"
import { useSignUp } from "@clerk/clerk-react"
import { screen, waitFor, within, cleanup } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import CreateAnAccount from "../../../pages/account/create-an-account"
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../../__util__/renderUtils"
import { setupUserContext } from "../../__util__/accountUtils"

jest.mock("@clerk/clerk-react", () => {
  const Clerk = jest.requireActual("@clerk/clerk-react")
  return {
    ...Clerk,
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
    useSignUp: jest.fn(),
  }
})

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: jest.fn(),
}))

describe("<CreateAnAccount />", () => {
  let originalLocation: Location
  let mockSignUpCreate: jest.Mock
  let mockPrepareEmailAddressVerification: jest.Mock

  beforeEach(async () => {
    document.documentElement.lang = "en"
    originalLocation = mockWindowLocation()
    setupUserContext({ loggedIn: false })
    mockSignUpCreate = jest.fn().mockResolvedValue(undefined)
    mockPrepareEmailAddressVerification = jest.fn().mockResolvedValue(undefined)
    ;(useSignUp as jest.Mock).mockReturnValue({
      isLoaded: true,
      signUp: {
        create: mockSignUpCreate,
        prepareEmailAddressVerification: mockPrepareEmailAddressVerification,
      },
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

    expect(mockPrepareEmailAddressVerification).toHaveBeenCalledWith({
      strategy: "email_code",
    })
  })
})
