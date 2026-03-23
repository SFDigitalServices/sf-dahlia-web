import React from "react"
import { screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import HouseholdMemberSameAddress from "../../../../pages/form/components/household/HouseholdMemberSameAddress"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"

const renderHouseholdMemberSameAddress = () => {
  renderWithFormContextWrapper(<HouseholdMemberSameAddress />)
}

describe("HouseholdMemberSameAddress", () => {
  it("displays radio component and renders address fields when no is selected", async () => {
    renderHouseholdMemberSameAddress()
    expect(screen.getByText(t("label.memberSameAddress"))).toBeInTheDocument()
    const user = userEvent.setup()
    await user.click(screen.getByRole("radio", { name: t("t.no") }))

    expect(screen.getByText(t("c3HouseholdMemberForm.memberAddressDesc"))).toBeInTheDocument()
    expect(screen.getByText(t("label.address1"))).toBeInTheDocument()
    expect(screen.getByText(t("label.city"))).toBeInTheDocument()
    expect(screen.getByText(t("label.state"))).toBeInTheDocument()
    expect(screen.getByText(t("label.zip"))).toBeInTheDocument()
  })

  it("hides address fields when yes is selected", async () => {
    renderHouseholdMemberSameAddress()
    const user = userEvent.setup()
    await user.click(screen.getByRole("radio", { name: t("t.no") }))
    await user.click(screen.getByRole("radio", { name: t("t.yes") }))
    expect(screen.queryByText(t("label.address1"))).not.toBeInTheDocument()
  })

  it("displays an error when no is selected but left empty", async () => {
    renderHouseholdMemberSameAddress()
    const user = userEvent.setup()
    await user.click(screen.getByRole("radio", { name: t("t.no") }))
    await user.click(screen.getByLabelText(t("label.address1")))
    await user.tab()
    expect(screen.getByText(t("error.address"))).toBeInTheDocument()
  })
})
