import React from "react"
import { screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import EmailAddress from "../../pages/form/components/EmailAddress"
import { formContextWrapper } from "../__util__/renderUtils"

interface FieldSetWrapperProps {
  showDontHaveEmailAddress?: boolean
}

const renderFieldSetWrapper = ({ showDontHaveEmailAddress = false }: FieldSetWrapperProps) => {
  return formContextWrapper(
    <EmailAddress
      fieldNames={{
        email: "primaryApplicantEmail",
        noEmail: "primaryApplicantNoEmail",
      }}
      label="label.applicantEmail"
      note="b2Contact.onlyUseYourEmail"
      showDontHaveEmailAddress={showDontHaveEmailAddress}
    />
  )
}

describe("EmailAddress", () => {
  it("displays the provided label and note for the email address", () => {
    renderFieldSetWrapper({})
    expect(screen.getByText(t("label.applicantEmail"))).toBeInTheDocument()
    expect(screen.getByText(t("b2Contact.onlyUseYourEmail"))).toBeInTheDocument()
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()
  })

  it("displays a conditional checkbox for no email address", () => {
    renderFieldSetWrapper({ showDontHaveEmailAddress: true })
    expect(screen.getByRole("checkbox", { name: t("label.applicantNoEmail") })).toBeInTheDocument()
  })

  it("displays an error message if validation fails", async () => {
    renderFieldSetWrapper({})
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(t("label.applicantEmail")), "invalid-email")
    await user.tab()
    expect(screen.getByText(t("error.email"))).toBeInTheDocument()
  })

  it("disables the field if the checkbox is selected", async () => {
    renderFieldSetWrapper({ showDontHaveEmailAddress: true })
    const user = userEvent.setup()
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const emailInput = screen.getByLabelText(t("label.applicantEmail")) as HTMLInputElement
    expect(emailInput.disabled).toBe(false)
    await user.click(screen.getByRole("checkbox", { name: t("label.applicantNoEmail") }))
    expect(emailInput.disabled).toBe(true)
  })
})
