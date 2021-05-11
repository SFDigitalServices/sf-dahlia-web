import React from "react"

import { cleanup } from "@testing-library/react"

import HomePage from "../../pages/HomePage"
import { renderAndLoadAsync } from "../__util__/renderUtils"

afterEach(cleanup)
describe("<HomePage />", () => {
  it("shows the correct header text", async () => {
    const { getByText } = await renderAndLoadAsync(<HomePage assetPaths={{}} />)

    expect(getByText("Apply for affordable housing")).not.toBeNull()
  })

  it("shows the correct footer logo path", async () => {
    const { getByAltText } = await renderAndLoadAsync(
      <HomePage assetPaths={{ "logo-city.png": "/public/logo.png" }} />
    )
    const sfLogo = getByAltText("City & County of San Francisco Logo")
    expect(sfLogo).not.toBeNull()
    expect(sfLogo).toHaveAttribute("src", "/public/logo.png")
  })
})
