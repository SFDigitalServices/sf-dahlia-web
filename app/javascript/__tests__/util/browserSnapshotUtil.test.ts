import { snapshotBrowser } from "../../util/browserSnapshotUtil"

describe("browserSnapshotUtil", () => {
  describe("snapshotBrowser", () => {
    it("captures passive browser signals used to classify ambiguous clicks", () => {
      const browser = snapshotBrowser()
      expect(browser).toEqual(
        expect.objectContaining({
          webdriver: expect.any(Boolean),
          userAgent: expect.any(String),
          maxTouchPoints: expect.any(Number),
          coarsePointer: expect.any(Boolean),
          screen: expect.stringMatching(/\d+x\d+@/),
        })
      )
    })

    // This runs inside the fire path, so a throwing property must never take the signal
    // with it - some webviews raise on these reads rather than returning undefined.
    it("falls back per-field when a property getter throws", () => {
      const spy = jest.spyOn(navigator, "userAgent", "get").mockImplementation(() => {
        throw new Error("blocked")
      })

      expect(() => snapshotBrowser()).not.toThrow()
      expect(snapshotBrowser().userAgent).toBe("")
      // Other fields still populate normally.
      expect(snapshotBrowser().screen).toMatch(/\d+x\d+@/)

      spy.mockRestore()
    })
  })
})
