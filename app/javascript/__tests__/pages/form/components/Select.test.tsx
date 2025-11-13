import React from "react"
import { t } from "@bloom-housing/ui-components"
import { screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import FormSelect from "../../../../pages/form/components/Select"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"

const renderSelect = () => {
  renderWithFormContextWrapper(
    <FormSelect
      label="label.householdMemberRelationship"
      errorMessage="error.householdMemberRelationship"
      defaultOptionName="label.selectOne"
      options={[
        { name: "label.spouse", value: "spouse" },
        { name: "label.registeredDomesticPartner", value: "Registered Domestic Partner" },
      ]}
      fieldNames={{ selection: "householdMemberRelation" }}
    />
  )
}

describe("FormSelect", () => {
  it("displays provided label and placeholder", () => {
    renderSelect()
    expect(screen.getByLabelText(t("label.householdMemberRelationship"))).not.toBeNull()
    expect(screen.getByText(t("label.selectOne"))).not.toBeNull()
  })

  it("displays error when no value is selected", async () => {
    renderSelect()
    const user = userEvent.setup()
    const select = screen.getByLabelText(t("label.householdMemberRelationship"))
    await user.click(select)
    await user.tab()

    expect(screen.getByText(t("error.householdMemberRelationship"))).not.toBeNull()
  })

  it("selects an option correctly", async () => {
    renderSelect()
    const user = userEvent.setup()
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const select = screen.getByLabelText(
      t("label.householdMemberRelationship")
    ) as HTMLSelectElement
    await user.selectOptions(select, "spouse")

    expect(select.value).toBe("spouse")
  })
})
