import React from "react"
import { screen } from "@testing-library/react"
import HouseholdMemberMultiStepWrapper from "../../../../pages/form/components/household/HouseholdMemberMultiStepWrapper"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"

describe("HouseholdMemberMultiStepWrapper", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderHouseholdMemberMultiStepWrapper = () => {
    renderWithFormContextWrapper(
      <HouseholdMemberMultiStepWrapper fieldNames={{ householdMembers: "householdMembers" }} />,
      {
        stepInfoMap: [{ slug: "household-member-form", fieldNames: [] }],
      }
    )
  }

  it("renders the component", () => {
    renderHouseholdMemberMultiStepWrapper()
    expect(screen.queryByText("Tell us about your household.")).toBeInTheDocument()
  })

  it("starts on the add household members page", () => {
    renderHouseholdMemberMultiStepWrapper()
    expect(screen.queryByText("+ Add household member")).toBeInTheDocument()
  })
})
