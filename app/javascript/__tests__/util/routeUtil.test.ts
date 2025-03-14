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
  getForgotPasswordPath,
  createPath,
  getSignInRedirectUrl,
  RedirectType,
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
      expect(getMyAccountPath("/es/sign-in")).toBe("/es/my-account")
      expect(getMyAccountPath("")).toBe("/my-account")
    })

    it("returns the correct path for getmyApplicationsPath", () => {
      expect(getMyApplicationsPath("/es/sign-in")).toBe("/es/my-applications")
      expect(getMyApplicationsPath("")).toBe("/my-applications")
    })

    it("returns the correct path for getMyaccountSettingsPath", () => {
      expect(getMyAccountSettingsPath("/es/sign-in")).toBe("/es/account-settings")
      expect(getMyAccountSettingsPath("")).toBe("/account-settings")
    })
    it("returns the correct path for getForgotPasswordPath", () => {
      expect(getForgotPasswordPath()).toBe("/forgot-password")
      expect(getForgotPasswordPath("")).toBe("/forgot-password")

      expect(getForgotPasswordPath("es/sign-in")).toBe("/es/forgot-password")
    })
  })

  describe("getNewLanguagePath", () => {
    it("returns the correct path", () => {
      expect(getNewLanguagePath("/", "en", "")).toBe("/")
      expect(getNewLanguagePath("/", "es", "")).toBe("/es")
      expect(getNewLanguagePath("/es", "zh", "")).toBe("/zh")
      expect(getNewLanguagePath("/", "invalid-language-prefix", "")).toBe("/")
      expect(getNewLanguagePath("/", "", "")).toBe("/")
    })

    it("returns the correct path when not on the homepage", () => {
      expect(getNewLanguagePath("/sign-in", "en", "")).toBe("/sign-in")
      expect(getNewLanguagePath("/sign-in", "es", "")).toBe("/es/sign-in")
      expect(getNewLanguagePath("/es/sign-in", "zh", "")).toBe("/zh/sign-in")
      expect(getNewLanguagePath("/sign-in", "invalid-language-prefix", "")).toBe("/sign-in")
      expect(getNewLanguagePath("/sign-in", "", "")).toBe("/sign-in")
    })

    it("returns the correct path with a query string", () => {
      expect(getNewLanguagePath("/sign-in", "en", "?react=true")).toBe("/sign-in?react=true")
      expect(getNewLanguagePath("/sign-in", "es", "?react=true")).toBe("/es/sign-in?react=true")
      expect(getNewLanguagePath("/es/sign-in", "zh", "?react=true")).toBe("/zh/sign-in?react=true")
      expect(getNewLanguagePath("/sign-in", "invalid-language-prefix", "?react=true")).toBe(
        "/sign-in?react=true"
      )
      expect(getNewLanguagePath("/sign-in", "", "?react=true")).toBe("/sign-in?react=true")
    })
  })

  describe("createPath", () => {
    it("should create a path with query parameters", () => {
      const path = getForgotPasswordPath()
      const params = { email: "test@example.com", token: "12345" }
      const result = createPath(path, params)
      expect(result).toBe("/forgot-password?email=test@example.com&token=12345")
    })

    it("should handle undefined parameters", () => {
      const path = getForgotPasswordPath()
      const params = { email: "test@example.com", token: undefined }
      const result = createPath(path, params)
      expect(result).toBe("/forgot-password?email=test@example.com")
    })

    it("should return the original path if no parameters are provided", () => {
      const path = getForgotPasswordPath()
      const params = {}
      const result = createPath(path, params)
      expect(result).toBe("/forgot-password")
    })

    it("should handle multiple parameters", () => {
      const path = getForgotPasswordPath()
      const params = { email: "test@example.com", token: "12345", lang: "en" }
      const result = createPath(path, params)
      expect(result).toBe("/forgot-password?email=test@example.com&token=12345&lang=en")
    })

    it("should handle empty string parameters", () => {
      const path = getForgotPasswordPath()
      const params = { email: "", token: "12345" }
      const result = createPath(path, params)
      expect(result).toBe("/forgot-password?token=12345")
    })
  })
  describe("getSignInRedirectUrl", () => {
    it("returns the correct redirect URL for 'account'", () => {
      expect(getSignInRedirectUrl(RedirectType.Account)).toBe("/my-account")
    })

    it("returns the correct redirect URL for 'applications'", () => {
      expect(getSignInRedirectUrl(RedirectType.Applications)).toBe("/my-applications")
    })

    it("returns the correct redirect URL for 'settings'", () => {
      expect(getSignInRedirectUrl(RedirectType.Settings)).toBe("/account-settings")
    })

    it("returns the correct redirect URL for 'home'", () => {
      expect(getSignInRedirectUrl(RedirectType.Home)).toBe("/")
    })

    it("returns the default redirect URL for an unknown key", () => {
      expect(getSignInRedirectUrl("unknown" as RedirectType)).toBe("/")
    })

    it("returns the default redirect URL when no key is provided", () => {
      expect(getSignInRedirectUrl("" as RedirectType)).toBe("/my-account")
    })
  })
})
