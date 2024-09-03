/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import EmailFieldset, {
  emailErrorsMap,
  handleEmailServerErrors,
} from "../../pages/account/components/EmailFieldset"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useForm } from "react-hook-form"
import { t } from "@bloom-housing/ui-components"
import { AxiosError } from "axios"

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
    let setError: jest.Mock
    let errorCallback: jest.Mock

    beforeEach(() => {
      setError = jest.fn()
      errorCallback = jest.fn()
    })

    test("should set error to generalFormat when status is 422", () => {
      const error = { response: { status: 422 } } as AxiosError
      const handler = handleEmailServerErrors(setError, errorCallback)
      handler(error)

      expect(setError).toHaveBeenCalledWith("email", {
        message: "email:generalFormat",
        shouldFocus: true,
      })
      expect(errorCallback).toHaveBeenCalled()
    })

    test("should set error to generic when status is not 422", () => {
      const error = { response: { status: 500 } } as AxiosError
      const handler = handleEmailServerErrors(setError, errorCallback)
      handler(error)

      expect(setError).toHaveBeenCalledWith("email", {
        message: "email:generic",
        shouldFocus: true,
      })
      expect(errorCallback).toHaveBeenCalled()
    })
  })

  describe("emailErrorsMap", () => {
    test("should return correct message for email:missingAtSign", () => {
      expect(emailErrorsMap("email:missingAtSign")).toBe(t("error.email.missingAtSign"))
      expect(emailErrorsMap("email:missingAtSign", true)).toBe(
        t("error.email.missingAtSign.abbreviated")
      )
    })

    test("should return correct message for email:missingDot", () => {
      expect(emailErrorsMap("email:missingDot")).toBe(t("error.email.missingDot"))
      expect(emailErrorsMap("email:missingDot", true)).toBe(t("error.email.missingDot.abbreviated"))
    })

    test("should return correct message for email:generalFormat", () => {
      expect(emailErrorsMap("email:generalFormat")).toBe(t("error.email.generalIncorrect"))
      expect(emailErrorsMap("email:generalFormat", true)).toBe(
        t("error.email.generalIncorrect.abbreviated")
      )
    })

    test("should return generic server error message for unknown error code", () => {
      expect(emailErrorsMap("unknownError")).toBe(t("error.account.genericServerError"))
      expect(emailErrorsMap("unknownError", true)).toBe(
        t("error.account.genericServerError.abbreviated")
      )
    })
  })
})
