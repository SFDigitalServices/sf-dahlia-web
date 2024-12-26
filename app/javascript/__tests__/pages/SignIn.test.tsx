import React from "react"

import SignIn from "../../pages/sign-in"
import { renderAndLoadAsync } from "../__util__/renderUtils"
import { render, screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { post } from "../../api/apiService"
import { SiteAlert } from "../../components/SiteAlert"
import { t } from "@bloom-housing/ui-components"

jest.mock("react-helmet-async", () => {
  return {
    HelmetProvider: ({ children }: { children: React.ReactNode }) => children, // Mock HelmetProvider
    Helmet: ({ children }: { children: React.ReactNode }) => children, // Mock Helmet component
  }
})

jest.mock("../../api/apiService", () => ({
  post: jest.fn(),
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

describe("<SignIn />", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("alerts if redirect is true", async () => {
    window.sessionStorage.setItem("newAccount", "test@test.com")

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

    await userEvent.type(screen.getByRole("textbox", { name: /email/i }), "test@test.com")
    await userEvent.type(screen.getByLabelText(/^password$/i), "Password1")
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/Email or password is incorrect\. Check for mistakes and try again/i)
      ).not.toBeNull()
    })
  })

  it("shows the correct error message when bad credentials are entered", async () => {
    ;(post as jest.Mock).mockRejectedValueOnce({
      response: {
        status: 401,
        data: { error: "bad_credentials" },
      },
    })

    await renderAndLoadAsync(<SignIn assetPaths={{}} />)

    await userEvent.type(screen.getByRole("textbox", { name: /email/i }), "test")
    await userEvent.type(screen.getByLabelText(/^password$/i), "Pass")
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }))

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
      search: "?expiredUnconfirmed=test@test.com",
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
    Object.defineProperty(window, "sessionStorage", {
      value: {
        getItem: (...args: string[]) => mockGetItem(...args),
        setItem: (...args: string[]) => mockSetItem(...args),
        removeItem: (...args: string[]) => mockRemoveItem(...args),
      },
    })
    window.sessionStorage.setItem("alert_message_secondary", t("signOut.alertMessage.timeout"))
    mockGetItem.mockImplementationOnce(() => t("signOut.alertMessage.timeout"))
    render(<SiteAlert type="secondary" />)
    expect(mockGetItem).toHaveBeenCalledWith("alert_message_secondary")
    window.sessionStorage.setItem("newAccount", "test@test.com")
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
      expect(screen.getByText("Sign in to continue")).not.toBeNull()
    })
  })
})
