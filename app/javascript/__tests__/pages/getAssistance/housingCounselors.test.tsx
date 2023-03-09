import { renderAndLoadAsync } from "../../__util__/renderUtils"
import HousingCounselors from "../../../pages/getAssistance/housing-counselors"
import React from "react"
import { within } from "@testing-library/dom"
import { t } from "@bloom-housing/ui-components"

describe("<HousingCounselors />", () => {
  it("shows the correct header text", async () => {
    const { getByTestId } = await renderAndLoadAsync(<HousingCounselors assetPaths={{}} />)
    const header = getByTestId("page-header")

    expect(within(header).getByText(t("assistance.title.housingCouneslors"))).not.toBeNull()
  })

  it("shows the correct subtitle text", async () => {
    const { getByText } = await renderAndLoadAsync(<HousingCounselors assetPaths={{}} />)

    expect(getByText(t("assistance.subtitle.housingCouneslors"))).not.toBeNull()
  })
})
