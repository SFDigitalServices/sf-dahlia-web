import React from "react"
import { within } from "@testing-library/react"
import Layout from "../../layouts/Layout"
import { renderAndLoadAsync } from "../__util__/renderUtils"
import { setupUserContext } from "../__util__/accountUtils"

const getHeader = (container: HTMLElement) => {
  const header = container.querySelector("header")
  if (!header) {
    throw new Error("expected a header element")
  }
  return header
}

describe("<Layout /> header auth links", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("hides Sign in during the sign-in flow", async () => {
    const { container } = await renderAndLoadAsync(
      <Layout>
        <div>content</div>
      </Layout>,
      undefined,
      ["/sign-in"]
    )
    const header = getHeader(container)

    expect(within(header).queryByText("Sign in")).toBeNull()
    expect(within(header).getByText("Rent")).not.toBeNull()
  })

  it("hides Sign in during the create-account flow", async () => {
    const { container } = await renderAndLoadAsync(
      <Layout>
        <div>content</div>
      </Layout>,
      undefined,
      ["/create-account"]
    )
    const header = getHeader(container)

    expect(within(header).queryByText("Sign in")).toBeNull()
    expect(within(header).getByText("Rent")).not.toBeNull()
  })

  it("shows Account without the avatar when signed in without a profile", async () => {
    setupUserContext({ loggedIn: true, hasProfile: false })
    const { container } = await renderAndLoadAsync(
      <Layout>
        <div>content</div>
      </Layout>,
      undefined,
      ["/listings/for-rent"]
    )
    const header = getHeader(container)

    expect(within(header).getByTestId("Account-3")).not.toBeNull()
    expect(header.querySelector("[class*='account-avatar']")).toBeNull()
  })

  it("hides Account on add-profile until the user finishes their profile", async () => {
    setupUserContext({ loggedIn: true, hasProfile: false })
    const { container } = await renderAndLoadAsync(
      <Layout>
        <div>content</div>
      </Layout>,
      undefined,
      ["/add-profile"]
    )
    const header = getHeader(container)

    expect(within(header).queryByText("Sign in")).toBeNull()
    expect(within(header).queryByTestId("Account-3")).toBeNull()
    expect(within(header).getByText("Rent")).not.toBeNull()
  })

  it("shows Sign in after leaving the sign-in flow", async () => {
    const { container } = await renderAndLoadAsync(
      <Layout>
        <div>content</div>
      </Layout>,
      undefined,
      ["/listings/for-rent"]
    )
    const header = getHeader(container)

    expect(within(header).getByText("Sign in")).not.toBeNull()
  })

  it("shows Account after the user has signed in", async () => {
    setupUserContext({ loggedIn: true })
    const { container } = await renderAndLoadAsync(
      <Layout>
        <div>content</div>
      </Layout>,
      undefined,
      ["/account"]
    )
    const header = getHeader(container)

    expect(within(header).queryByText("Sign in")).toBeNull()
    expect(within(header).getByTestId("Account-3")).not.toBeNull()
  })
})
