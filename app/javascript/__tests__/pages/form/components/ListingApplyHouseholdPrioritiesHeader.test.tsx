import React from "react"
import { t } from "@bloom-housing/ui-components"
import { screen } from "@testing-library/react"
import ListingApplyHouseholdPrioritiesHeader from "../../../../pages/form/components/ListingApplyHouseholdPrioritiesHeader"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"

describe("ListingApplyHouseholdPrioritiesHeader", () => {
  it("renders the household title when liveAlone is false", () => {
    renderWithFormContextWrapper(<ListingApplyHouseholdPrioritiesHeader />, {
      formData: { liveAlone: "false" },
    })

    expect(screen.getByText(t("c7HouseholdPriorities.titleHousehold"))).not.toBeNull()
  })

  it("renders the individual title when liveAlone is true", () => {
    renderWithFormContextWrapper(<ListingApplyHouseholdPrioritiesHeader />, {
      formData: { liveAlone: "true" },
    })

    expect(screen.getByText(t("c7HouseholdPriorities.titleYou"))).not.toBeNull()
  })

  it("renders the individual title when liveAlone is not set", () => {
    renderWithFormContextWrapper(<ListingApplyHouseholdPrioritiesHeader />)

    expect(screen.getByText(t("c7HouseholdPriorities.titleYou"))).not.toBeNull()
  })

  it("renders the description paragraph", () => {
    renderWithFormContextWrapper(<ListingApplyHouseholdPrioritiesHeader />)

    expect(screen.getByText(t("c7HouseholdPriorities.p1"))).not.toBeNull()
  })
})
