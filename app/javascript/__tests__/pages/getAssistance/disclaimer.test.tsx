import { renderAndLoadAsync } from "../../__util__/renderUtils"
import Disclaimer from "../../../pages/getAssistance/disclaimer"
import React from "react"

describe("<Disclaimer />", () => {
  it("shows the correct title text", async () => {
    const { getAllByText } = await renderAndLoadAsync(<Disclaimer assetPaths={{}} />)

    expect(getAllByText("Disclaimer")[0]).not.toBeNull()
  })
})
