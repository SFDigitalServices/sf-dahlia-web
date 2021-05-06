import React from "react"

import HomePage from "../../pages/HomePage"
import { renderAndLoadAsync } from "../__util__/renderUtils"

describe("<HomePage />", () => {
  it("shows the correct header text", async () => {
    const { getByText } = await renderAndLoadAsync(<HomePage assetPaths={{}} />)

    expect(getByText("Apply for affordable housing")).not.toBeNull()
  })
})
