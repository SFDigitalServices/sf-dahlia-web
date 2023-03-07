import { renderAndLoadAsync } from "../../__util__/renderUtils"
import GetAssistance from "../../../pages/getAssistance/get-assistance"
import React from "react"
import { within } from "@testing-library/dom"

describe("<GetAssistance />", () => {
  it("shows the correct header text", async () => {
    const { getByTestId } = await renderAndLoadAsync(<GetAssistance assetPaths={{}} />)
    const mainContent = getByTestId("main-content-test-id")

    expect(within(mainContent).getByText("Get Assistance")).not.toBeNull()
  })
})
