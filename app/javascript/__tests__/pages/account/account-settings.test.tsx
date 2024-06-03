import { renderAndLoadAsync } from "../../__util__/renderUtils"
import AccountSettings from "../../../pages/account/account-settings"
import React from "react"

describe("<AccountSettings />", () => {
  it("shows the correct header text", async () => {
    const { getByText } = await renderAndLoadAsync(<AccountSettings assetPaths={{}} />)

    expect(getByText("Account Settings")).not.toBeNull()
  })
})
