import React from "react"

import { within } from "@testing-library/react"

import HomePage from "../../pages/index"
import { renderAndLoadAsync } from "../__util__/renderUtils"

const getLinkByText = (container: HTMLElement, text: string) =>
  within(container).getByRole("link", { name: text })

describe("<HomePage />", () => {
  beforeEach(() => {
    // The below line prevents @axe-core from throwing an error
    // when the html tag does not have a lang attribute
    document.documentElement.lang = "en"
  })

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
    it("renders a rent button", async () => {
      const { getByTestId } = await renderAndLoadAsync(<HomePage assetPaths={{}} />)
      const mainContentContainer = getByTestId("main-content-test-id")
      expect(getLinkByText(mainContentContainer, "Rent")).toHaveAttribute(
        "href",
        "/listings/for-rent"
      )
    })

    it("renders a buy button", async () => {
      const { getByTestId } = await renderAndLoadAsync(<HomePage assetPaths={{}} />)
      const mainContentContainer = getByTestId("main-content-test-id")
      expect(getLinkByText(mainContentContainer, "Buy")).toHaveAttribute(
        "href",
        "/listings/for-sale"
      )
    })

    it("renders the email sign up link", async () => {
      const { getByTestId } = await renderAndLoadAsync(<HomePage assetPaths={{}} />)
      const mainContentContainer = getByTestId("main-content-test-id")
      const signUpLink = getLinkByText(mainContentContainer, "Sign Up today")
      expect(signUpLink).toHaveAttribute(
        "href",
        "https://confirmsubscription.com/h/y/C3BAFCD742D47910"
      )
    })
  })
})
