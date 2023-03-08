import React from "react"

import { within } from "@testing-library/react"

import HomePage from "../../pages/index"
import { renderAndLoadAsync } from "../__util__/renderUtils"

describe("<HomePage />", () => {
  it("shows the correct header text", async () => {
    const { getByText } = await renderAndLoadAsync(<HomePage assetPaths={{}} />)

    expect(getByText("Apply for affordable housing")).not.toBeNull()
  })

  it("shows the correct footer logo path", async () => {
    const { getByTestId } = await renderAndLoadAsync(
      <HomePage assetPaths={{ "logo-city.png": "/public/logo.png" }} />
    )
    const sfLogo = getByTestId("footer-logo-test-id")
    expect(sfLogo).not.toBeNull()
    expect(sfLogo).toHaveAttribute("src", "/public/logo.png")
  })

  describe("Main page content", () => {
    const getLinkByText = (container: HTMLElement, text: string) =>
      within(container).getByRole("link", { name: text })

    let mainContentContainer: HTMLElement = null
    beforeEach(async () => {
      mainContentContainer = (await renderAndLoadAsync(<HomePage assetPaths={{}} />)).getByTestId(
        "main-content-test-id"
      )
    })

    it("renders a rent button", () => {
      expect(getLinkByText(mainContentContainer, "Rent")).toHaveAttribute(
        "href",
        "/listings/for-rent"
      )
    })

    it("renders a buy button", () => {
      expect(getLinkByText(mainContentContainer, "Buy")).toHaveAttribute(
        "href",
        "/listings/for-sale"
      )
    })

    it("renders the email sign up link", () => {
      const signUpLink = getLinkByText(mainContentContainer, "Sign Up today")
      expect(signUpLink).toHaveAttribute(
        "href",
        "https://confirmsubscription.com/h/y/C3BAFCD742D47910"
      )
    })
  })
})
