import React from "react"
import { screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import AlternateContactType from "../../../../pages/form/components/AlternateContactType"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"

const renderAlternateContactType = () => {
  renderWithFormContextWrapper(
    <AlternateContactType
      fieldNames={{
        alternateContactType: "alternateContactType",
      }}
    />
  )
}

describe("AlternateContactType", () => {
  it("displays the alternate contact type heading and note", () => {
    renderAlternateContactType()
    expect(screen.getByText(t("label.alternateContact"))).toBeInTheDocument()
    expect(screen.getByText(t("label.pleaseSelectOne"))).toBeInTheDocument()
  })

  it("displays the other field if the other radio is selected", async () => {
    renderAlternateContactType()
    const user = userEvent.setup()
    await user.click(screen.getByRole("radio", { name: t("label.Other") }))
    expect(screen.getByText(t("label.whatIsYourRelationship"))).toBeInTheDocument()
  })
  it("displays an error message if the field is left empty", async () => {
    renderAlternateContactType()
    const user = userEvent.setup()
    await user.click(screen.getByRole("radio", { name: t("label.Other") }))
    const relationshipInput = screen.getByRole("textbox", {
      name: t("label.whatIsYourRelationship"),
    })
    await user.click(relationshipInput)
    await user.tab()
    expect(screen.getByText(t("error.relationship"))).toBeInTheDocument()
  })
})
