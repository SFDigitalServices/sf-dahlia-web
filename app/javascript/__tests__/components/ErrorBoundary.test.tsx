import React from "react"
import ErrorBoundary, { BoundaryScope } from "../../components/ErrorBoundary"
import { renderAndLoadAsync } from "../__util__/renderUtils"

const errorMsg = "this is an intentional error for testing"
const ErrorTest = () => {
  throw new Error(errorMsg)
}

describe("ErrorBoundary", () => {
  // Suppress console errors for this test because we intentionally throw errors
  beforeEach(() => {
    jest.spyOn(console, "error")
     
    // @ts-ignore
    console.error.mockImplementation(() => null)

    jest.spyOn(console, "debug")
     
    // @ts-ignore
    console.debug.mockImplementation(() => null)
  })

  afterEach(() => {
     
    // @ts-ignore
    console.error.mockRestore()

     
    // @ts-ignore
    console.debug.mockRestore()
  })

  it("displays content when there is no error", async () => {
    const content = "test 123"
    const { getByText } = await renderAndLoadAsync(
      <ErrorBoundary boundaryScope={BoundaryScope.page}>
        <div>{content}</div>
      </ErrorBoundary>
    )

    getByText(content)
  })

  it("display fallback UI when error thrown for content level error boundary", async () => {
    const { getByText } = await renderAndLoadAsync(
      <ErrorBoundary boundaryScope={BoundaryScope.content}>
        <div>
          <ErrorTest />
        </div>
      </ErrorBoundary>
    )

    getByText("An error occurred. Check back later.")
  })

  it("throws error when error occurs for page level boundary", async () => {
    // In development environments, errors bubble up to window object so checking for error instead of redirect.
    // https://reactjs.org/docs/react-component.html#componentdidcatch

    await expect(
      renderAndLoadAsync(
        <ErrorBoundary boundaryScope={BoundaryScope.page}>
          <div>
            <ErrorTest />
          </div>
        </ErrorBoundary>
      )
    ).rejects.toThrow(errorMsg)
  })
})
