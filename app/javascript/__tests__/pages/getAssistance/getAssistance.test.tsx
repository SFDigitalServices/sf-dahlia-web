import { renderAndLoadAsync } from "../../__util__/renderUtils"
import GetAssistance from "../../../pages/getAssistance/get-assistance"
import React from "react"
import { within } from "@testing-library/dom"
import { t } from "@bloom-housing/ui-components"

describe("<GetAssistance />", () => {
  it("shows the correct header text", async () => {
    const { getByTestId } = await renderAndLoadAsync(<GetAssistance assetPaths={{}} />)
    const mainContent = getByTestId("page-header")

    expect(within(mainContent).getByText(t("assistance.title.getAssistance"))).not.toBeNull()
  })

  it("shows the correct subtitle text", async () => {
    const { getByText } = await renderAndLoadAsync(<GetAssistance assetPaths={{}} />)

    expect(getByText(t("assistance.subtitle.getAssistance"))).not.toBeNull()
  })
})
