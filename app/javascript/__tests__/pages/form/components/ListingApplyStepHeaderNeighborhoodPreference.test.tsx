import React from "react"
import { screen } from "@testing-library/react"
import { t } from "@bloom-housing/ui-components"
import ListingApplyStepHeaderNeighborhoodPreference from "../../../../pages/form/components/ListingApplyStepHeaderNeighborhoodPreference"
import { liveInTheNeighborhoodHouseholdMembers } from "../../../../pages/form/components/household/householdUtils"
import { eligibleForAssistedHousingOrRentBurden } from "../../../../pages/form/components/ListingApplyStepHeaderNeighborhoodPreferenceUtils"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"

jest.mock("../../../../pages/form/components/household/householdUtils", () => ({
  liveInTheNeighborhoodHouseholdMembers: jest.fn(),
}))

jest.mock(
  "../../../../pages/form/components/ListingApplyStepHeaderNeighborhoodPreferenceUtils",
  () => ({
    eligibleForAssistedHousingOrRentBurden: jest.fn(),
  })
)

const mockLiveInTheNeighborhoodHouseholdMembers = liveInTheNeighborhoodHouseholdMembers as jest.Mock
const mockEligibleForAssistedHousingOrRentBurden =
  eligibleForAssistedHousingOrRentBurden as jest.Mock

const renderNeighborhoodPreferenceHeader = (formData: Record<string, unknown> = {}) => {
  renderWithFormContextWrapper(<ListingApplyStepHeaderNeighborhoodPreference />, {
    formData,
    renderForm: false,
  })
}

describe("ListingApplyStepHeaderNeighborhoodPreference", () => {
  beforeEach(() => {
    mockLiveInTheNeighborhoodHouseholdMembers.mockReset()
    mockEligibleForAssistedHousingOrRentBurden.mockReset()
    mockEligibleForAssistedHousingOrRentBurden.mockReturnValue(false)
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

  it("renders the standard header when eligibleForAssistedHousingOrRentBurden is true", () => {
    mockEligibleForAssistedHousingOrRentBurden.mockReturnValue(true)
    mockLiveInTheNeighborhoodHouseholdMembers.mockReturnValue([
      {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        hasSameAddressAsApplicant: true,
        householdMemberAddressStreet: "123 Main St",
        neighborhoodPreferenceAddressMatch: true,
      },
    ])

    renderNeighborhoodPreferenceHeader()

    expect(
      screen.getByRole("heading", {
        name: t("e2aNeighborhoodPreference.instructionsP1Singular", {
          address: "123 Main St",
        }),
      })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("heading", { name: t("label.goodNewsForHigherRanking") })
    ).not.toBeInTheDocument()
    expect(screen.getByText(/Just upload valid proof of this address and/i)).toBeInTheDocument()
  })
})
