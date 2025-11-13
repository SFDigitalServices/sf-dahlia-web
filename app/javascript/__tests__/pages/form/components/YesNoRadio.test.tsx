import React from "react"
import { t } from "@bloom-housing/ui-components"
import { screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import YesNoRadio from "../../../../pages/form/components/YesNoRadio"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"

const renderYesNoRadio = () => {
  renderWithFormContextWrapper(
    <YesNoRadio
      label="label.workInSf"
      note="b2Contact.workInSfDesc"
      yesText="b2Contact.claimWorkInSf"
      fieldNames={{ question: "primaryApplicantWorkInSf" }}
    />
  )
}

describe("YesNoRadio", () => {
  it("renders label and radio options", () => {
    renderYesNoRadio()
    expect(screen.getByText(t("label.workInSf"))).not.toBeNull()
    expect(screen.getByLabelText(t("t.yes"))).not.toBeNull()
    expect(screen.getByLabelText(t("t.no"))).not.toBeNull()
  })

  it("displays yesText when yes is selected", async () => {
    renderYesNoRadio()
    const user = userEvent.setup()
    expect(screen.queryByText(t("b2Contact.claimWorkInSf"))).toBeNull()

    const yesRadio = screen.getByLabelText(t("t.yes"))
    await user.click(yesRadio)

    expect(screen.getByText(t("b2Contact.claimWorkInSf"))).not.toBeNull()
  })

  it("renders error when no value is selected", async () => {
    renderYesNoRadio()
    const user = userEvent.setup()
    await user.tab()
    await user.tab()

    expect(screen.queryByText(t("error.pleaseSelectAnOption"))).not.toBeNull()
  })
})
