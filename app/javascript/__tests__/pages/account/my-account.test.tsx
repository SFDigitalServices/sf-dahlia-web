import { renderAndLoadAsync } from "../../__util__/renderUtils"
import MyAccount from "../../../pages/account/my-account"
import React from "react"

describe("<MyAccount />", () => {
  beforeEach(() => {
    // The below line prevents @axe-core from throwing an error
    // when the html tag does not have a lang attribute
    document.documentElement.lang = "en"
  })

  it("contains two links within the main content", async () => {
    const { getByTestId } = await renderAndLoadAsync(<MyAccount assetPaths={{}} />)
    const mainContent = getByTestId("main-content-test-id")

    const links = mainContent.querySelectorAll("a")
    expect(links).toHaveLength(2)
  })

  it("first link has title 'My Applications'", async () => {
    const { getByTestId } = await renderAndLoadAsync(<MyAccount assetPaths={{}} />)
    const mainContent = getByTestId("main-content-test-id")

    const links = mainContent.querySelectorAll("a")
    const linkHeader = links[0].querySelector("h1")
    expect(linkHeader?.textContent).toBe("My Applications")
  })

  it("second link has title 'Account Settings'", async () => {
    const { getByTestId } = await renderAndLoadAsync(<MyAccount assetPaths={{}} />)
    const mainContent = getByTestId("main-content-test-id")

    const links = mainContent.querySelectorAll("a")
    const linkHeader = links[1].querySelector("h1")
    expect(linkHeader?.textContent).toBe("Account Settings")
  })
})
