import { renderAndLoadAsync } from "../../__util__/renderUtils"
import DocumentChecklist from "../../../pages/getAssistance/document-checklist"
import React from "react"

describe("<DocumentChecklist />", () => {
  it("shows the correct header text", async () => {
    const { getByText } = await renderAndLoadAsync(<DocumentChecklist assetPaths={{}} />)

    expect(getByText("Document Checklist")).not.toBeNull()
  })
})
