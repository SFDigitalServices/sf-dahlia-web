 
import React from "react"
import EmailFieldset, {
  emailFieldsetErrors,
  handleEmailServerErrors,
} from "../../pages/account/components/EmailFieldset"
import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useForm } from "react-hook-form"
import { t } from "@bloom-housing/ui-components"
import { ExpandedAccountAxiosError, getErrorMessage } from "../../pages/account/components/util"

const FieldSetWrapper = () => {
  const {
    register,
    formState: { errors },
  } = useForm({ mode: "all" })
  return <EmailFieldset register={register} errors={errors} onChange={jest.fn()} />
}

describe("EmailFieldset", () => {
  it("renders first without errors", () => {
    render(<FieldSetWrapper />)
    expect(screen.queryByText(t("error.email.missingAtSign"))).toBeNull()
    expect(screen.queryByText(t("error.email.missingDot"))).toBeNull()
    expect(screen.queryByText(t("error.email.generalIncorrect"))).toBeNull()
  })

  it("renders the correct validation errors", async () => {
    const user = userEvent.setup()
    render(<FieldSetWrapper />)
    const input = screen.getByRole("textbox")

    await user.type(input, "test")
    expect(screen.queryByText(t("error.email.missingAtSign"))).not.toBeNull()
    expect(screen.queryByText(t("error.email.missingDot"))).toBeNull()
    expect(screen.queryByText(t("error.email.generalIncorrect"))).toBeNull()

    await user.type(input, "test@")
    expect(screen.queryByText(t("error.email.missingAtSign"))).toBeNull()
    expect(screen.queryByText(t("error.email.missingDot"))).toBeNull()
    expect(screen.queryByText(t("error.email.generalIncorrect"))).not.toBeNull()

    await user.type(input, "test@@test.com")
    expect(screen.queryByText(t("error.email.missingAtSign"))).toBeNull()
    expect(screen.queryByText(t("error.email.missingDot"))).toBeNull()
    expect(screen.queryByText(t("error.email.generalIncorrect"))).not.toBeNull()

    await user.type(input, "test@testcom")
    expect(screen.queryByText(t("error.email.missingAtSign"))).toBeNull()
    expect(screen.queryByText(t("error.email.missingDot"))).not.toBeNull()
    expect(screen.queryByText(t("error.email.generalIncorrect"))).toBeNull()

    await user.type(input, "test@test.com")
    expect(screen.queryByText(t("error.email.missingAtSign"))).toBeNull()
    expect(screen.queryByText(t("error.email.missingDot"))).toBeNull()
    expect(screen.queryByText(t("error.email.generalIncorrect"))).toBeNull()
  })

  describe("handleEmailServerErrors", () => {
    it("should set error to generalFormat when status is 422", () => {
      const error = {
        response: {
          status: 422,
          data: { errors: { full_messages: [] } },
        },
      } as unknown as ExpandedAccountAxiosError
      const errorReturn = handleEmailServerErrors(error)

      expect(errorReturn).toEqual([
        "email",
        {
          message: "email:generalFormat",
          shouldFocus: true,
        },
      ])
    })

    it("should set error to generic when status is not 422", () => {
      const error = {
        response: {
          data: { errors: { full_messages: [] } },
        },
      } as unknown as ExpandedAccountAxiosError
      const errorReturn = handleEmailServerErrors(error)

      expect(errorReturn).toEqual([
        "email",
        {
          message: "email:server:generic",
          shouldFocus: true,
        },
      ])
    })

    it("should set error email duplicate error", () => {
      const error = {
        response: {
          status: 422,
          data: { errors: { full_messages: ["Email has already been taken"] } },
        },
      } as unknown as ExpandedAccountAxiosError
      const errorReturn = handleEmailServerErrors(error)

      expect(errorReturn).toEqual([
        "email",
        {
          message: "email:server:duplicate",
          shouldFocus: true,
        },
      ])
    })
  })

  describe("emailErrorsMap", () => {
    const testCases = [
      {
        key: "email:missingAtSign",
        abbreviated: false,
        expected: "error.email.missingAtSign",
      },
      {
        key: "email:missingAtSign",
        abbreviated: true,
        expected: "error.email.missingAtSign.abbreviated",
      },
      {
        key: "email:missingDot",
        abbreviated: false,
        expected: "error.email.missingDot",
      },
      {
        key: "email:missingDot",
        abbreviated: true,
        expected: "error.email.missingDot.abbreviated",
      },
      {
        key: "email:generalFormat",
        abbreviated: false,
        expected: "error.email.generalIncorrect",
      },
      {
        key: "email:generalFormat",
        abbreviated: true,
        expected: "error.email.generalIncorrect.abbreviated",
      },
      {
        key: "email:missing",
        abbreviated: false,
        expected: "error.email.missing",
      },
      {
        key: "email:missing",
        abbreviated: true,
        expected: "error.email.missing.abbreviated",
      },
      {
        key: "email:server:generic",
        abbreviated: false,
        expected: "error.account.genericServerError",
      },
      {
        key: "email:server:generic",
        abbreviated: true,
        expected: "error.account.genericServerError.abbreviated",
      },
    ]

    testCases.forEach(({ key, abbreviated, expected }) => {
      it(`returns correct error message for ${key} with abbreviated=${abbreviated}`, () => {
        expect(getErrorMessage(key, emailFieldsetErrors, abbreviated)).toBe(t(expected))
      })
    })
  })
})
