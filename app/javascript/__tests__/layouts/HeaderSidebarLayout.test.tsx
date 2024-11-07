import React from "react"
import { render, within } from "@testing-library/react"
import AssistanceLayout from "../../layouts/HeaderSidebarLayout"
import { renderAndLoadAsync } from "../__util__/renderUtils"

const CHILD_CONTENT = "Content!"

jest.mock("react-helmet-async", () => {
  return {
    HelmetProvider: ({ children }: { children: React.ReactNode }) => children, // Mock HelmetProvider
    Helmet: ({ children }: { children: React.ReactNode }) => children, // Mock Helmet component
  }
})

describe("<HeaderSidebarLayout />", () => {
  it("renders children", async () => {
    const { getByTestId } = await renderAndLoadAsync(
      <AssistanceLayout title="Title Text" subtitle="Subtitle Text">
        <h1>{CHILD_CONTENT}</h1>
      </AssistanceLayout>
    )
    const mainContent = getByTestId("info-main-content")

    expect(within(mainContent).getByText(CHILD_CONTENT)).not.toBeNull()
  })

  it("renders PageHeader", async () => {
    const TitleText = "Title Text"
    const SubtitleText = "SubTitle Text"
    const { getAllByText } = await renderAndLoadAsync(
      <AssistanceLayout title={TitleText} subtitle={SubtitleText}>
        <h1>{CHILD_CONTENT}</h1>
      </AssistanceLayout>
    )

    expect(getAllByText(TitleText).length).not.toBeNull()
    expect(getAllByText(SubtitleText).length).not.toBeNull()
  })

  describe("Contact Bar", () => {
    it("renders Contact Information", () => {
      const { asFragment } = render(
        <AssistanceLayout title="Title Text" subtitle="Subtitle Text">
          <h1>{CHILD_CONTENT}</h1>
        </AssistanceLayout>
      )

      expect(asFragment()).toMatchSnapshot()
    })
  })
})
