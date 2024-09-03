import React from "react"

import CreateAccountPage from "../../pages/account/create-account"
import { renderAndLoadAsync } from "../__util__/renderUtils"
import { post } from "../../api/apiService"
import { act } from "react-dom/test-utils"
import { screen, within } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"

jest.mock("../../api/apiService", () => ({
  post: jest.fn(),
}))

describe("<CreateAccount />", () => {
  let promise
  let getByLabelText
  let renderResult

  beforeEach(async () => {
    promise = Promise.resolve()
    renderResult = await renderAndLoadAsync(<CreateAccountPage assetPaths={{}} />)
    getByLabelText = renderResult.getByLabelText
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("shows the correct form text", async () => {
    const { getAllByText } = await renderAndLoadAsync(<CreateAccountPage assetPaths={{}} />)
    expect(getAllByText("Create an account")).not.toBeNull()
  })

  it("creates a new account", async () => {
    const user = userEvent.setup()
    ;(post as jest.Mock).mockResolvedValue({
      data: {
        status: "success",
      },
    })

    const createAccountButton = screen.getByRole("button", {
      name: /create account/i,
    })
    const firstNameField: Element = screen.getByRole("textbox", {
      name: /first name/i,
    })
    const lastNameField: Element = screen.getByRole("textbox", {
      name: /last name/i,
    })
    const monthField: Element = screen.getByRole("textbox", {
      name: /month/i,
    })
    const dayField: Element = screen.getByRole("textbox", {
      name: /day/i,
    })
    const yearField: Element = screen.getByRole("textbox", {
      name: /year/i,
    })
    const emailGroup = screen.getByRole("group", {
      name: /email/i,
    })
    const emailField = within(emailGroup).getByRole("textbox")
    const passwordField: Element = getByLabelText(/password/i)
    await act(async () => {
      await user.type(firstNameField, "NewFirstName")
      await user.type(lastNameField, "NewLastName")
      await user.type(monthField, "2")
      await user.type(dayField, "6")
      await user.type(yearField, "1990")
      await user.type(emailField, "test@test.com")
      await user.type(passwordField, "testpassword1")
      await user.click(createAccountButton)
      await promise
    })

    expect(post).toHaveBeenCalledWith(
      "/api/v1/auth",
      expect.objectContaining({
        user: expect.objectContaining({
          email: "test@test.com",
          password: "testpassword1",
          password_confirmation: "testpassword1",
        }),
      })
    )
  })
})
