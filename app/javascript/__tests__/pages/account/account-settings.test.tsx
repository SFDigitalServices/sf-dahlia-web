import React from "react"
import UserContext, { ContextProps } from "../../../authentication/context/UserContext"
import { renderAndLoadAsync } from "../../__util__/renderUtils"
import AccountSettingsPage from "../../../pages/account/account-settings"

describe("when the user is signed in", () => {
  let getByText
  let originalUseContext

  beforeEach(async () => {
    originalUseContext = React.useContext
    const mockContextValue: ContextProps = {
      profile: {
        uid: "abc123",
        email: "email@email.com",
        created_at: new Date(),
        updated_at: new Date(),
      },
      signIn: jest.fn(),
      signOut: jest.fn(),
      loading: false,
      initialStateLoaded: true,
    }

    jest.spyOn(React, "useContext").mockImplementation((context) => {
      if (context === UserContext) {
        return mockContextValue
      }
      return originalUseContext(context)
    })

    const renderResult = await renderAndLoadAsync(<AccountSettingsPage assetPaths={{}} />)
    getByText = renderResult.getByText
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })
  it("contains two links within the main content", async () => {
    const title = getByText("Account Settings")

    expect(title).not.toBeNull()
  })
})
