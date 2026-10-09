import { t } from "@bloom-housing/ui-components"
import { useAuth } from "@clerk/react"
import { act, cleanup, fireEvent, screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import React from "react"
import { useLocation, useNavigate } from "react-router"
import * as authApiService from "../../../api/authApiService"
import * as authStatus from "../../../authentication/session/authStatus"
import { useSignUpSession } from "../../../authentication/session/useSignUpSession"
import { User } from "../../../authentication/user"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"
import { AUTH_FLOW } from "../../../modules/constants"
import UpdateEmail from "../../../pages/account/update-email"
import {
  getMyAccountContactPath,
  getMyAccountSettingsPath,
  getSignInPath,
  getUpdateEmailCodePath,
} from "../../../util/routeUtil"
import { mockProfileStub, setupUserContext } from "../../__util__/accountUtils"
import {
  mockWindowLocation,
  renderAndLoadAsync,
  restoreWindowLocation,
} from "../../__util__/renderUtils"

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
  useLocation: jest.fn(),
}))

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ flagsReady: true, unleashFlag: true })),
}))

jest.mock("../../../authentication/session/useSignUpSession", () => ({
  useSignUpSession: jest.fn(),
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
  ;(useSignUpSession as jest.Mock).mockReturnValue({ user, isAccountInitialized: true })
  await renderAndLoadAsync(<UpdateEmail assetPaths={{}} />)
}

const submitEmail = async (email: string) => {
  const user = userEvent.setup()
  await user.type(screen.getByRole("textbox"), email)
  await user.click(screen.getByRole("button", { name: t("createAccount.getCode") }))
}

const contactFlowLocation = (state: Record<string, unknown> = {}) => {
  ;(useLocation as jest.Mock).mockReturnValue({
    pathname: "/update-email",
    state: { flow: AUTH_FLOW.UPDATE_CONTACT_EMAIL, ...state },
  })
}

describe("<UpdateEmail />", () => {
  let originalLocation: Location
  let mockNavigate: jest.Mock
  let updateContactEmailSpy: jest.SpyInstance

  beforeEach(() => {
    document.documentElement.lang = "en"
    originalLocation = mockWindowLocation()
    setupUserContext({ loggedIn: true })
    mockNavigate = jest.fn()
    ;(useNavigate as jest.Mock).mockReturnValue(mockNavigate)
    ;(useLocation as jest.Mock).mockReturnValue({ pathname: "/update-email", state: null })
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
    // Same object every call, so getToken keeps one identity across renders
    ;(useAuth as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: jest.fn().mockResolvedValue("clerk-session-token"),
    })

    jest.spyOn(authStatus, "bearerToken").mockReturnValue("test-token")
    updateContactEmailSpy = jest
      .spyOn(authApiService, "updateContactEmail")
      .mockResolvedValue({ email: "current@example.com" } as User)
  })

  afterEach(() => {
    jest.restoreAllMocks()
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
    ;(useSignUpSession as jest.Mock).mockReturnValue({ user: null, isAccountInitialized: false })
    await renderAndLoadAsync(<UpdateEmail assetPaths={{}} />)

    expect(screen.queryByRole("textbox")).toBeNull()
  })

  it.each([
    ["account settings", null, getMyAccountSettingsPath()],
    ["the contact page", { flow: AUTH_FLOW.UPDATE_CONTACT_EMAIL }, getMyAccountContactPath()],
  ])("navigates back to %s on cancel", async (_page, state, expectedPath) => {
    ;(useLocation as jest.Mock).mockReturnValue({ pathname: "/update-email", state })
    await renderPage()
    fireEvent.click(screen.getByRole("button", { name: t("label.cancel") }))

    expect(mockNavigate).toHaveBeenCalledWith(expectedPath)
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
    const leftover = {
      id: "leftover",
      emailAddress: "new@example.com",
      linkedTo: [],
      destroy: jest.fn().mockResolvedValue(undefined),
    }
    const user = makeUser({ emailAddresses: [leftover] })
    await renderPage(user)
    await submitEmail("new@example.com")

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(getUpdateEmailCodePath(), {
        state: { email: "new@example.com", flow: AUTH_FLOW.UPDATE_LOGIN_EMAIL },
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

  it("removes stale verified addresses but never the primary or linked addresses", async () => {
    const primary = {
      id: "current",
      emailAddress: "current@example.com",
      verification: { status: "verified" },
      linkedTo: [],
      destroy: jest.fn(),
    }
    const staleVerified = {
      id: "stale",
      emailAddress: "stale@example.com",
      verification: { status: "verified" },
      linkedTo: [],
      destroy: jest.fn().mockResolvedValue(undefined),
    }
    const linked = {
      id: "linked",
      emailAddress: "google@example.com",
      verification: { status: "verified" },
      linkedTo: [{ id: "oauth_google", type: "oauth_google" }],
      destroy: jest.fn(),
    }
    const user = makeUser({
      primaryEmailAddress: primary,
      emailAddresses: [primary, staleVerified, linked],
    })
    await renderPage(user)
    await submitEmail("new@example.com")

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(getUpdateEmailCodePath(), {
        state: { email: "new@example.com", flow: AUTH_FLOW.UPDATE_LOGIN_EMAIL },
      })
    })
    expect(staleVerified.destroy).toHaveBeenCalled()
    expect(primary.destroy).not.toHaveBeenCalled()
    expect(linked.destroy).not.toHaveBeenCalled()
  })

  describe("contact email flow", () => {
    it("does nothing when the email matches the current contact email", async () => {
      contactFlowLocation()
      const user = makeUser()
      await renderPage(user)
      await submitEmail(String(mockProfileStub.email))

      expect(user.createEmailAddress).not.toHaveBeenCalled()
      expect(updateContactEmailSpy).not.toHaveBeenCalled()
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it("sends a code for a new contact email", async () => {
      contactFlowLocation()
      const user = makeUser()
      await renderPage(user)
      await submitEmail("new@example.com")

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(getUpdateEmailCodePath(), {
          state: { email: "new@example.com", flow: AUTH_FLOW.UPDATE_CONTACT_EMAIL },
        })
      })
      expect(user.createEmailAddress).toHaveBeenCalledWith({ email: "new@example.com" })
      expect(updateContactEmailSpy).not.toHaveBeenCalled()
    })

    it("saves the login email as the contact email without a code", async () => {
      contactFlowLocation()
      const user = makeUser()
      await renderPage(user)
      await submitEmail("current@example.com")

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(getMyAccountContactPath(), {
          state: { contactEmailChanged: true },
        })
      })
      expect(updateContactEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({ email: "current@example.com" }),
        { clerkEnabled: true, sessionToken: "test-token" }
      )
      expect(user.createEmailAddress).not.toHaveBeenCalled()
    })

    it("shows an error when saving the login email as the contact email fails", async () => {
      contactFlowLocation()
      updateContactEmailSpy.mockRejectedValue(new Error("salesforce down"))
      const user = makeUser()
      await renderPage(user)
      await submitEmail("current@example.com")

      await waitFor(() => {
        expect(updateContactEmailSpy).toHaveBeenCalled()
      })
      expect(mockNavigate).not.toHaveBeenCalled()
      expect(user.createEmailAddress).not.toHaveBeenCalled()
    })

    it.each([
      [
        "there is no session token",
        () => {
          ;(authStatus.bearerToken as jest.Mock).mockReturnValue(undefined)
        },
      ],
      [
        "there is no profile",
        () => {
          setupUserContext({ loggedIn: true, hasProfile: false })
        },
      ],
    ])("does not save when %s", async (_case, setup) => {
      contactFlowLocation()
      setup()
      await renderPage()
      await submitEmail("current@example.com")

      await act(async () => {
        await Promise.resolve()
      })
      expect(updateContactEmailSpy).not.toHaveBeenCalled()
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it("shows an error and clears the flag after a failed save on the code page", async () => {
      contactFlowLocation({ saveFailed: true })
      await renderPage()

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/update-email", {
          replace: true,
          state: { flow: AUTH_FLOW.UPDATE_CONTACT_EMAIL },
        })
      })
    })
  })
})
