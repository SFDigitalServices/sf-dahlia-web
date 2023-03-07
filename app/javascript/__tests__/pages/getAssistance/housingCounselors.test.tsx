import { renderAndLoadAsync } from "../../__util__/renderUtils"
import HousingCounselors from "../../../pages/getAssistance/housing-counselors"
import React from "react"

describe("<HousingCounselors />", () => {
  it("shows the correct header text", async () => {
    const { getByText } = await renderAndLoadAsync(<HousingCounselors assetPaths={{}} />)

    expect(getByText("Housing Counselors")).not.toBeNull()
  })
})
