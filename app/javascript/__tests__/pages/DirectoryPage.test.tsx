import React from "react"

import DirectoryPage from "../../pages/DirectoryPage"
import { renderAndLoadAsync } from "../__util__/renderUtils"

describe("<DirectoryPage />", () => {
  it("renders successfully", async () => {
    const { getByText } = await renderAndLoadAsync(<DirectoryPage assetPaths={{}} isRental />)

    expect(getByText("Is Rental: true")).not.toBeNull()
  })
})
