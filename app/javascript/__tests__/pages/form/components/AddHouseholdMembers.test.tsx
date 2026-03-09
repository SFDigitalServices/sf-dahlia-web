import React from "react"
import { screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import AddHouseholdMembers from "../../../../pages/form/components/AddHouseholdMembers"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"

describe("AddHouseholdMembers", () => {
  const mockHandleNextStep = jest.fn()
  const mockJumpToStep = jest.fn()
  beforeEach(() => {
    jest.clearAllMocks()
    userEvent.setup()
  })

  const renderAddHouseholdMembers = () => {
    renderWithFormContextWrapper(
      <AddHouseholdMembers />,
      {
        "household-member-form": [
          {
            householdMemberFirstName: "first member",
            householdMemberLastName: "last member",
          },
        ],
      },
      { handleNextStep: mockHandleNextStep, jumpToStep: mockJumpToStep }
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
    expect(screen.queryByText("first member last member")).toBeInTheDocument()
    expect(screen.queryByText("Household Member")).toBeInTheDocument()
  })

  it("goes to the member form when add household member button is clicked", async () => {
    renderAddHouseholdMembers()
    await userEvent.click(screen.getByRole("button", { name: /add household member/i }))
    expect(mockHandleNextStep).toHaveBeenCalled()
  })

  it("goes to the existing member form when edit button is clicked", async () => {
    renderAddHouseholdMembers()
    await userEvent.click(screen.getAllByRole("button", { name: /edit/i })[0])
    expect(mockJumpToStep).toHaveBeenCalled()
  })
})
