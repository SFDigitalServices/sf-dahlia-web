import {
  getAssistancePath,
  getFavoritesPath,
  getMyAccountSettingsPath,
  getMyApplicationsPath,
  getMyAccountPath,
  getNewLanguagePath,
  getRentalDirectoryPath,
  getSaleDirectoryPath,
  getSignInPath,
} from "../../util/routeUtil"

describe("routeUtil", () => {
  describe("get paths", () => {
    it("returns the correct path for getRentalDirectoryPath", () => {
      expect(getRentalDirectoryPath("/es/sign-in")).toBe("/es/listings/for-rent")
      expect(getRentalDirectoryPath("")).toBe("/listings/for-rent")
    })

    it("returns the correct path for getSaleDirectoryPath", () => {
      expect(getSaleDirectoryPath("/es/sign-in")).toBe("/es/listings/for-sale")
      expect(getSaleDirectoryPath("")).toBe("/listings/for-sale")
    })

    it("returns the correct path for getAssistancePath", () => {
      expect(getAssistancePath("/es/sign-in")).toBe("/es/get-assistance")
      expect(getAssistancePath("")).toBe("/get-assistance")
    })

    it("returns the correct path for getSignInPath", () => {
      expect(getSignInPath("/es/favorites")).toBe("/es/sign-in")
      expect(getSignInPath("")).toBe("/sign-in")
    })

    it("returns the correct path for getFavoritesPath", () => {
      expect(getFavoritesPath("/es/sign-in")).toBe("/es/favorites")
      expect(getFavoritesPath("")).toBe("/favorites")
    })

    it("returns the correct path for getMyAccountPath", () => {
      expect(getMyAccountPath("/es/sign-in")).toBe("/es/account/dashboard")
      expect(getMyAccountPath("")).toBe("/account/dashboard")
    })

    it("returns the correct path for getmyApplicationsPath", () => {
      expect(getMyApplicationsPath("/es/sign-in")).toBe("/es/account/applications")
      expect(getMyApplicationsPath("")).toBe("/account/applications")
    })

    it("returns the correct path for getMyaccountSettingsPath", () => {
      expect(getMyAccountSettingsPath("/es/sign-in")).toBe("/es/account/settings")
      expect(getMyAccountSettingsPath("")).toBe("/account/settings")
    })
  })

  describe("getNewLanguagePath", () => {
    it("returns the correct path", () => {
      expect(getNewLanguagePath("/", "en")).toBe("/")
      expect(getNewLanguagePath("/", "es")).toBe("/es")
      expect(getNewLanguagePath("/es", "zh")).toBe("/zh")
      expect(getNewLanguagePath("/", "invalid-language-prefix")).toBe("/")
      expect(getNewLanguagePath("/", "")).toBe("/")
    })

    it("returns the correct path when not on the homepage", () => {
      expect(getNewLanguagePath("/sign-in", "en")).toBe("/sign-in")
      expect(getNewLanguagePath("/sign-in", "es")).toBe("/es/sign-in")
      expect(getNewLanguagePath("/es/sign-in", "zh")).toBe("/zh/sign-in")
      expect(getNewLanguagePath("/sign-in", "invalid-language-prefix")).toBe("/sign-in")
      expect(getNewLanguagePath("/sign-in", "")).toBe("/sign-in")
    })
  })
})
