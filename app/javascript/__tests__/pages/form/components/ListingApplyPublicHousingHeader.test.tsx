import React from "react"
import { t } from "@bloom-housing/ui-components"
import { screen } from "@testing-library/react"
import ListingApplyPublicHousingHeader from "../../../../pages/form/components/ListingApplyPublicHousingHeader"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"

describe("ListingApplyPublicHousingHeader", () => {
  it("renders the household title when liveAlone is false", () => {
    renderWithFormContextWrapper(<ListingApplyPublicHousingHeader />, {
      formData: { liveAlone: "false" },
    })

    expect(screen.getByText(t("c4HouseholdPublicHousing.titleHousehold"))).toBeInTheDocument()
  })

  it("renders the individual title when liveAlone is true", () => {
    renderWithFormContextWrapper(<ListingApplyPublicHousingHeader />, {
      formData: { liveAlone: "true" },
    })

    expect(screen.getByText(t("c4HouseholdPublicHousing.titleYou"))).toBeInTheDocument()
  })

  it("renders the individual title when liveAlone is not set", () => {
    renderWithFormContextWrapper(<ListingApplyPublicHousingHeader />)

    expect(screen.getByText(t("c4HouseholdPublicHousing.titleYou"))).toBeInTheDocument()
  })

  it("renders the description paragraph", () => {
    renderWithFormContextWrapper(<ListingApplyPublicHousingHeader />)

    expect(screen.getByText(t("c4HouseholdPublicHousing.p1"))).toBeInTheDocument()
  })
})
