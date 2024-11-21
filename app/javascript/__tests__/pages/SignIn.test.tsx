/* eslint-disable react/prop-types */
import React from "react"

import SignIn from "../../pages/sign-in"
import { renderAndLoadAsync } from "../__util__/renderUtils"
import { screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { post } from "../../api/apiService"

jest.mock("react-helmet-async", () => {
  return {
    HelmetProvider: ({ children }: { children: React.ReactNode }) => children, // Mock HelmetProvider
    Helmet: ({ children }: { children: React.ReactNode }) => children, // Mock Helmet component
  }
})

jest.mock("@bloom-housing/ui-components", () => ({
  ...jest.requireActual("@bloom-housing/ui-components"),
  debounce: (fn) => fn,
}))

jest.mock("../../api/apiService", () => ({
  post: jest.fn(),
}))

jest.mock("@bloom-housing/ui-seeds", () => {
  const originalModule = jest.requireActual("@bloom-housing/ui-seeds")

  const MockDialog = ({ children, isOpen }) =>
    isOpen ? <div data-testid="modalMock">{children}</div> : null
  MockDialog.Header = ({ children }) => <div>{children}</div>
  MockDialog.Content = ({ children }) => <div>{children}</div>
  MockDialog.Footer = ({ children }) => <div>{children}</div>

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
      expect(screen.getByText(/invalid login credentials\. please try again\./i)).not.toBeNull()
    })
  })

  it("shows the correct expired unconfirmed modal", async () => {
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
})
