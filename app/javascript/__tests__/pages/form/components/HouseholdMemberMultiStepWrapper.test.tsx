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
      <HouseholdMemberMultiStepWrapper
        name="householdMembers"
        fieldNames={{
          firstName: "firstName",
          middleName: "middleName",
          lastName: "lastName",
          birthMonth: "birthMonth",
          birthDay: "birthDay",
          birthYear: "birthYear",
          address: "address",
          workInSf: "workInSf",
          relation: "relation",
        }}
      />
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
