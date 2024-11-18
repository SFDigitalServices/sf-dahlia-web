import { renderAndLoadAsync } from "../../__util__/renderUtils"
import DocumentChecklist from "../../../pages/getAssistance/document-checklist"
import React from "react"
import { within } from "@testing-library/react"
import { t } from "@bloom-housing/ui-components"

describe("<DocumentChecklist />", () => {
  it("shows the correct header text", async () => {
    const { getByTestId } = await renderAndLoadAsync(<DocumentChecklist assetPaths={{}} />)
    const header = getByTestId("page-header")

    expect(within(header).getByText(t("assistance.title.documentChecklist"))).not.toBeNull()
  })

  it("shows the correct subtitle text", async () => {
    const { getByText } = await renderAndLoadAsync(<DocumentChecklist assetPaths={{}} />)

    expect(getByText(t("assistance.subtitle.documentChecklist"))).not.toBeNull()
  })
})
