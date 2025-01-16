import React from "react"

import ForgotPassword from "../../pages/forgot-password"
import { renderAndLoadAsync } from "../__util__/renderUtils"
import { screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"

jest.mock("react-helmet-async", () => {
  return {
    HelmetProvider: ({ children }: { children: React.ReactNode }) => children, // Mock HelmetProvider
    Helmet: ({ children }: { children: React.ReactNode }) => children, // Mock Helmet component
  }
})

describe("<ForgotPassword />", () => {
  it("shows the correct form text", async () => {
    const { getAllByText } = await renderAndLoadAsync(<ForgotPassword assetPaths={{}} />)
    expect(getAllByText("Forgot password")).not.toBeNull()
    expect(getAllByText("Cancel")).not.toBeNull()
  })

  it("shows the text after submission", async () => {
    await renderAndLoadAsync(<ForgotPassword assetPaths={{}} />)
    await userEvent.type(screen.getByRole("textbox", { name: /email/i }), "test@test.com")
    await userEvent.click(screen.getByRole("button", { name: /send email/i }))
    expect(screen.getByText("We sent you an email")).not.toBeNull()
    expect(
      screen.getByText(
        "If there is an account with that email address, you will get an email with a link to reset your password."
      )
    ).not.toBeNull()
  })

  it("should extract the email parameter from the URL", async () => {
    const customLocation = {
      ...window.location,
      search: "?email=test@test.com",
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
    await renderAndLoadAsync(<ForgotPassword assetPaths={{}} />)

    const emailInput = screen.getByLabelText(/email/i)
    expect(emailInput).toHaveValue("test@test.com")
  })

  it("should handle the absence of the email parameter", async () => {
    const customLocation = {
      ...window.location,
      search: "",
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
    await renderAndLoadAsync(<ForgotPassword assetPaths={{}} />)

    const emailInput = screen.getByLabelText(/email/i)
    expect(emailInput).toHaveValue("")
  })
})
