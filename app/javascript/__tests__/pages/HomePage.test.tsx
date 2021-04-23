import React from "react"

import HomePage from "../../pages/HomePage"
import { renderAndLoadAsync } from "../__util__/actUtils"

describe("<HomePage />", () => {
  it("shows the correct header text", async () => {
    const { getByText } = await renderAndLoadAsync(<HomePage />)

    expect(getByText("Apply for affordable housing")).not.toBeNull()
  })
})
