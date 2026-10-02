import React from "react"
import { fireEvent, waitFor, within } from "@testing-library/react"
import Layout from "../../layouts/Layout"
import { AuthSessionProvider } from "../../authentication/session/AuthSessionProvider"
import { clearHousingCounselorSession } from "../../api/authApiService"
import { renderAndLoadAsync } from "../__util__/renderUtils"
import { mockProfileStub, setupUserContext } from "../__util__/accountUtils"

jest.mock("../../api/authApiService", () => ({
  ...jest.requireActual("../../api/authApiService"),
  clearHousingCounselorSession: jest.fn(),
  getProfile: jest.fn(),
}))

const getHeader = (container: HTMLElement) => {
  const header = container.querySelector("header")
  if (!header) {
    throw new Error("expected a header element")
  }
  return header
}

describe("<Layout />", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("hides the sign in navigation header during the sign in flow", async () => {
    const { container } = await renderAndLoadAsync(
      <AuthSessionProvider>
        <Layout>
          <div>content</div>
        </Layout>
      </AuthSessionProvider>,
      undefined,
      ["/sign-in"]
    )
    const header = getHeader(container)

    expect(within(header).queryByText("Sign in")).toBeNull()
    expect(within(header).getByText("Rent")).not.toBeNull()
  })

  it("hides the sign in navigation header during the create account flow", async () => {
    const { container } = await renderAndLoadAsync(
      <AuthSessionProvider>
        <Layout>
          <div>content</div>
        </Layout>
      </AuthSessionProvider>,
      undefined,
      ["/create-account"]
    )
    const header = getHeader(container)

    expect(within(header).queryByText("Sign in")).toBeNull()
    expect(within(header).getByText("Rent")).not.toBeNull()
  })

  it("shows the account navigation header without the avatar when signed in without a profile", async () => {
    setupUserContext({ loggedIn: true, hasProfile: false })
    const { container } = await renderAndLoadAsync(
      <AuthSessionProvider>
        <Layout>
          <div>content</div>
        </Layout>
      </AuthSessionProvider>,
      undefined,
      ["/listings/for-rent"]
    )
    const header = getHeader(container)

    expect(within(header).getByTestId("Account-3")).not.toBeNull()
    expect(header.querySelector("[class*='account-avatar']")).toBeNull()
  })

  it("hides the account navigation header on add profile until the user finishes their profile", async () => {
    setupUserContext({ loggedIn: true, hasProfile: false })
    const { container } = await renderAndLoadAsync(
      <AuthSessionProvider>
        <Layout>
          <div>content</div>
        </Layout>
      </AuthSessionProvider>,
      undefined,
      ["/add-profile"]
    )
    const header = getHeader(container)

    expect(within(header).queryByText("Sign in")).toBeNull()
    expect(within(header).queryByTestId("Account-3")).toBeNull()
    expect(within(header).getByText("Rent")).not.toBeNull()
  })

  it("shows the sign in navigation header after leaving the sign in flow", async () => {
    const { container } = await renderAndLoadAsync(
      <AuthSessionProvider>
        <Layout>
          <div>content</div>
        </Layout>
      </AuthSessionProvider>,
      undefined,
      ["/listings/for-rent"]
    )
    const header = getHeader(container)

    expect(within(header).getByText("Sign in")).not.toBeNull()
  })

  it("shows the account navigation header after the user has signed in", async () => {
    setupUserContext({ loggedIn: true })
    const { container } = await renderAndLoadAsync(
      <AuthSessionProvider>
        <Layout>
          <div>content</div>
        </Layout>
      </AuthSessionProvider>,
      undefined,
      ["/account"]
    )
    const header = getHeader(container)

    expect(within(header).queryByText("Sign in")).toBeNull()
    expect(within(header).getByTestId("Account-3")).not.toBeNull()
  })

  describe("header notice", () => {
    const renderNotice = async () => {
      const { container } = await renderAndLoadAsync(
        <AuthSessionProvider>
          <Layout>
            <div>content</div>
          </Layout>
        </AuthSessionProvider>,
        undefined,
        ["/account"]
      )
      const notice = container.querySelector<HTMLElement>(".site-header__notice")
      if (!notice) {
        throw new Error("expected a header notice")
      }
      return notice
    }

    it("shows the feedback link for an ordinary account", async () => {
      setupUserContext({ loggedIn: true })

      const notice = await renderNotice()

      expect(within(notice).getByText(/your feedback/)).not.toBeNull()
      expect(within(notice).queryByText(/You are signed in as/)).toBeNull()
    })

    describe("while a housing counselor is in a delegated account", () => {
      beforeEach(() => {
        setupUserContext({
          loggedIn: true,
          mockProfile: {
            ...mockProfileStub,
            firstName: "Rosa",
            lastName: "Flores",
            isDelegated: true,
          },
        })
      })

      it("names whose account they are in, in place of the feedback link", async () => {
        const notice = await renderNotice()

        expect(within(notice).getByText("You are signed in as Rosa Flores.")).not.toBeNull()
        expect(within(notice).queryByText(/your feedback/)).toBeNull()
      })

      it("signs out of the delegated account", async () => {
        const notice = await renderNotice()

        fireEvent.click(within(notice).getByRole("button", { name: "Sign out" }))

        await waitFor(() => expect(clearHousingCounselorSession).toHaveBeenCalled())
      })
    })
  })
})
