import { renderAndLoadAsync } from "../../__util__/renderUtils"
import AdditionalResources from "../../../pages/getAssistance/additional-resources"
import React from "react"
import { within } from "@testing-library/dom"
import { t } from "@bloom-housing/ui-components"

describe("<AdditionalResources />", () => {
  it("shows the correct header text", async (done) => {
    const { getByTestId } = await renderAndLoadAsync(<AdditionalResources assetPaths={{}} />)
    const header = getByTestId("page-header")

    expect(
      within(header).getByText(t("assistance.title.additionalHousingOpportunities"))
    ).not.toBeNull()
    done()
  })

  it("shows the correct subtitle text", async (done) => {
    const { getByText } = await renderAndLoadAsync(<AdditionalResources assetPaths={{}} />)

    expect(getByText(t("assistance.subtitle.additionalHousingOpportunities"))).not.toBeNull()
    done()
  })
})
