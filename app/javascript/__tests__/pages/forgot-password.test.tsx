import React from "react"

import ForgotPassword from "../../pages/forgot-password"
import { renderAndLoadAsync } from "../__util__/renderUtils"

jest.mock("react-helmet-async", () => {
  return {
    HelmetProvider: ({ children }: { children: React.ReactNode }) => children, // Mock HelmetProvider
    Helmet: ({ children }: { children: React.ReactNode }) => children, // Mock Helmet component
  }
})

describe("<ForgotPassword />", () => {
  it("shows the correct form text", async () => {
    const { getByText } = await renderAndLoadAsync(<ForgotPassword assetPaths={{}} />)
    expect(getByText("Forgot Password")).not.toBeNull()
  })
})
