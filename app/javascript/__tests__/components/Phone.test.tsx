import React from "react"
import { screen } from "@testing-library/react"
import { t } from "@bloom-housing/ui-components"
import Phone from "../../pages/form/components/Phone"
import { formContextWrapper } from "../__util__/renderUtils"
import userEvent from "@testing-library/user-event"

const renderPhone = () => {
  return formContextWrapper(
    <Phone
      label="label.applicantPhone"
      showTypeOfNumber
      showDontHavePhoneNumber
      showAdditionalPhoneNumber
      labelForAdditionalPhoneNumber="label.applicantSecondPhone"
      fieldNames={{
        phone: "primaryApplicantPhone",
        phoneType: "primaryApplicantPhoneType",
        additionalPhone: "primaryApplicantAdditionalPhone",
        additionalPhoneType: "primaryApplicantAdditionalPhoneType",
      }}
    />
  )
}

describe("Phone", () => {
  it("displays the two field inputs and two checkboxes", () => {
    renderPhone()
    expect(screen.getByText(t("label.applicantPhone"))).toBeInTheDocument()
    expect(screen.getByText(t("label.whatTypeOfNumber"))).toBeInTheDocument()
    expect(screen.getByText(t("label.applicantNoPhone"))).toBeInTheDocument()
    expect(screen.getByText(t("label.applicantAdditionalPhone"))).toBeInTheDocument()
  })

  it("disables the inputs if the no phone checkbox is checked", async () => {
    renderPhone()
    const noPhoneCheckbox = screen.getByRole("checkbox", { name: t("label.applicantNoPhone") })
    const user = userEvent.setup()
    await user.click(noPhoneCheckbox)
    expect(screen.getByRole("textbox", { name: t("label.applicantPhone") })).toBeDisabled()
    expect(screen.getByRole("combobox")).toBeDisabled()
  })

  it("displays the additional input if the additional phone checkbox is checked", async () => {
    renderPhone()
    const additionalPhoneCheckbox = screen.getByRole("checkbox", {
      name: t("label.applicantAdditionalPhone"),
    })
    const user = userEvent.setup()
    await user.click(additionalPhoneCheckbox)
    expect(screen.getByText(t("label.applicantSecondPhone"))).toBeInTheDocument()
  })

  it("disables the no phone checkbox if the additional phone checkbox is checked", async () => {
    renderPhone()
    const additionalPhoneCheckbox = screen.getByRole("checkbox", {
      name: t("label.applicantAdditionalPhone"),
    })
    const user = userEvent.setup()
    await user.click(additionalPhoneCheckbox)
    expect(screen.getByRole("checkbox", { name: t("label.applicantNoPhone") })).toBeDisabled()
  })
})
