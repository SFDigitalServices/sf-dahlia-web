import React from "react"
import { screen } from "@testing-library/react"
import { t } from "@bloom-housing/ui-components"
import ListingApplyStepHeaderNeighborhoodPreferences from "../../../../pages/form/components/preferences/ListingApplyStepHeaderNeighborhoodPreferences"
import { liveInTheNeighborhoodHouseholdMembers } from "../../../../pages/form/components/household/householdUtils"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"

jest.mock("../../../../pages/form/components/household/householdUtils", () => ({
  liveInTheNeighborhoodHouseholdMembers: jest.fn(),
}))

const mockLiveInTheNeighborhoodHouseholdMembers = liveInTheNeighborhoodHouseholdMembers as jest.Mock

const renderNeighborhoodPreferenceHeader = (formData: Record<string, unknown> = {}) => {
  renderWithFormContextWrapper(
    <ListingApplyStepHeaderNeighborhoodPreferences
      instructionsP1Plural="e2aNeighborhoodPreference.instructionsP1Plural"
      instructionsP1Singular="e2aNeighborhoodPreference.instructionsP1Singular"
      instructionsP2="e2aNeighborhoodPreference.instructionsP2"
    />,
    {
      formData,
      renderForm: false,
    }
  )
}

describe("ListingApplyStepHeaderNeighborhoodPreferences", () => {
  beforeEach(() => {
    mockLiveInTheNeighborhoodHouseholdMembers.mockReset()
  })

  it("renders the good news header and singular address copy", () => {
    const formData = { primaryApplicantFirstName: "John" }
    mockLiveInTheNeighborhoodHouseholdMembers.mockReturnValue([
      {
        id: "primary",
        firstName: "John",
        lastName: "Doe",
        hasSameAddressAsApplicant: true,
        householdMemberAddressStreet: "123 Main St",
        neighborhoodPreferenceAddressMatch: true,
      },
    ])
    renderNeighborhoodPreferenceHeader(formData)

    expect(mockLiveInTheNeighborhoodHouseholdMembers).toHaveBeenCalledWith(formData)
    expect(
      screen.getByRole("heading", { name: t("label.goodNewsForHigherRanking") })
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        t("e2aNeighborhoodPreference.instructionsP1Singular", {
          address: "123 Main St",
        })
      )
    ).toBeInTheDocument()
    expect(screen.getByText(/Just upload valid proof of this address and/i)).toBeInTheDocument() // e2aNeighborhoodPreference.instructionsP2
  })

  it("renders plural address copy for multiple unique qualifying addresses", () => {
    mockLiveInTheNeighborhoodHouseholdMembers.mockReturnValue([
      {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        hasSameAddressAsApplicant: true,
        householdMemberAddressStreet: "123 Main St",
        neighborhoodPreferenceAddressMatch: true,
      },
      {
        id: "2",
        firstName: "Bob",
        lastName: "Doe",
        hasSameAddressAsApplicant: false,
        householdMemberAddressStreet: "456 Oak Ave",
        neighborhoodPreferenceAddressMatch: true,
      },
    ])
    renderNeighborhoodPreferenceHeader()

    expect(
      screen.getByText(
        t("e2aNeighborhoodPreference.instructionsP1Plural", {
          address: "123 Main St and 456 Oak Ave",
        })
      )
    ).toBeInTheDocument()
  })

  it("deduplicates repeated addresses and ignores blank values", () => {
    mockLiveInTheNeighborhoodHouseholdMembers.mockReturnValue([
      {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        hasSameAddressAsApplicant: true,
        householdMemberAddressStreet: "123 Main St",
        neighborhoodPreferenceAddressMatch: true,
      },
      {
        id: "2",
        firstName: "Bob",
        lastName: "Doe",
        hasSameAddressAsApplicant: false,
        householdMemberAddressStreet: "123 Main St",
        neighborhoodPreferenceAddressMatch: true,
      },
      {
        id: "3",
        firstName: "Carol",
        lastName: "Doe",
        hasSameAddressAsApplicant: false,
        householdMemberAddressStreet: "",
        neighborhoodPreferenceAddressMatch: true,
      },
    ])

    renderNeighborhoodPreferenceHeader()

    expect(
      screen.getByText(
        t("e2aNeighborhoodPreference.instructionsP1Singular", {
          address: "123 Main St",
        })
      )
    ).toBeInTheDocument()
  })
})
