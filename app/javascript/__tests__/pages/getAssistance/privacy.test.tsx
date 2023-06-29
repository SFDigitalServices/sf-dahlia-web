import { renderAndLoadAsync } from "../../__util__/renderUtils"
import React from "react"
import Privacy from "../../../pages/getAssistance/privacy"

describe("<Privacy />", () => {
  it("shows the correct title text", async () => {
    const { getAllByText } = await renderAndLoadAsync(<Privacy assetPaths={{}} />)

    expect(getAllByText("Privacy Policy")[0]).not.toBeNull()
  })
})
