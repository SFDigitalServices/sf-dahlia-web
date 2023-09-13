import React from "react"

import SignIn from "../../pages/sign-in"
import { renderAndLoadAsync } from "../__util__/renderUtils"

jest.mock("react-helmet-async", () => {
  return {
    // eslint-disable-next-line react/prop-types
    HelmetProvider: ({ children }) => <div>{children}</div>, // Mock HelmetProvider
    // eslint-disable-next-line react/prop-types
    Helmet: ({ children }) => <div>{children}</div>, // Mock Helmet component
  }
})

describe("<SignIn />", () => {
  it("shows the correct form text", async (done) => {
    const { getAllByText, getByText } = await renderAndLoadAsync(<SignIn assetPaths={{}} />)
    expect(getAllByText("Sign In")).toHaveLength(4)
    expect(getByText("Email")).not.toBeNull()
    expect(getByText("Password")).not.toBeNull()
    expect(getByText("Don't have an account?")).not.toBeNull()
    done()
  })
})
