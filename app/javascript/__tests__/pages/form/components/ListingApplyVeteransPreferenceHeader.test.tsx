import React from "react"
import { t } from "@bloom-housing/ui-components"
import { screen } from "@testing-library/react"
import ListingApplyVeteransPreferenceHeader from "../../../../pages/form/components/ListingApplyVeteransPreferenceHeader"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"

describe("ListingApplyVeteransPreferenceHeader", () => {
  it("renders the content", () => {
    renderWithFormContextWrapper(<ListingApplyVeteransPreferenceHeader />)

    expect(screen.getByText(t("e7aVeteransPreference.title"))).toBeInTheDocument()
    expect(screen.getByText(t("e7aVeteransPreference.instructionsP1"))).toBeInTheDocument()
    expect(screen.getByText(t("e7aVeteransPreference.instructionsP4"))).toBeInTheDocument()
    expect(
      screen.getByText(t("e7aVeteransPreference.instructionsP2"), { exact: false })
    ).toBeInTheDocument()
    expect(
      screen.getByText(t("e7aVeteransPreference.instructionsP3"), { exact: false })
    ).toBeInTheDocument()
    const link = screen.getByText(t("e7aVeteransPreference.instructionsP5"))
    expect(link).toBeInTheDocument()
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "https://www.sf.gov/get-priority-housing-lottery-if-you-are-veteran"
    )
    expect(link.closest("a")).toHaveAttribute("target", "_blank")
  })
})
