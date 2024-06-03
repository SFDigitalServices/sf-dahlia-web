import { renderAndLoadAsync } from "../../__util__/renderUtils"
import MyAccount from "../../../pages/account/my-account"
import React from "react"

describe("<MyAccount />", () => {
  it("shows the correct header text", async () => {
    const { getByText } = await renderAndLoadAsync(<MyAccount assetPaths={{}} />)

    expect(getByText("My Account")).not.toBeNull()
  })
})
