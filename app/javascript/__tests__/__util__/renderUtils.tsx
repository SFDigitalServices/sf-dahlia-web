import { act, render, RenderOptions, RenderResult } from "@testing-library/react"
import React from "react"

/**
 * Render the component and wait for its async calls to complete.
 *
 * This is useful when a component loads in data with a useEffect()
 * hook.
 */
export const renderAndLoadAsync = async (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "queries">
): Promise<RenderResult> => {
  let renderResponse: RenderResult = {} as RenderResult
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    renderResponse = render(ui, options)
  })

  return renderResponse
}
