import {
  AppPages,
  clerkRedirectManager,
  getAssistancePath,
  getMyAccountSettingsPath,
  getApplicationPath,
  getMyAccountApplicationsPath,
  getMyAccountPath,
  getNewLanguagePath,
  getRentalDirectoryPath,
  getSaleDirectoryPath,
  getForgotPasswordPath,
  createPath,
  getSignInRedirectUrl,
  RedirectType,
} from "../../util/routeUtil"
import { AUTH_FLOW } from "../../modules/constants"

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

    it("returns the correct path for getMyAccountPath", () => {
      expect(getMyAccountPath("/es/sign-in")).toBe("/es/account")
      expect(getMyAccountPath("")).toBe("/account")
    })

    it("returns the correct path for getMyAccountApplicationsPath", () => {
      expect(getMyAccountApplicationsPath("/es/sign-in")).toBe("/es/account/applications")
      expect(getMyAccountApplicationsPath("")).toBe("/account/applications")
    })

    it("returns the correct path for getApplicationPath", () => {
      expect(getApplicationPath("/es/sign-in")).toBe("/es/applications")
      expect(getApplicationPath("")).toBe("/applications")
    })

    it("returns the correct path for getMyaccountSettingsPath", () => {
      expect(getMyAccountSettingsPath("/es/sign-in")).toBe("/es/account/settings")
      expect(getMyAccountSettingsPath("")).toBe("/account/settings")
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
      expect(getSignInRedirectUrl(RedirectType.Account)).toBe("/account")
    })

    it("returns the correct redirect URL for 'applications'", () => {
      expect(getSignInRedirectUrl(RedirectType.Applications)).toBe("/account/applications")
    })

    it("returns the correct redirect URL for 'settings'", () => {
      expect(getSignInRedirectUrl(RedirectType.Settings)).toBe("/account/settings")
    })

    it("returns the correct redirect URL for 'home'", () => {
      expect(getSignInRedirectUrl(RedirectType.Home)).toBe("/")
    })

    it("returns the default redirect URL for an unknown key", () => {
      expect(getSignInRedirectUrl("unknown" as RedirectType)).toBe("/")
    })

    it("returns the default redirect URL when no key is provided", () => {
      expect(getSignInRedirectUrl("" as RedirectType)).toBe("/account")
    })
  })

  describe("clerkRedirectManager", () => {
    type RedirectOptions = Parameters<typeof clerkRedirectManager>[1]

    const evaluate = (pageName: AppPages, overrides: Partial<RedirectOptions> = {}) =>
      clerkRedirectManager(pageName, {
        isSignedIn: false,
        hasProfile: false,
        hasPassword: false,
        ...overrides,
      })

    const clerkRedirectCases: Array<{
      description: string
      pageName: AppPages
      overrides?: Partial<RedirectOptions>
      expectedRedirectUrl?: string
      expectedReturnUrl?: string
    }> = [
      // Account page
      {
        description: "Account: signed out users go to sign-in with account return URL",
        pageName: AppPages.Account,
        expectedRedirectUrl: "/sign-in",
        expectedReturnUrl: "/account",
      },
      {
        description: "Account: signed-in users without a profile go to add-profile",
        pageName: AppPages.Account,
        overrides: { isSignedIn: true },
        expectedRedirectUrl: "/add-profile",
      },
      {
        description: "Account: signed-in users with a profile are allowed through",
        pageName: AppPages.Account,
        overrides: { isSignedIn: true, hasProfile: true },
      },

      // Contact page
      {
        description: "Contact: signed out users go to sign-in with contact return URL",
        pageName: AppPages.Contact,
        expectedRedirectUrl: "/sign-in",
        expectedReturnUrl: "/account/contact",
      },
      {
        description: "Contact: signed-in users without a profile go to add-profile",
        pageName: AppPages.Contact,
        overrides: { isSignedIn: true },
        expectedRedirectUrl: "/add-profile",
      },
      {
        description: "Contact: signed-in users with a profile are allowed through",
        pageName: AppPages.Contact,
        overrides: { isSignedIn: true, hasProfile: true },
      },

      // Account settings page
      {
        description: "AccountSettings: signed out users go to sign-in with settings return URL",
        pageName: AppPages.AccountSettings,
        expectedRedirectUrl: "/sign-in",
        expectedReturnUrl: "/account/settings",
      },
      {
        description: "AccountSettings: signed-in users without a profile go to add-profile",
        pageName: AppPages.AccountSettings,
        overrides: { isSignedIn: true },
        expectedRedirectUrl: "/add-profile",
      },
      {
        description: "AccountSettings: signed-in users with a profile are allowed through",
        pageName: AppPages.AccountSettings,
        overrides: { isSignedIn: true, hasProfile: true },
      },

      // Applications page
      {
        description: "Applications: signed out users go to sign-in with applications return URL",
        pageName: AppPages.Applications,
        expectedRedirectUrl: "/sign-in",
        expectedReturnUrl: "/account/applications",
      },
      {
        description: "Applications: signed-in users without a profile go to add-profile",
        pageName: AppPages.Applications,
        overrides: { isSignedIn: true },
        expectedRedirectUrl: "/add-profile",
      },
      {
        description: "Applications: signed-in users with a profile are allowed through",
        pageName: AppPages.Applications,
        overrides: { isSignedIn: true, hasProfile: true },
      },

      // Add-password page
      {
        description: "AddPassword: signed out users go to sign-in",
        pageName: AppPages.AddPassword,
        expectedRedirectUrl: "/sign-in",
      },
      {
        description: "AddPassword: signed-in users with profile and password go to account",
        pageName: AppPages.AddPassword,
        overrides: { isSignedIn: true, hasProfile: true, hasPassword: true },
        expectedRedirectUrl: "/account",
      },
      {
        description:
          "AddPassword: signed-in users without profile but with password go to add-profile",
        pageName: AppPages.AddPassword,
        overrides: { isSignedIn: true, hasPassword: true },
        expectedRedirectUrl: "/add-profile",
      },
      {
        description:
          "AddPassword: signed-in users with profile and no password are allowed through",
        pageName: AppPages.AddPassword,
        overrides: { isSignedIn: true, hasProfile: true, hasPassword: false },
      },

      // Add-profile page
      {
        description: "AddProfile: signed out users go to sign-in",
        pageName: AppPages.AddProfile,
        expectedRedirectUrl: "/sign-in",
      },
      {
        description: "AddProfile: signed-in users with a profile go to account",
        pageName: AppPages.AddProfile,
        overrides: { isSignedIn: true, hasProfile: true },
        expectedRedirectUrl: "/account",
      },
      {
        description: "AddProfile: signed-in users without a profile are allowed through",
        pageName: AppPages.AddProfile,
        overrides: { isSignedIn: true, hasProfile: false },
      },

      // Verification-code page
      {
        description: "EnterVerificationCode: no flow and no email goes to sign-in",
        pageName: AppPages.EnterVerificationCode,
        expectedRedirectUrl: "/sign-in",
      },
      {
        description:
          "EnterVerificationCode: create-account flow with missing email returns to create-account",
        pageName: AppPages.EnterVerificationCode,
        overrides: { authFlow: AUTH_FLOW.CREATE_ACCOUNT },
        expectedRedirectUrl: "/create-account",
      },
      {
        description: "EnterVerificationCode: sign-in flow with missing email returns to sign-in",
        pageName: AppPages.EnterVerificationCode,
        overrides: { authFlow: AUTH_FLOW.SIGN_IN },
        expectedRedirectUrl: "/sign-in",
      },
      {
        description:
          "EnterVerificationCode: forgot-password flow with missing email returns to forgot-password",
        pageName: AppPages.EnterVerificationCode,
        overrides: { authFlow: AUTH_FLOW.FORGOT_PASSWORD },
        expectedRedirectUrl: "/forgot-password",
      },
      {
        description:
          "EnterVerificationCode: update-email flow with missing email returns to update-email",
        pageName: AppPages.EnterVerificationCode,
        overrides: { authFlow: AUTH_FLOW.UPDATE_EMAIL },
        expectedRedirectUrl: "/update-email",
      },
      {
        description:
          "EnterVerificationCode: non-update flow, signed in, profile exists goes to account",
        pageName: AppPages.EnterVerificationCode,
        overrides: {
          isSignedIn: true,
          hasProfile: true,
          authFlow: AUTH_FLOW.SIGN_IN,
          verificationCodeEmailAddress: "test@example.com",
        },
        expectedRedirectUrl: "/account",
      },
      {
        description:
          "EnterVerificationCode: non-update flow, signed in, profile missing goes to add-profile",
        pageName: AppPages.EnterVerificationCode,
        overrides: {
          isSignedIn: true,
          hasProfile: false,
          authFlow: AUTH_FLOW.SIGN_IN,
          verificationCodeEmailAddress: "test@example.com",
        },
        expectedRedirectUrl: "/add-profile",
      },
      {
        description:
          "EnterVerificationCode: update-email flow with email allows signed-in users through",
        pageName: AppPages.EnterVerificationCode,
        overrides: {
          isSignedIn: true,
          hasProfile: true,
          authFlow: AUTH_FLOW.UPDATE_EMAIL,
          verificationCodeEmailAddress: "test@example.com",
        },
      },
      {
        description:
          "EnterVerificationCode: signed-out users with in-progress email flow are allowed through",
        pageName: AppPages.EnterVerificationCode,
        overrides: {
          isSignedIn: false,
          hasProfile: false,
          authFlow: AUTH_FLOW.CREATE_ACCOUNT,
          verificationCodeEmailAddress: "test@example.com",
        },
      },

      // Any page not handled by clerkRedirectManager
      {
        description: "Unhandled pages do not redirect",
        pageName: AppPages.Home,
      },
    ]

    it.each(clerkRedirectCases)(
      "$description",
      ({ pageName, overrides = {}, expectedRedirectUrl, expectedReturnUrl }) => {
        expect(evaluate(pageName, overrides)).toEqual({
          redirectUrl: expectedRedirectUrl,
          returnUrl: expectedReturnUrl,
        })
      }
    )
  })
})
