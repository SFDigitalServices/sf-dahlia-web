import React from "react"
import { screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import Address from "../../../../pages/form/components/Address"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"

const renderAddressComponent = () => {
  const fieldNames = {
    addressStreet: "primaryApplicantAddressStreet",
    addressAptOrUnit: "primaryApplicantAddressAptOrUnit",
    addressCity: "primaryApplicantAddressCity",
    addressState: "primaryApplicantAddressState",
    addressZipcode: "primaryApplicantAddressZipcode",
    mailingAddressStreet: "primaryApplicantMailingAddressStreet",
    mailingAddressCity: "primaryApplicantMailingAddressCity",
    mailingAddressState: "primaryApplicantMailingAddressState",
    mailingAddressZipcode: "primaryApplicantMailingAddressZipcode",
  }

  renderWithFormContextWrapper(
    <Address
      showAptOrUnit={true}
      requireAddress={true}
      label="label.address"
      note="b2Contact.applicantAddressDesc"
      showMailingAddress={true}
      fieldNames={fieldNames}
    />
  )
}

describe("Address", () => {
  it("renders the address input labels", () => {
    renderAddressComponent()
    expect(screen.getByText(t("label.address1"))).toBeInTheDocument()
    expect(screen.getByText(t("label.address2"))).toBeInTheDocument()
    expect(screen.getByText(t("label.city"))).toBeInTheDocument()
    expect(screen.getByText(t("label.state"))).toBeInTheDocument()
    expect(screen.getByText(t("label.zip"))).toBeInTheDocument()
  })

  it("renders the mailing address checkbox", () => {
    renderAddressComponent()
    expect(screen.getByText(t("label.applicantSeparateAddress"))).toBeInTheDocument()
  })

  it("renders the mailing address inputs if the checkbox is checked", async () => {
    renderAddressComponent()
    const checkbox = screen.getByText(t("label.applicantSeparateAddress"))
    const user = userEvent.setup()
    await user.click(checkbox)
    expect(screen.getByText(t("b2Contact.provideAnAddress"))).toBeInTheDocument()
  })

  it("displays an error message if a required field is empty", async () => {
    renderAddressComponent()
    const user = userEvent.setup()
    await user.click(screen.getByLabelText(t("label.address1")))
    await user.tab()
    expect(screen.getByText(t("error.address"))).toBeInTheDocument()
  })
})
