/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import PasswordFieldset, {
  handlePasswordServerErrors,
  passwordFieldsetErrors,
} from "../../pages/account/components/PasswordFieldset"
import { useForm } from "react-hook-form"
import { ExpandedAccountAxiosError, getErrorMessage } from "../../pages/account/components/util"
import { t } from "@bloom-housing/ui-components"

const WrappedPasswordFieldset = () => {
  const {
    register,
    formState: { errors },
    watch,
  } = useForm({ mode: "all" })

  return (
    <PasswordFieldset
      register={register}
      errors={errors}
      watch={watch}
      passwordType="accountSettings"
      labelText={t("label.password")}
    />
  )
}

describe("Password Fieldset", () => {
  it("displays password instructions without validation", () => {
    render(<WrappedPasswordFieldset />)
    expect(screen.getByText("Must include at least:")).not.toBeNull()
    expect(screen.getByText("8 characters")).not.toBeNull()
    expect(screen.getByText("1 letter")).not.toBeNull()
    expect(screen.getByText("1 number")).not.toBeNull()
    expect(screen.getAllByTestId("validation-none")).toHaveLength(3)
    expect(screen.queryByTestId("validation-check")).toBeNull()
    expect(screen.queryByTestId("validation-x")).toBeNull()
  })

  it("displays validation for password confirmation", async () => {
    render(<WrappedPasswordFieldset />)

    const user = userEvent.setup()
    const input = screen.getByLabelText(/choose a new password/i)
    expect(screen.getAllByTestId("validation-none")).toHaveLength(3)

    await user.type(input, "p")
    expect(screen.getAllByTestId("validation-x")).toHaveLength(2)
    expect(screen.getByTestId("validation-check")).not.toBeNull()

    await user.type(input, "p1")
    expect(screen.getAllByTestId("validation-x")).toHaveLength(1)
    expect(screen.getAllByTestId("validation-check")).toHaveLength(2)

    await user.type(input, "p1234567")
    expect(screen.queryByTestId("validation-x")).toBeNull()
    expect(screen.getAllByTestId("validation-check")).toHaveLength(3)
  })

  it("displays password validation", async () => {
    render(<WrappedPasswordFieldset />)
    const user = userEvent.setup()

    const input = screen.getByLabelText(/current password/i)
    const button = screen.getAllByRole("checkbox")[0]
    expect(input.getAttribute("type")).toBe("password")
    await user.click(button)
    expect(input.getAttribute("type")).toBe("text")
    await user.click(button)
    expect(input.getAttribute("type")).toBe("password")
  })

  describe("handleServerErrors", () => {
    test("handleServerErrors sets currentPassword error for invalid current password", () => {
      const error = {
        response: {
          status: 422,
          data: {
            errors: {
              full_messages: ["Current password is invalid"],
            },
          },
        },
      } as ExpandedAccountAxiosError

      const errorReturn = handlePasswordServerErrors(error)

      expect(errorReturn).toEqual([
        "currentPassword",
        {
          message: "currentPassword:incorrect",
          shouldFocus: true,
        },
      ])
    })

    test("handleServerErrors sets password complexity error for password validation errors", () => {
      const error = {
        response: {
          status: 422,
          data: {
            errors: {
              full_messages: ["Password is too short (minimum is 8 characters)"],
            },
          },
        },
      } as ExpandedAccountAxiosError

      const errorReturn = handlePasswordServerErrors(error)

      expect(errorReturn).toEqual([
        "password",
        {
          message: "password:complexity",
          shouldFocus: true,
        },
      ])
    })

    test("handleServerErrors sets generic password error for other errors", () => {
      const error = {
        response: {},
      } as ExpandedAccountAxiosError

      const errorReturn = handlePasswordServerErrors(error)

      expect(errorReturn).toEqual([
        "password",
        {
          message: "password:server:generic",
          shouldFocus: true,
        },
      ])
    })
  })

  describe("passwordErrorsMap", () => {
    const testCases = [
      {
        key: "currentPassword:incorrect",
        abbreviated: false,
        expected: "error.account.currentPasswordIncorrect",
      },
      {
        key: "currentPassword:incorrect",
        abbreviated: true,
        expected: "error.account.currentPasswordIncorrect.abbreviated",
      },
      {
        key: "password:complexity",
        abbreviated: false,
        expected: "error.account.passwordComplexity",
      },
      {
        key: "password:complexity",
        abbreviated: true,
        expected: "error.account.passwordComplexity.abbreviated",
      },
      {
        key: "currentPassword:required",
        abbreviated: false,
        expected: "error.account.currentPasswordMissing",
      },
      {
        key: "currentPassword:required",
        abbreviated: true,
        expected: "error.account.currentPasswordMissing",
      },
      {
        key: "password:required",
        abbreviated: false,
        expected: "error.account.newPasswordMissing",
      },
      {
        key: "password:required",
        abbreviated: true,
        expected: "error.account.newPasswordMissing",
      },
      {
        key: "password:server:generic",
        abbreviated: false,
        expected: "error.account.genericServerError",
      },
      {
        key: "password:server:generic",
        abbreviated: true,
        expected: "error.account.genericServerError.abbreviated",
      },
    ]
    testCases.forEach(({ key, abbreviated, expected }) => {
      test(`returns correct error message for ${key} with abbreviated=${abbreviated}`, () => {
        expect(getErrorMessage(key, passwordFieldsetErrors, abbreviated)).toBe(t(expected))
      })
    })
  })
})
