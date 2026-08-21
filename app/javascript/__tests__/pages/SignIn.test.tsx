import React from "react"
import { MemoryRouter, Route, Routes } from "react-router"

import SignIn from "../../pages/sign-in"
import { renderAndLoadAsync } from "../__util__/renderUtils"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { authenticatedPost, post } from "../../api/apiService"
import { SiteAlert } from "../../components/SiteAlert"
import { t } from "@bloom-housing/ui-components"
import "@testing-library/jest-dom"
import TagManager from "react-gtm-module"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { clearHeaders, isTokenValid } from "../../authentication/token"

jest.mock("../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn((flagName: string) => ({
    flagsReady: true,
    unleashFlag: flagName !== "temp.webapp.auth.clerk",
  })),
}))

jest.mock("../../authentication/token", () => ({
  ...jest.requireActual("../../authentication/token"),
  isTokenValid: jest.fn(() => false),
  clearHeaders: jest.fn(),
}))

jest.mock("react-helmet-async", () => {
  return {
    HelmetProvider: ({ children }: { children: React.ReactNode }) => children, // Mock HelmetProvider
    Helmet: ({ children }: { children: React.ReactNode }) => children, // Mock Helmet component
  }
})

jest.mock("../../api/apiService", () => ({
  post: jest.fn(),
  authenticatedPost: jest.fn(),
}))

jest.mock("react-gtm-module", () => ({
  initialize: jest.fn(),
  dataLayer: jest.fn(),
}))

jest.mock("@bloom-housing/ui-seeds", () => {
  const originalModule = jest.requireActual("@bloom-housing/ui-seeds")

  const MockDialog = ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
    isOpen ? <div data-testid="modalMock">{children}</div> : null
  MockDialog.Header = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  MockDialog.Content = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  MockDialog.Footer = ({ children }: { children: React.ReactNode }) => <div>{children}</div>

  return {
    __esModule: true,
    ...originalModule,
    Dialog: MockDialog,
  }
})

const setLocationSearch = (search: string) => {
  Object.defineProperty(window, "location", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: {
      ...window.location,
      search,
      href: `http://dahlia.com/sign-in${search}`,
    },
  })
}

const renderWithAccountRoute = () =>
  renderAndLoadAsync(<SignIn assetPaths={{}} />, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/sign-in"]}>
        <Routes>
          <Route path="/sign-in" element={children} />
          <Route path="/account" element={<div>Account page</div>} />
        </Routes>
      </MemoryRouter>
    ),
  })

const mockSuccessfulSignIn = () => {
  ;(post as jest.Mock).mockResolvedValue({
    data: {
      data: {
        id: 1,
        uid: "abc",
        email: "test@test.com",
        created_at: new Date(),
        updated_at: new Date(),
      },
    },
    headers: {
      expiry: "9999999999",
      "access-token": "token",
      client: "client",
      uid: "abc",
      "token-type": "Bearer",
    },
  })
}

const submitSignInForm = async () => {
  await userEvent.type(screen.getByRole("textbox", { name: /email/i }), "test@test.com")
  await userEvent.type(screen.getByLabelText(/^password$/i), "Password1")
  await userEvent.click(screen.getByRole("button", { name: /sign in/i }))
}

describe("<SignIn />", () => {
  beforeEach(() => {
    jest.resetAllMocks()
    ;(useFeatureFlag as jest.Mock).mockImplementation((flagName: string) => ({
      flagsReady: true,
      unleashFlag: flagName !== "temp.webapp.auth.clerk",
    }))
    ;(isTokenValid as jest.Mock).mockReturnValue(false)
  })

  it("alerts if redirect is true", async () => {
    window.localStorage.setItem("newAccount", "test@test.com")

    await renderAndLoadAsync(<SignIn assetPaths={{}} />)

    await waitFor(() => {
      expect(screen.getByText("Check your email to finish creating your account")).not.toBeNull()
      expect(screen.getByText(/we sent a link to test@test\.com\./i)).not.toBeNull()
      expect(screen.queryByText("Email sent. Check your email.")).toBeNull()
    })
  })

  it("shows the correct form text", async () => {
    const { getAllByText, getByText, getByRole } = await renderAndLoadAsync(
      <SignIn assetPaths={{}} />
    )
    expect(getAllByText("Sign in")).not.toBeNull()
    expect(
      getByRole("textbox", {
        name: /email/i,
      })
    ).not.toBeNull()
    expect(getByText("Password")).not.toBeNull()
    expect(getByText("Create an account")).not.toBeNull()
  })

  it("shows the correct error message on submit", async () => {
    await renderAndLoadAsync(<SignIn assetPaths={{}} />)

    await userEvent.type(screen.getByRole("textbox", { name: /email/i }), "test")
    await userEvent.type(screen.getByLabelText(/^password$/i), "Pass")
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/Email or password is incorrect\. Check for mistakes and try again/i)
      ).not.toBeNull()
    })

    expect(
      screen.getByRole("link", {
        name: /reset your password/i,
      })
    ).toHaveAttribute("href", "/forgot-password?email=test")

    expect(
      screen.getByRole("link", {
        name: /forgot password\?/i,
      })
    ).toHaveAttribute("href", "/forgot-password?email=test")
  })

  it("shows the correct error message when bad credentials are entered", async () => {
    ;(post as jest.Mock).mockRejectedValueOnce({
      response: {
        status: 401,
        data: { error: "bad_credentials" },
      },
    })

    await renderAndLoadAsync(<SignIn assetPaths={{}} />)

    await userEvent.type(screen.getByRole("textbox", { name: /email/i }), "test@test.com")
    await userEvent.type(screen.getByLabelText(/^password$/i), "Password1")
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith("/api/v1/auth/sign_in", {
        email: "test@test.com",
        password: "Password1",
      })
    })

    await waitFor(() => {
      expect(
        screen.getByText(/Email or password is incorrect\. Check for mistakes and try again/i)
      ).not.toBeNull()
    })
  })

  it("shows an error message when a unknown error occurs", async () => {
    ;(post as jest.Mock).mockRejectedValueOnce({
      response: {
        status: 503,
        data: { error: "" },
      },
    })

    await renderAndLoadAsync(<SignIn assetPaths={{}} />)

    await userEvent.type(screen.getByRole("textbox", { name: /email/i }), "test@test.com")
    await userEvent.type(screen.getByLabelText(/^password$/i), "Password1")
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith("/api/v1/auth/sign_in", {
        email: "test@test.com",
        password: "Password1",
      })
    })

    await waitFor(() => {
      expect(
        screen.getByText(/Something went wrong\. Try again or refresh the page\./i)
      ).not.toBeNull()
    })
  })

  it("shows the correct expired unconfirmed email modal", async () => {
    const customLocation = {
      ...window.location,
      search: "?expiredUnconfirmed=test@test.com&id=123",
      href: "http://dahlia.com",
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      toString: jest.fn(),
    }

    Object.defineProperty(window, "location", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: customLocation,
    })

    await renderAndLoadAsync(<SignIn assetPaths={{}} />)

    await waitFor(() => {
      expect(screen.getByText("Confirmation link expired")).not.toBeNull()
      expect(screen.getByText("Send a new link")).not.toBeNull()
      expect(screen.queryByText("Email sent. Check your email.")).toBeNull()
    })

    expect(TagManager.dataLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        dataLayer: expect.objectContaining({
          event: "account_create_expired",
          user_id: "123",
        }),
      })
    )

    jest.resetAllMocks()
    ;(post as jest.Mock).mockRejectedValueOnce({
      response: {
        status: 400,
        data: { error: "Bad Request", message: "Invalid input" },
      },
    })

    await userEvent.click(
      screen.getByRole("button", {
        name: /send a new link/i,
      })
    )

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith("/api/v1/auth/confirmation", { email: "test@test.com" })
    })

    await waitFor(() => {
      expect(
        screen.getByText(
          "Something went wrong. We could not send an email. Try sending it again or refreshing the page."
        )
      ).not.toBeNull()
    })

    jest.resetAllMocks()
    ;(post as jest.Mock).mockResolvedValueOnce({
      response: {
        status: 200,
        data: { success: true },
      },
    })

    await userEvent.click(
      screen.getByRole("button", {
        name: /send a new link/i,
      })
    )

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith("/api/v1/auth/confirmation", { email: "test@test.com" })
    })

    await waitFor(() => {
      expect(screen.getByText("Email sent. Check your email.")).not.toBeNull()
    })
  })

  it("handles enter key press as submit", async () => {
    const { getByTestId } = await renderAndLoadAsync(<SignIn assetPaths={{}} />)
    ;(post as jest.Mock).mockRejectedValue({
      response: {
        status: 422,
        data: { error: "not_confirmed", email: "test@test.com" },
      },
    })

    const emailField = getByTestId("email-field")
    const passwordField = getByTestId("password-field")

    fireEvent.change(emailField, { target: { value: "test@test.com" } })
    fireEvent.change(passwordField, { target: { value: "test1234" } })
    fireEvent.keyPress(emailField, { key: "Enter", code: "Enter" })

    await waitFor(() => {
      expect(post).toHaveBeenCalled()
    })

    fireEvent.keyPress(passwordField, { key: "Enter", code: "Enter" })

    await waitFor(() => {
      expect(post).toHaveBeenCalled()
    })
  })

  it("shows the correct new account modal", async () => {
    ;(post as jest.Mock).mockRejectedValueOnce({
      response: {
        status: 422,
        data: { error: "not_confirmed", email: "test@test.com" },
      },
    })

    await renderAndLoadAsync(<SignIn assetPaths={{}} />)

    await userEvent.type(screen.getByRole("textbox", { name: /email/i }), "test@test.com")
    await userEvent.type(screen.getByLabelText(/^password$/i), "Password1")
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith("/api/v1/auth/sign_in", {
        email: "test@test.com",
        password: "Password1",
      })
    })

    await waitFor(() => {
      expect(screen.getByText("Check your email to finish creating your account")).not.toBeNull()
      expect(screen.getByText(/we sent a link to test@test\.com\./i)).not.toBeNull()
      expect(screen.queryByText("Email sent. Check your email.")).toBeNull()
    })

    jest.resetAllMocks()
    ;(post as jest.Mock).mockResolvedValueOnce({
      response: {
        status: 200,
        data: { success: true },
      },
    })

    await userEvent.click(
      screen.getByRole("button", {
        name: /send email again/i,
      })
    )

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith("/api/v1/auth/confirmation", { email: "test@test.com" })
    })

    await waitFor(() => {
      expect(screen.getByText("Email sent. Check your email.")).not.toBeNull()
    })

    jest.resetAllMocks()
    ;(post as jest.Mock).mockRejectedValueOnce({
      response: {
        status: 400,
        data: { error: "Bad Request", message: "Invalid input" },
      },
    })

    await userEvent.click(
      screen.getByRole("button", {
        name: /send email again/i,
      })
    )

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith("/api/v1/auth/confirmation", { email: "test@test.com" })
    })

    await waitFor(() => {
      expect(
        screen.getByText(
          "Something went wrong. We could not send an email. Try sending it again or refreshing the page."
        )
      ).not.toBeNull()
    })

    await userEvent.click(
      screen.getByRole("button", {
        name: /ok/i,
      })
    )

    await waitFor(() => {
      expect(screen.queryByText("Check your email to finish creating your account")).toBeNull()
      expect(screen.queryByText("Email sent. Check your email.")).toBeNull()
    })
  })

  it("shows the timeout limit banner", async () => {
    const mockGetItem = jest.fn()
    const mockSetItem = jest.fn()
    const mockRemoveItem = jest.fn()
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: (...args: string[]) => mockGetItem(...args),
        setItem: (...args: string[]) => mockSetItem(...args),
        removeItem: (...args: string[]) => mockRemoveItem(...args),
      },
    })
    window.localStorage.setItem("alert_message_secondary", t("signOut.alertMessage.timeout"))
    mockGetItem.mockImplementationOnce(() => t("signOut.alertMessage.timeout"))
    render(<SiteAlert type="secondary" />)
    expect(mockGetItem).toHaveBeenCalledWith("alert_message_secondary")
    window.localStorage.setItem("newAccount", "test@test.com")
    await renderAndLoadAsync(<SignIn assetPaths={{}} />)
    expect(screen.getByText(t("signOut.alertMessage.timeout"))).not.toBeNull()
  })

  it("shows the correct expired confirmed email modal", async () => {
    const customLocation = {
      ...window.location,
      search: "?expiredConfirmed=test@test.com",
      href: "http://dahlia.com",
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      toString: jest.fn(),
    }

    Object.defineProperty(window, "location", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: customLocation,
    })

    await renderAndLoadAsync(<SignIn assetPaths={{}} />)

    await waitFor(() => {
      expect(screen.getByText("Account already confirmed")).not.toBeNull()
      expect(screen.getByText("Sign in to continue.")).not.toBeNull()
    })
  })

  it("redirects to the account overview if the user is already signed in", async () => {
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })
    ;(isTokenValid as jest.Mock).mockReturnValue(true)

    await renderAndLoadAsync(<SignIn assetPaths={{}} />, {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={["/sign-in"]}>
          <Routes>
            <Route path="/sign-in" element={children} />
            <Route path="/account" element={<div>Account page</div>} />
          </Routes>
        </MemoryRouter>
      ),
    })

    await waitFor(() => {
      expect(screen.getByText("Account page")).not.toBeNull()
    })
    expect(screen.queryByRole("textbox", { name: /email/i })).toBeNull()
  })

  describe("Housing counselor access", () => {
    beforeEach(() => {
      setLocationSearch("")
      window.scrollTo = jest.fn()
      jest.spyOn(console, "log").mockImplementation(() => {})
      ;(authenticatedPost as jest.Mock).mockResolvedValue({})
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it("authenticates the housing counselor JWT after a successful sign in and redirects to the account overview page", async () => {
      setLocationSearch("?t=jwt.token")
      mockSuccessfulSignIn()

      await renderWithAccountRoute()
      await submitSignInForm()

      await waitFor(() => {
        expect(authenticatedPost).toHaveBeenCalledWith("/api/v1/housing-counselor/access", {
          t: "jwt.token",
        })
      })
      expect(await screen.findByText("Account page")).not.toBeNull()
    })

    it("shows an error and stays on sign in when housing counselor authentication fails", async () => {
      setLocationSearch("?t=jwt.token")
      mockSuccessfulSignIn()
      ;(authenticatedPost as jest.Mock).mockRejectedValue(new Error("forbidden"))

      await renderWithAccountRoute()
      await submitSignInForm()

      await waitFor(() => {
        expect(authenticatedPost).toHaveBeenCalledWith("/api/v1/housing-counselor/access", {
          t: "jwt.token",
        })
      })
      expect(clearHeaders).toHaveBeenCalled()
      expect(screen.getByRole("alert")).not.toBeNull()
      expect(screen.queryByText("Account page")).toBeNull()
      expect(screen.getByRole("textbox", { name: /email/i })).not.toBeNull()
    })

    it("authenticates the housing counselor JWT with an already signed in user and redirects to the account overview page", async () => {
      setLocationSearch("?t=jwt.token")
      ;(isTokenValid as jest.Mock).mockReturnValue(true)

      await renderWithAccountRoute()

      await waitFor(() => {
        expect(authenticatedPost).toHaveBeenCalledWith("/api/v1/housing-counselor/access", {
          t: "jwt.token",
        })
      })
      expect(await screen.findByText("Account page")).not.toBeNull()
    })

    it("shows an error and stays on sign in when housing counselor authentication fails with an already signed in user", async () => {
      setLocationSearch("?t=jwt.token")
      ;(isTokenValid as jest.Mock).mockReturnValue(true)
      ;(authenticatedPost as jest.Mock).mockRejectedValue(new Error("forbidden"))

      await renderWithAccountRoute()

      await waitFor(() => {
        expect(authenticatedPost).toHaveBeenCalledWith("/api/v1/housing-counselor/access", {
          t: "jwt.token",
        })
      })
      expect(clearHeaders).toHaveBeenCalled()
      expect(screen.getByRole("alert")).not.toBeNull()
      expect(screen.queryByText("Account page")).toBeNull()
      expect(screen.getByRole("textbox", { name: /email/i })).not.toBeNull()
    })
  })
})
