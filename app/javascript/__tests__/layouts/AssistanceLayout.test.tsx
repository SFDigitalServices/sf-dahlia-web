import React from "react"
import { within } from "@testing-library/react"
import AssistanceLayout from "../../layouts/AssistanceLayout"
import { renderAndLoadAsync } from "../__util__/renderUtils"
import renderer from "react-test-renderer"

const CHILD_CONTENT = "Content!"

describe("<AssistanceLayout />", () => {
  it("renders children", async () => {
    const { getByTestId } = await renderAndLoadAsync(
      <AssistanceLayout title="Title Text" subtitle="Subtitle Text">
        <h1>{CHILD_CONTENT}</h1>
      </AssistanceLayout>
    )
    const mainContent = getByTestId("assistance-main-content")

    expect(within(mainContent).getByText(CHILD_CONTENT)).not.toBeNull()
  })

  it("renders PageHeader", async () => {
    const TitleText = "Title Text"
    const SubtitleText = "SubTitle Text"
    const { getByText } = await renderAndLoadAsync(
      <AssistanceLayout title={TitleText} subtitle={SubtitleText}>
        <h1>{CHILD_CONTENT}</h1>
      </AssistanceLayout>
    )

    expect(getByText(TitleText)).not.toBeNull()
    expect(getByText(SubtitleText)).not.toBeNull()
  })

  describe("Contact Bar", () => {
    it("renders Contact Information", () => {
      const tree = renderer
        .create(
          <AssistanceLayout title="Title Text" subtitle="Subtitle Text">
            <h1>{CHILD_CONTENT}</h1>
          </AssistanceLayout>
        )
        .toJSON()
      expect(tree).toMatchSnapshot()
    })
  })
})
