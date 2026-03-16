import React from "react"
import { screen } from "@testing-library/react"
import AddHouseholdMembers from "../../../../pages/form/components/household/AddHouseholdMembers"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"

describe("AddHouseholdMembers", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderAddHouseholdMembers = () => {
    renderWithFormContextWrapper(
      <AddHouseholdMembers
        householdMembers={[{ householdMemberFirstName: "Member first name" }]}
        handleAddHouseholdMember={jest.fn()}
        handleEditHouseholdMember={jest.fn()}
        handleSubmitHouseholdMembers={jest.fn()}
      />
    )
  }

  it("renders the component", () => {
    renderAddHouseholdMembers()
    expect(screen.queryByText("Tell us about your household.")).toBeInTheDocument()
  })

  it("renders the primary applicant", () => {
    renderAddHouseholdMembers()
    expect(screen.queryByText("Primary Applicant")).toBeInTheDocument()
  })

  it("renders the household member", () => {
    renderAddHouseholdMembers()
    expect(screen.queryByText("Member first name")).toBeInTheDocument()
  })

  it("renders the edit and add buttons", () => {
    renderAddHouseholdMembers()
    expect(screen.queryByText("+ Add household member")).toBeInTheDocument()
    expect(screen.getAllByText("Edit")).toHaveLength(2)
  })
})
