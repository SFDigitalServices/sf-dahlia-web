import React from "react"

import CreateAccount from "../../pages/account/create-account"
import { renderAndLoadAsync } from "../__util__/renderUtils"

jest.mock("react-helmet-async", () => {
  return {
    HelmetProvider: ({ children }: { children: React.ReactNode }) => children,
    Helmet: ({ children }: { children: React.ReactNode }) => children,
  }
})

describe("<CreateAccount />", () => {
  it("shows the correct form text", async () => {
    const { getAllByText } = await renderAndLoadAsync(<CreateAccount assetPaths={{}} />)
    expect(getAllByText("Create an Account")).not.toBeNull()
  })
})
