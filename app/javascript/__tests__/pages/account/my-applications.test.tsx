import { renderAndLoadAsync } from "../../__util__/renderUtils"
import MyApplications from "../../../pages/account/my-applications"
import React from "react"

describe("<MyApplications />", () => {
  it("shows the correct header text", async () => {
    const { getByText } = await renderAndLoadAsync(<MyApplications assetPaths={{}} />)

    expect(getByText("My Applications")).not.toBeNull()
  })
})
