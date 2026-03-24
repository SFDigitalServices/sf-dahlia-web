import React from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import HouseholdMemberMultiStepWrapper from "../../../../pages/form/components/household/HouseholdMemberMultiStepWrapper"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"

describe("HouseholdMemberMultiStepWrapper", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderHouseholdMemberMultiStepWrapper = (formData = {}) => {
    renderWithFormContextWrapper(
      <HouseholdMemberMultiStepWrapper fieldNames={{ householdMembers: "householdMembers" }} />,
      {
        stepInfoMap: [{ slug: "household-member-form", fieldNames: [] }],
        formData,
      }
    )
  }

  it("renders the add household members page by default", () => {
    renderHouseholdMemberMultiStepWrapper()
    expect(screen.getByText(t("c2HouseholdMembers.title"))).toBeInTheDocument()
  })

  it("shows the add household member button", () => {
    renderHouseholdMemberMultiStepWrapper()
    expect(screen.getByText("+ " + t("label.addHouseholdMember"))).toBeInTheDocument()
  })

  it("navigates to the household member form when add is clicked", async () => {
    renderHouseholdMemberMultiStepWrapper()
    const user = userEvent.setup()
    await user.click(screen.getByText("+ " + t("label.addHouseholdMember")))
    expect(screen.getByText(t("c3HouseholdMemberForm.title"))).toBeInTheDocument()
  })

  it("renders existing household members from formData", () => {
    renderHouseholdMemberMultiStepWrapper({
      householdMembers: [{ firstName: "Jane", lastName: "Doe" }],
    })
    expect(screen.getByText("Jane Doe")).toBeInTheDocument()
  })

  it("navigates to the form in edit mode when a household member's edit button is clicked", async () => {
    renderHouseholdMemberMultiStepWrapper({
      householdMembers: [{ firstName: "John", lastName: "Doe" }],
    })
    const user = userEvent.setup()
    const editButtons = screen.getAllByRole("button", { name: t("t.edit") })
    await user.click(editButtons[1])
    expect(
      screen.getByRole("button", { name: t("label.householdMemberUpdate") })
    ).toBeInTheDocument()
  })

  it("removes a member and returns to the list when delete is clicked", async () => {
    renderHouseholdMemberMultiStepWrapper({
      householdMembers: [{ firstName: "John", lastName: "Doe" }],
    })
    const user = userEvent.setup()
    const editButtons = screen.getAllByRole("button", { name: t("t.edit") })
    await user.click(editButtons[1])
    await user.click(screen.getByText(t("label.householdMemberDelete")))
    expect(screen.getByText(t("c2HouseholdMembers.title"))).toBeInTheDocument()
    expect(screen.queryByText("Jane Doe")).not.toBeInTheDocument()
  })

  it("resets editing state after new member is added", async () => {
    renderHouseholdMemberMultiStepWrapper({
      householdMembers: [
        {
          firstName: "John",
          lastName: "Smith",
          birthMonth: "12",
          birthDay: "12",
          birthYear: "1990",
          hasSameAddressAsApplicant: "true",
          workInSf: "true",
          relation: "spouse",
        },
      ],
    })
    const user = userEvent.setup()

    const editButtons = screen.getAllByRole("button", { name: t("t.edit") })
    await user.click(editButtons[1])

    await user.click(screen.getByRole("button", { name: t("label.householdMemberUpdate") }))
    await user.click(screen.getByText("+ " + t("label.addHouseholdMember")))
    expect(screen.queryByText(t("label.householdMemberDelete"))).not.toBeInTheDocument()
  })
})
