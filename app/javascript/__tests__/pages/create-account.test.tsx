import React from "react"

import CreateAccount from "../../pages/create-account"
import { renderAndLoadAsync } from "../__util__/renderUtils"

jest.mock("react-helmet-async", () => {
  return {
    HelmetProvider: ({ children }: { children: React.ReactNode }) => children, // Mock HelmetProvider
    Helmet: ({ children }: { children: React.ReactNode }) => children, // Mock Helmet component
  }
})

describe("<CreateAccount />", () => {
  it("shows the correct form text", async () => {
    const { getByText } = await renderAndLoadAsync(<CreateAccount assetPaths={{}} />)
    expect(getByText("Create an Account")).not.toBeNull()
  })
})
