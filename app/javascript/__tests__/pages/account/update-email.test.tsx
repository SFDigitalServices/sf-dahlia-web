import React from "react"
import { useAuth, useUser } from "@clerk/react"
import { t } from "@bloom-housing/ui-components"
import { act, cleanup, fireEvent, screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useNavigate } from "react-router"
import UpdateEmail from "../../../pages/account/update-email"
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../../__util__/renderUtils"
import { setupUserContext } from "../../__util__/accountUtils"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"
import { AUTH_FLOW } from "../../../modules/constants"
import {
  getMyAccountSettingsPath,
  getSignInPath,
  getUpdateEmailCodePath,
} from "../../../util/routeUtil"

jest.mock("@clerk/react", () => {
  const Clerk = jest.requireActual("@clerk/react")
  return {
    ...Clerk,
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
    useAuth: jest.fn(),
    useUser: jest.fn(),
  }
})

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: jest.fn(),
}))

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ flagsReady: true, unleashFlag: true })),
}))

const makeUser = (overrides = {}) => ({
  primaryEmailAddress: { emailAddress: "current@example.com" },
  primaryEmailAddressId: "current",
  emailAddresses: [],
  createEmailAddress: jest.fn().mockResolvedValue({
    prepareVerification: jest.fn().mockResolvedValue(undefined),
  }),
  ...overrides,
})

const renderPage = async (user: unknown = makeUser()) => {
  cleanup()
  ;(useUser as jest.Mock).mockReturnValue({ isLoaded: true, user })
  await renderAndLoadAsync(<UpdateEmail assetPaths={{}} />)
}

const submitEmail = async (email: string) => {
  const user = userEvent.setup()
  await user.type(screen.getByRole("textbox"), email)
  await user.click(screen.getByRole("button", { name: t("createAccount.getCode") }))
}

describe("<UpdateEmail />", () => {
  let originalLocation: Location
  let mockNavigate: jest.Mock

  beforeEach(() => {
    document.documentElement.lang = "en"
    originalLocation = mockWindowLocation()
    setupUserContext({ loggedIn: true })
    mockNavigate = jest.fn()
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
    ;(useAuth as jest.Mock).mockReturnValue({ isLoaded: true, isSignedIn: true })
  })

  afterEach(() => {
    restoreWindowLocation(originalLocation)
    cleanup()
  })

  it("redirects to sign-in when clerk is disabled", async () => {
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })
    await renderPage()

    expect(mockNavigate).toHaveBeenCalledWith(getSignInPath())
  })

  it("renders nothing while flags are loading", async () => {
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: false, unleashFlag: false })
    await renderPage()

    expect(screen.queryByRole("textbox")).toBeNull()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("renders nothing while auth is loading", async () => {
    ;(useAuth as jest.Mock).mockReturnValue({ isLoaded: false, isSignedIn: false })
    await renderPage()

    expect(screen.queryByRole("textbox")).toBeNull()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("redirects to sign-in when signed out", async () => {
    ;(useAuth as jest.Mock).mockReturnValue({ isLoaded: true, isSignedIn: false })
    await renderPage()

    expect(mockNavigate).toHaveBeenCalledWith(getSignInPath())
  })

  it("renders nothing while the user is loading", async () => {
    cleanup()
    ;(useUser as jest.Mock).mockReturnValue({ isLoaded: false, user: null })
    await renderAndLoadAsync(<UpdateEmail assetPaths={{}} />)

    expect(screen.queryByRole("textbox")).toBeNull()
  })

  it("navigates back to account settings on cancel", async () => {
    await renderPage()
    fireEvent.click(screen.getByRole("button", { name: t("label.cancel") }))

    expect(mockNavigate).toHaveBeenCalledWith(getMyAccountSettingsPath())
  })

  it("shows a validation error when the email is empty", async () => {
    const user = makeUser()
    await renderPage(user)

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: t("createAccount.getCode") }))
      await Promise.resolve()
    })

    expect(user.createEmailAddress).not.toHaveBeenCalled()
  })

  it("does not create an email when it matches the current email", async () => {
    const user = makeUser()
    await renderPage(user)
    await submitEmail("Current@Example.com")

    expect(user.createEmailAddress).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("removes a leftover unverified email, sends a code, and navigates", async () => {
    const leftover = { id: "leftover", emailAddress: "new@example.com", destroy: jest.fn() }
    const user = makeUser({ emailAddresses: [leftover] })
    await renderPage(user)
    await submitEmail("new@example.com")

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(getUpdateEmailCodePath(), {
        state: { email: "new@example.com", flow: AUTH_FLOW.UPDATE_EMAIL },
      })
    })
    expect(leftover.destroy).toHaveBeenCalled()
    expect(user.createEmailAddress).toHaveBeenCalledWith({ email: "new@example.com" })
  })

  it("does not remove the matching email when it is the primary email", async () => {
    const primary = { id: "current", emailAddress: "new@example.com", destroy: jest.fn() }
    const user = makeUser({ primaryEmailAddress: null, emailAddresses: [primary] })
    await renderPage(user)
    await submitEmail("new@example.com")

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled()
    })
    expect(primary.destroy).not.toHaveBeenCalled()
  })

  it("does not navigate when creating the email fails", async () => {
    const user = makeUser({
      createEmailAddress: jest.fn().mockRejectedValue(new Error("create failed")),
    })
    await renderPage(user)
    await submitEmail("new@example.com")

    await waitFor(() => {
      expect(user.createEmailAddress).toHaveBeenCalled()
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("ignores a second submit while the first is loading", async () => {
    const user = makeUser({ createEmailAddress: jest.fn(() => new Promise(() => {})) })
    await renderPage(user)
    await submitEmail("new@example.com")

    await waitFor(() => {
      expect(user.createEmailAddress).toHaveBeenCalledTimes(1)
    })

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: t("createAccount.getCode") }))
      await Promise.resolve()
    })

    expect(user.createEmailAddress).toHaveBeenCalledTimes(1)
  })
})
