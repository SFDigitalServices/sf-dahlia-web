import { renderAndLoadAsync } from "../../__util__/renderUtils"
import React from "react"
import Privacy from "../../../pages/getAssistance/privacy"

describe("<Privacy />", () => {
  it("shows the correct title text", async () => {
    const { getByText } = await renderAndLoadAsync(<Privacy assetPaths={{}} />)

    expect(getByText("Privacy Policy Content")).not.toBeNull()
  })
})
