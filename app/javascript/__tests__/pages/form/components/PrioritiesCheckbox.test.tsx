import React from "react"
import { screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import { formContextWrapper } from "../../../__util__/renderUtils"
import PrioritiesCheckbox from "../../../../pages/form/components/PrioritiesCheckbox"

const renderPrioritiesCheckbox = () =>
  formContextWrapper(
    <PrioritiesCheckbox
      description="label.pleaseSelectAllThatApply"
      fieldNames={{ priorityMembers: "priorityMembers" }}
    />
  )

describe("PrioritiesCheckbox", () => {
  it("renders checkbox options", () => {
    renderPrioritiesCheckbox()
    expect(screen.getByLabelText(t("label.mobilityImpairments"))).toBeInTheDocument()
    expect(screen.getByLabelText(t("label.visionImpairments"))).toBeInTheDocument()
    expect(screen.getByLabelText(t("label.hearingImpairments"))).toBeInTheDocument()
    expect(screen.getByLabelText(t("t.no"))).toBeInTheDocument()
  })

  it("selecting 'no' deselects other options", async () => {
    renderPrioritiesCheckbox()
    const user = userEvent.setup()
    const mobilityImpairment = screen.getByLabelText(t("label.mobilityImpairments"))
    const noImpairments = screen.getByLabelText(t("t.no"))

    await user.click(mobilityImpairment)
    expect(mobilityImpairment).toBeChecked()

    await user.click(noImpairments)
    expect(noImpairments).toBeChecked()
    expect(mobilityImpairment).not.toBeChecked()
  })

  it("selecting any impairment unchecks 'no'", async () => {
    renderPrioritiesCheckbox()
    const user = userEvent.setup()
    const hearingImpairment = screen.getByLabelText(t("label.hearingImpairments"))
    const noImpairments = screen.getByLabelText(t("t.no"))

    await user.click(noImpairments)
    expect(noImpairments).toBeChecked()

    await user.click(hearingImpairment)
    expect(hearingImpairment).toBeChecked()
    expect(noImpairments).not.toBeChecked()
  })

  it("displays an error message if no items are checked", async () => {
    renderPrioritiesCheckbox()
    const user = userEvent.setup()
    await user.tab()
    await user.tab()

    expect(screen.getByText(t("error.pleaseSelectAnOption"))).toBeInTheDocument()
  })
})
