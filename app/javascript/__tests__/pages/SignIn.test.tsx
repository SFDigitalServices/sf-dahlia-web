import React from "react"

import SignIn from "../../pages/SignIn"
import { renderAndLoadAsync } from "../__util__/renderUtils"

describe("<SignIn />", () => {
  it("shows the correct form text", async () => {
    const { getAllByText, getByText } = await renderAndLoadAsync(<SignIn />)
    expect(getAllByText("Sign In")).toHaveLength(3)
    expect(getByText("Email")).not.toBeNull()
    expect(getByText("Password")).not.toBeNull()
    expect(getByText("Don't have an account?")).not.toBeNull()
  })
})
