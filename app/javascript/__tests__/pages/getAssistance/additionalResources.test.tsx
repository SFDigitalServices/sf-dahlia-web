import { renderAndLoadAsync } from "../../__util__/renderUtils"
import AdditionalResources from "../../../pages/getAssistance/additional-resources"
import React from "react"
import { within } from "@testing-library/react"
import { t } from "@bloom-housing/ui-components"

describe("<AdditionalResources />", () => {
  it("shows the correct header text", async () => {
    const { getByTestId } = await renderAndLoadAsync(<AdditionalResources assetPaths={{}} />)
    const header = getByTestId("page-header")

    expect(
      within(header).getByText(t("assistance.title.additionalHousingOpportunities"))
    ).not.toBeNull()
  })

  it("shows the correct subtitle text", async () => {
    const { getByText } = await renderAndLoadAsync(<AdditionalResources assetPaths={{}} />)

    expect(getByText(t("assistance.subtitle.additionalHousingOpportunities"))).not.toBeNull()
  })
})
