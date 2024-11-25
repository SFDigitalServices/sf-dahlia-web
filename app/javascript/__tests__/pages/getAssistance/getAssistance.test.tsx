import { renderAndLoadAsync } from "../../__util__/renderUtils"
import GetAssistance from "../../../pages/getAssistance/get-assistance"
import React from "react"
import { within } from "@testing-library/react"
import { t } from "@bloom-housing/ui-components"

describe("<GetAssistance />", () => {
  beforeEach(() => {
    document.documentElement.lang = "en"
  })

  it("shows the correct header text", async () => {
    const { getByTestId } = await renderAndLoadAsync(<GetAssistance assetPaths={{}} />)
    const mainContent = getByTestId("page-header")

    expect(within(mainContent).getByText(t("assistance.title.getAssistance"))).not.toBeNull()
  })

  it("shows the correct subtitle text", async () => {
    const { getByText } = await renderAndLoadAsync(<GetAssistance assetPaths={{}} />)

    expect(getByText(t("assistance.subtitle.getAssistance"))).not.toBeNull()
  })

  it("shows the correct section title text", async () => {
    const { getByText } = await renderAndLoadAsync(<GetAssistance assetPaths={{}} />)

    expect(getByText(t("assistance.title.housingCouneslors"))).not.toBeNull()
    expect(getByText(t("assistance.title.additionalHousingOpportunities"))).not.toBeNull()
    expect(getByText(t("assistance.title.sfServices"))).not.toBeNull()
    expect(getByText(t("assistance.title.documentChecklist"))).not.toBeNull()
    expect(getByText(t("assistance.title.dahliaVideos"))).not.toBeNull()
  })
})
