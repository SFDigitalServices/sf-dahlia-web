import { renderAndLoadAsync } from "../../__util__/renderUtils"
import AdditionalResources from "../../../pages/getAssistance/additional-resources"
import React from "react"

describe("<AdditionalResources />", () => {
  it("shows the correct header text", async () => {
    const { getByText } = await renderAndLoadAsync(<AdditionalResources assetPaths={{}} />)

    expect(getByText("More Housing Opportunities")).not.toBeNull()
  })
})
