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

const defaultFormValues = {
  firstName: "Test",
  lastName: "User",
  month: "01",
  day: "01",
  year: "2000",
  email: "test@test.com",
  password: "password1",
}

async function fillCreateAccountForm({
  firstName,
  lastName,
  month,
  day,
  year,
  email,
  password,
}: {
  firstName: string
  lastName: string
  month: string
  day: string
  year: string
  email: string
  password: string
}) {
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
  const passwordField: Element = screen.getByLabelText(/password/i)

  await act(async () => {
    await userEvent.type(firstNameField, firstName)
    await userEvent.type(lastNameField, lastName)
    await userEvent.type(monthField, month)
    await userEvent.type(dayField, day)
    await userEvent.type(yearField, year)
    await userEvent.type(emailField, email)
    await userEvent.type(passwordField, password)
  })
}

describe("<CreateAccount />", () => {
  let promise
  let getByLabelText
  let renderResult
  let user

  beforeEach(async () => {
    promise = Promise.resolve()
    renderResult = await renderAndLoadAsync(<CreateAccountPage assetPaths={{}} />)
    getByLabelText = renderResult.getByLabelText
    user = userEvent.setup()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("shows the correct form text", async () => {
    const { getAllByText } = await renderAndLoadAsync(<CreateAccountPage assetPaths={{}} />)
    expect(getAllByText("Create an account")).not.toBeNull()
  })

  it("creates a new account", async () => {
    ;(post as jest.Mock).mockResolvedValue({
      data: {
        status: "success",
      },
    })

    const createAccountButton = screen.getByRole("button", {
      name: /create account/i,
    })
    await act(async () => {
      await fillCreateAccountForm(defaultFormValues)
      await user.click(createAccountButton)
      await promise
    })

    expect(post).toHaveBeenCalledWith(
      "/api/v1/auth",
      expect.objectContaining({
        user: expect.objectContaining({
          email: "test@test.com",
          password: "password1",
          password_confirmation: "password1",
        }),
      })
    )
  })

  describe("it generates the correct error messages", () => {
    it("shows an error message when name fields are missing", async () => {
      const firstName = screen.getByRole("textbox", {
        name: /first name/i,
      })
      const lastName = screen.getByRole("textbox", {
        name: /last name/i,
      })
      await act(async () => {
        await user.click(firstName)
        await user.click(lastName)
        await user.tab()
      })
      expect(screen.getAllByText("Enter first name")).toHaveLength(2)
      expect(
        screen.getByRole("button", {
          name: /enter first name/i,
        })
      ).not.toBeNull()
      expect(screen.getAllByText("Enter last name")).toHaveLength(2)
      expect(
        screen.getByRole("button", {
          name: /enter last name/i,
        })
      ).not.toBeNull()
    })

    it("shows an error message for DOB fields", async () => {
      const monthField: Element = screen.getByRole("textbox", {
        name: /month/i,
      })
      const dayField: Element = screen.getByRole("textbox", {
        name: /day/i,
      })
      const yearField: Element = screen.getByRole("textbox", {
        name: /year/i,
      })
      await act(async () => {
        await user.click(monthField)
        await user.click(dayField)
        await user.click(yearField)
        await user.tab()
      })

      expect(screen.getByText("Enter date like: MM DD YYYY")).not.toBeNull()
      expect(
        screen.getByRole("button", {
          name: /enter date of birth/i,
        })
      ).not.toBeNull()

      await act(async () => {
        await user.type(monthField, "15")
        await user.type(dayField, "56")
        await user.type(yearField, "3")
        await user.tab()
      })

      expect(
        screen.getByText("Enter a valid date of birth. Enter date like: MM DD YYYY")
      ).not.toBeNull()
      expect(
        screen.getByRole("button", {
          name: /enter a valid date of birth/i,
        })
      ).not.toBeNull()

      await act(async () => {
        await user.type(monthField, "12")
        await user.type(dayField, "12")
        await user.type(yearField, "2020")
        await user.tab()
      })

      expect(
        screen.queryByText(
          /you must be 18 or older\. if you are under 18, email to get info on housing resources for youth/i
        )
      ).toBeNull()
      expect(
        screen.queryByRole("button", {
          name: /you must be 18 or older/i,
        })
      ).toBeNull()
    })
    it("shows an error message for the email field", async () => {
      const emailGroup = screen.getByRole("group", {
        name: /email/i,
      })
      const emailField = within(emailGroup).getByRole("textbox")

      await act(async () => {
        await user.click(emailField)
        await user.tab()
      })
      expect(screen.getByText("Enter email address like: example@web.com")).not.toBeNull()
      expect(
        screen.getByRole("button", {
          name: /enter email address/i,
        })
      ).not.toBeNull()

      await act(async () => {
        await user.type(emailField, "t")
        await user.tab()
      })
      expect(
        screen.getByText("Email missing @ symbol. Enter email like: example@web.com")
      ).not.toBeNull()
      expect(
        screen.getByRole("button", {
          name: /email missing @ symbol/i,
        })
      ).not.toBeNull()

      await act(async () => {
        await user.type(emailField, "est@")
        await user.tab()
      })
      expect(
        screen.getByText(/email entered incorrectly. Enter email like: example@web.com/i)
      ).not.toBeNull()
      expect(
        screen.getByRole("button", {
          name: /email entered incorrectly/i,
        })
      ).not.toBeNull()

      await act(async () => {
        await user.type(emailField, "test")
        await user.tab()
      })
      expect(
        screen.getByText(
          /email missing a dot ‘.’ in the domain. Enter email like: example@web.com/i
        )
      ).not.toBeNull()
      expect(
        screen.getByRole("button", {
          name: /email missing a dot ‘.’ in the domain/i,
        })
      ).not.toBeNull()

      await act(async () => {
        await user.type(emailField, ".")
        await user.tab()
      })
      expect(
        screen.getByText(/email entered incorrectly. Enter email like: example@web.com/i)
      ).not.toBeNull()
      expect(
        screen.getByRole("button", {
          name: /email entered incorrectly/i,
        })
      ).not.toBeNull()

      await act(async () => {
        await user.type(emailField, "com")
        await user.tab()
      })
      expect(
        screen.queryByText(/email entered incorrectly. Enter email like: example@web.com/i)
      ).toBeNull()
      expect(
        screen.queryByRole("button", {
          name: /email entered incorrectly/i,
        })
      ).toBeNull()
    })

    it("shows an error message for the password field", async () => {
      const passwordField = getByLabelText(/password/i)

      await act(async () => {
        await user.click(passwordField)
        await user.tab()
      })
      expect(screen.getAllByText(/enter new password/i)).not.toBeNull()
      expect(
        screen.getByRole("button", {
          name: /enter new password/i,
        })
      ).not.toBeNull()

      await act(async () => {
        await user.type(passwordField, "pass")
        await user.tab()
      })
      expect(
        screen.getByText(
          "Choose a strong password with at least 8 characters, 1 letter, and 1 number"
        )
      ).not.toBeNull()
      expect(
        screen.getByRole("button", {
          name: /choose a strong password/i,
        })
      ).not.toBeNull()

      await act(async () => {
        await user.type(passwordField, "word")
        await user.tab()
      })
      expect(
        screen.getByText(
          /choose a strong password with at least 8 characters, 1 letter, and 1 number/i
        )
      ).not.toBeNull()
      expect(
        screen.getByRole("button", {
          name: /choose a strong password/i,
        })
      ).not.toBeNull()

      await act(async () => {
        await user.type(passwordField, "1")
        await user.tab()
      })
      expect(
        screen.queryByText(
          /choose a strong password with at least 8 characters, 1 letter, and 1 number/i
        )
      ).toBeNull()
      expect(
        screen.queryByRole("button", {
          name: /choose a strong password/i,
        })
      ).toBeNull()
    })

    describe("server errors", () => {
      it("shows server errors for name fields", async () => {
        const createAccountButton = screen.getByRole("button", {
          name: /create account/i,
        })
        ;(post as jest.Mock).mockRejectedValue({
          response: {
            status: 422,
            data: {
              errors: {
                firstName: ["is empty"],
                lastName: ["is empty"],
                full_messages: ["Firstname is empty", "Lastname is empty"],
              },
            },
          },
        })

        await act(async () => {
          await fillCreateAccountForm(defaultFormValues)
          await user.click(createAccountButton)
          await promise
        })

        expect(screen.getAllByText(/enter first name/i)).toHaveLength(2)
        expect(screen.getAllByText(/enter last name/i)).toHaveLength(2)
        ;(post as jest.Mock).mockRejectedValue({
          response: {
            data: {
              errors: {
                firstName: ["unknown error"],
                lastName: ["unknown error"],
                full_messages: ["unknown error", "unknown error"],
              },
            },
          },
        })

        await act(async () => {
          await fillCreateAccountForm(defaultFormValues)
          await user.click(createAccountButton)
          await promise
        })

        expect(
          screen.getAllByRole("button", {
            name: /something went wrong/i,
          })
        ).toHaveLength(2)
        expect(
          screen.getAllByText(/something went wrong\. try again or check back later/i)
        ).toHaveLength(2)
      })

      it("shows server errors for dob fields", async () => {
        const createAccountButton = screen.getByRole("button", {
          name: /create account/i,
        })
        ;(post as jest.Mock).mockRejectedValue({
          response: {
            status: 422,
            data: {
              errors: {
                DOB: ["is invalid"],
                full_messages: ["DOB is invalid"],
              },
            },
          },
        })

        await act(async () => {
          await fillCreateAccountForm(defaultFormValues)
          await user.click(createAccountButton)
          await promise
        })

        expect(
          screen.getByText("Enter a valid date of birth. Enter date like: MM DD YYYY")
        ).not.toBeNull()
        expect(
          screen.getByRole("button", {
            name: /enter a valid date of birth/i,
          })
        ).not.toBeNull()
        ;(post as jest.Mock).mockRejectedValue({
          response: {
            data: {
              errors: {
                DOB: ["unknown error"],
                full_messages: ["unknown error"],
              },
            },
          },
        })

        await act(async () => {
          await fillCreateAccountForm(defaultFormValues)
          await user.click(createAccountButton)
          await promise
        })

        expect(
          screen.getAllByRole("button", {
            name: /something went wrong/i,
          })
        ).not.toBeNull()
        expect(
          screen.getAllByText(/something went wrong\. try again or check back later/i)
        ).not.toBeNull()
      })

      it("shows server errors for email field", async () => {
        const createAccountButton = screen.getByRole("button", {
          name: /create account/i,
        })
        ;(post as jest.Mock).mockRejectedValue({
          response: {
            status: 422,
            data: {
              errors: {
                email: ["has already been taken"],
                full_messages: ["Email has already been taken"],
              },
            },
          },
        })

        await act(async () => {
          await fillCreateAccountForm(defaultFormValues)
          await user.click(createAccountButton)
          await promise
        })

        expect(
          screen.getByRole("button", {
            name: /email is already in use/i,
          })
        ).not.toBeNull()

        expect(
          screen.getByRole("link", {
            name: /sign in to your account/i,
          })
        ).not.toBeNull()
        ;(post as jest.Mock).mockRejectedValue({
          response: {
            status: 422,
            data: {
              errors: {
                email: ["is invalid"],
                full_messages: ["Email is invalid"],
              },
            },
          },
        })

        await act(async () => {
          await fillCreateAccountForm(defaultFormValues)
          await user.click(createAccountButton)
          await promise
        })

        expect(
          screen.getByText(/email entered incorrectly. Enter email like: example@web.com/i)
        ).not.toBeNull()
        expect(
          screen.getByRole("button", {
            name: /email entered incorrectly/i,
          })
        ).not.toBeNull()
        ;(post as jest.Mock).mockRejectedValue({
          response: {
            status: 500,
            data: {
              errors: {
                email: ["unknown error"],
                full_messages: ["unknown error"],
              },
            },
          },
        })

        await act(async () => {
          await fillCreateAccountForm(defaultFormValues)
          await user.click(createAccountButton)
          await promise
        })

        expect(
          screen.getAllByRole("button", {
            name: /something went wrong/i,
          })
        ).not.toBeNull()
        expect(
          screen.getAllByText(/something went wrong\. try again or check back later/i)
        ).not.toBeNull()
      })

      it("shows server errors for password field", async () => {
        const createAccountButton = screen.getByRole("button", {
          name: /create account/i,
        })
        ;(post as jest.Mock).mockRejectedValue({
          response: {
            status: 422,
            data: {
              errors: {
                password: ["is too short (minimum is 8 characters)"],
                full_messages: ["Password is too short (minimum is 8 characters)"],
              },
            },
          },
        })

        await act(async () => {
          await fillCreateAccountForm(defaultFormValues)
          await user.click(createAccountButton)
          await promise
        })

        expect(
          screen.getByText(
            "Choose a strong password with at least 8 characters, 1 letter, and 1 number"
          )
        ).not.toBeNull()
        expect(
          screen.getByRole("button", {
            name: /choose a strong password/i,
          })
        ).not.toBeNull()
        ;(post as jest.Mock).mockRejectedValue({
          response: {
            status: 500,
            data: {
              errors: {
                password: ["unknown error"],
                full_messages: ["Password is too short (minimum is 8 characters)"],
              },
            },
          },
        })

        await act(async () => {
          await fillCreateAccountForm(defaultFormValues)
          await user.click(createAccountButton)
          await promise
        })

        expect(
          screen.getAllByRole("button", {
            name: /something went wrong/i,
          })
        ).not.toBeNull()
        expect(
          screen.getAllByText(/something went wrong\. try again or check back later/i)
        ).not.toBeNull()
      })
    })
  })
})
