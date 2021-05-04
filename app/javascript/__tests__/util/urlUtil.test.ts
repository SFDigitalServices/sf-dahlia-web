import {
  cleanPath,
  getPathWithoutLeadingSlash,
  getPathWithoutTrailingSlash,
} from "../../util/urlUtil"

describe("urlUtil", () => {
  describe("getPathWithoutLeadingSlash", () => {
    it("works with empty string", () => {
      expect(getPathWithoutLeadingSlash("")).toBe("")
    })

    it("works with single leading slashes", () => {
      expect(getPathWithoutLeadingSlash("/")).toBe("")
      expect(getPathWithoutLeadingSlash("/sign-in")).toBe("sign-in")
      expect(getPathWithoutLeadingSlash("/sign-in/")).toBe("sign-in/")
    })

    it("works with multiple leading slashes", () => {
      expect(getPathWithoutLeadingSlash("//")).toBe("")
      expect(getPathWithoutLeadingSlash("//sign-in")).toBe("sign-in")
      expect(getPathWithoutLeadingSlash("//sign-in/")).toBe("sign-in/")
    })
  })

  describe("getPathWithoutTrailingSlash", () => {
    it("works with empty string", () => {
      expect(getPathWithoutTrailingSlash("")).toBe("")
    })

    it("works with single trailing slashes", () => {
      expect(getPathWithoutTrailingSlash("/")).toBe("")
      expect(getPathWithoutTrailingSlash("sign-in/")).toBe("sign-in")
      expect(getPathWithoutTrailingSlash("/sign-in/")).toBe("/sign-in")
    })

    it("works with multiple trailing slashes", () => {
      expect(getPathWithoutTrailingSlash("//")).toBe("")
      expect(getPathWithoutTrailingSlash("sign-in//")).toBe("sign-in")
      expect(getPathWithoutTrailingSlash("//sign-in//")).toBe("//sign-in")
    })
  })

  describe("cleanPath", () => {
    it("works with empty string", () => {
      expect(cleanPath("")).toBe("/")
    })

    it("doesn't change already-clean paths", () => {
      expect(cleanPath("/")).toBe("/")
      expect(cleanPath("/sign-in")).toBe("/sign-in")
      expect(cleanPath("/en/sign-in")).toBe("/en/sign-in")
    })

    it("removes trailing slashes", () => {
      expect(cleanPath("sign-in/")).toBe("/sign-in")
      expect(cleanPath("/sign-in/")).toBe("/sign-in")
    })

    it("removes multiple slashes", () => {
      expect(cleanPath("///")).toBe("/")
      expect(cleanPath("///sign-in///")).toBe("/sign-in")
      expect(cleanPath("///sign-in")).toBe("/sign-in")
      expect(cleanPath("sign-in///")).toBe("/sign-in")
    })
  })
})
