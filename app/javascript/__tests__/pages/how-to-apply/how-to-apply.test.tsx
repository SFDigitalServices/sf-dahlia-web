import React from "react"

import { renderAndLoadAsync } from "../../__util__/renderUtils"
import HowToApply from "../../../pages/how-to-apply/how-to-apply"

describe("<HowToApply />", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("shows the correct header text", async () => {
    const { getAllByText } = await renderAndLoadAsync(<HowToApply assetPaths={{}} />)
    expect(getAllByText("How to Apply")).not.toBeNull()
  })
})
