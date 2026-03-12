import React from "react"
import { screen } from "@testing-library/react"
import AddHouseholdMembers from "../../../../pages/form/components/household/AddHouseholdMembers"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"

describe("AddHouseholdMembers", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderAddHouseholdMembers = () => {
    renderWithFormContextWrapper(<AddHouseholdMembers />)
  }

  it("renders the component", () => {
    renderAddHouseholdMembers()
    expect(screen.queryByText("Tell us about your household.")).toBeInTheDocument()
  })

  it("renders the primary applicant", () => {
    renderAddHouseholdMembers()
    expect(screen.queryByText("Primary Applicant")).toBeInTheDocument()
  })
})
