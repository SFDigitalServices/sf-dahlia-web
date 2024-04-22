import { renderAndLoadAsync } from "../../__util__/renderUtils"
import React from "react"
import Privacy from "../../../pages/getAssistance/privacy"

describe("<Privacy />", () => {
  it("shows the correct title text", async () => {
    const { getAllByText } = await renderAndLoadAsync(<Privacy assetPaths={{}} />)

    expect(getAllByText("Privacy Policy")[0]).not.toBeNull()
  })

  it("shows the correct content when test feature flag is set to true", async () => {
    const { getByText } = await renderAndLoadAsync(<Privacy assetPaths={{}} />)

    expect(getByText("Test Unleash flag is enabled")).toBeInTheDocument()
  })

  it("shows the correct content when test feature flag is set to false", async () => {
    jest.spyOn(require("@unleash/proxy-client-react"), "useFlag").mockImplementation(() => false)

    const { queryByText } = await renderAndLoadAsync(<Privacy assetPaths={{}} />)

    expect(queryByText("Test Unleash flag is enabled")).not.toBeInTheDocument()

    jest.spyOn(require("@unleash/proxy-client-react"), "useFlag").mockRestore()
  })
})
