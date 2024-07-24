import React from "react"

import { renderAndLoadAsync } from "../__util__/renderUtils"
import ResetPassword from "../../pages/reset-password"

jest.mock("react-helmet-async", () => {
  return {
    HelmetProvider: ({ children }: { children: React.ReactNode }) => children, // Mock HelmetProvider
    Helmet: ({ children }: { children: React.ReactNode }) => children, // Mock Helmet component
  }
})

describe("<ResetPassword />", () => {
  it("shows the correct form text", async () => {
    const { getAllByText } = await renderAndLoadAsync(<ResetPassword assetPaths={{}} />)
    expect(getAllByText("Reset Password")).not.toBeNull()
  })
})
