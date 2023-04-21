import React from "react"
import renderer from "react-test-renderer"
import ForSale from "../../../pages/listings/for-sale"
import mockAxios from "jest-mock-axios"

jest.useFakeTimers()

jest.mock("axios")

// jest.mock("axios")
// const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("For Sale", () => {
  afterEach(() => {
    mockAxios.reset()
  })

  it("renders ForSale component", async (done) => {
    mockAxios.get.mockResolvedValueOnce([])
    const tree = renderer.create(<ForSale assetPaths="/" />).toJSON()
    setImmediate(() => {
      expect(tree).toMatchSnapshot()
      done()
    })
  })
})
