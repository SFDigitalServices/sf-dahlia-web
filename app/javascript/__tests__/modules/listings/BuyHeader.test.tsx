import React from "react"
import { render } from "@testing-library/react"
import BuyHeader from "../../../modules/listings/BuyHeader"

describe("BuyHeader", () => {
  it("renders BuyHeader component", () => {
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

    const { asFragment } = render(<BuyHeader />)

    expect(asFragment()).toMatchSnapshot()
  })
})
