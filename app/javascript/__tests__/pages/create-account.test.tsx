import React from "react"

import CreateAccountPage from "../../pages/account/create-account"
import { renderAndLoadAsync } from "../__util__/renderUtils"
import { post } from "../../api/apiService"
import { act } from "react-dom/test-utils"
import { fireEvent, screen, within } from "@testing-library/dom"

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

  it.only("creates a new account", async () => {
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
      fireEvent.change(firstNameField, { target: { value: "NewFirstName" } })
      fireEvent.change(lastNameField, { target: { value: "NewLastName" } })
      fireEvent.change(monthField, { target: { value: 2 } })
      fireEvent.change(dayField, { target: { value: 6 } })
      fireEvent.change(yearField, { target: { value: 1990 } })
      fireEvent.change(emailField, { target: { value: "test@test.com" } })
      fireEvent.change(passwordField, { target: { value: "testpassword1" } })
      // fireEvent.click(createAccountButton)
      createAccountButton.dispatchEvent(new MouseEvent("click"))
      await promise
    })

    screen.logTestingPlaygroundURL()
    expect(post).toHaveBeenCalledWith("/api/v1/auth")
  })
})
