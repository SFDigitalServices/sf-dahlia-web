/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import EmailFieldset from "../../pages/account/components/EmailFieldset"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useForm } from "react-hook-form"
import { t } from "@bloom-housing/ui-components"

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
})
