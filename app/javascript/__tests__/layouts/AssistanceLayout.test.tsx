import React from "react"
import { render, within } from "@testing-library/react"
import AssistanceLayout, { languageToSFGovMap } from "../../layouts/AssistanceLayout"
import { renderAndLoadAsync } from "../__util__/renderUtils"

const CHILD_CONTENT = "Content!"

jest.mock("react-helmet-async", () => {
  return {
    HelmetProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, // Mock HelmetProvider
    Helmet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, // Mock Helmet component
  }
})

describe("<AssistanceLayout />", () => {
  it("renders children", async (done) => {
    const { getByTestId } = await renderAndLoadAsync(
      <AssistanceLayout title="Title Text" subtitle="Subtitle Text">
        <h1>{CHILD_CONTENT}</h1>
      </AssistanceLayout>
    )
    const mainContent = getByTestId("assistance-main-content")

    expect(within(mainContent).getByText(CHILD_CONTENT)).not.toBeNull()
    done()
  })

  it("renders PageHeader", async (done) => {
    const TitleText = "Title Text"
    const SubtitleText = "SubTitle Text"
    const { getAllByText } = await renderAndLoadAsync(
      <AssistanceLayout title={TitleText} subtitle={SubtitleText}>
        <h1>{CHILD_CONTENT}</h1>
      </AssistanceLayout>
    )

    expect(getAllByText(TitleText).length).not.toBeNull()
    expect(getAllByText(SubtitleText).length).not.toBeNull()
    done()
  })

  it("lanauageToSFGovMap returns the proper url", () => {
    expect(languageToSFGovMap("en")).toBe(
      "https://sf.gov/departments/mayors-office-housing-and-community-development"
    )
    expect(languageToSFGovMap("es")).toBe("https://sf.gov/es/node/55")
    expect(languageToSFGovMap("zh")).toBe("https://sf.gov/zh-hant/node/55")
    expect(languageToSFGovMap("tl")).toBe("https://sf.gov/fil/node/55")
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
