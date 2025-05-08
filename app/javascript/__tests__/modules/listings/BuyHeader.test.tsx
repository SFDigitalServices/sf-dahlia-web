import React from "react"
import { render } from "@testing-library/react"
import BuyHeader from "../../../modules/listings/BuyHeader"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(),
}))

describe("BuyHeader", () => {
  it("renders BuyHeader component with See the listings button", async () => {
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })
    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        matches: true,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }
    })

    const { findByText, asFragment } = render(<BuyHeader />)

    expect(asFragment()).toMatchSnapshot()
    expect(await findByText("See the listings")).toBeDefined()
  })

  it("renders BuyHeader component with See homes for sale button", async () => {
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        matches: true,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }
    })

    const { findByText, asFragment } = render(<BuyHeader />)

    expect(asFragment()).toMatchSnapshot()
    expect(await findByText("See homes for sale")).toBeDefined()
  })
})
