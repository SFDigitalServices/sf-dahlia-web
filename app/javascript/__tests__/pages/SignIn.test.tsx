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
    const { getAllByText, getByText, getByRole } = await renderAndLoadAsync(
      <SignIn assetPaths={{}} />
    )
    expect(getAllByText("Sign in")).not.toBeNull()
    expect(
      getByRole("textbox", {
        name: /email/i,
      })
    ).not.toBeNull()
    expect(getByText("Password")).not.toBeNull()
    expect(getByText("Create an account")).not.toBeNull()
  })
})
