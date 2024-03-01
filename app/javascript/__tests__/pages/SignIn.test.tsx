import React from "react"

import SignIn from "../../pages/sign-in"
import { renderAndLoadAsync } from "../__util__/renderUtils"

jest.mock("react-helmet-async", () => {
  return {
    HelmetProvider: ({ children }: { children: React.ReactNode }) => children, // Mock HelmetProvider
    Helmet: ({ children }: { children: React.ReactNode }) => children, // Mock Helmet component
  }
})

describe("<SignIn />", () => {
  it("shows the correct form text", async () => {
    const { getAllByText, getByText } = await renderAndLoadAsync(<SignIn assetPaths={{}} />)
    expect(getAllByText("Sign In")).toHaveLength(4)
    expect(getByText("Email")).not.toBeNull()
    expect(getByText("Password")).not.toBeNull()
    expect(getByText("Don't have an account?")).not.toBeNull()
  })
})
