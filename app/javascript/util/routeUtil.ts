import {
  getCurrentLanguage,
  getPathWithoutLanguagePrefix,
  LangConfig,
  LANGUAGE_CONFIGS,
  LanguagePrefix,
} from "./languageUtil"
import { cleanPath } from "./urlUtil"

/**
 * Given a path string, get the same path with the correct localized prefix appended to it.
 *
 * ex getLocalizedPath("/sign-in", LanguagePrefix.Spanish) -> "/es/sign-in"
 */
export const getLocalizedPath = (
  newPath: string,
  newLanguage: LanguagePrefix,
  queryString: string | undefined = undefined
): string => {
  const newPathWithoutLanguage = getPathWithoutLanguagePrefix(newPath)
  const config: LangConfig = LANGUAGE_CONFIGS[newLanguage]

  const cleanedPath = cleanPath(
    config.isDefault ? newPathWithoutLanguage : `${config.prefix}${newPathWithoutLanguage}`
  )

  return `${cleanedPath}${queryString || ""}`
}

export const localizedPathGetter =
  (newPathNonLocalized: string) =>
  (currentPath: string | undefined = window.location.pathname): string =>
    getLocalizedPath(newPathNonLocalized, getCurrentLanguage(currentPath))

export const localizedPath = (newPathNonLocalized: string) => {
  const currentPath: string | undefined = window.location.pathname
  return getLocalizedPath(newPathNonLocalized, getCurrentLanguage(currentPath))
}

/**
 * Get new path after switching languages
 */
export const getNewLanguagePath = (
  currentPath: string | undefined,
  newLanguagePrefix: string,
  queryString: string | undefined
): string => {
  if (Object.values(LanguagePrefix).includes(newLanguagePrefix as LanguagePrefix)) {
    return getLocalizedPath(currentPath, newLanguagePrefix as LanguagePrefix, queryString)
  }
  return getLocalizedPath(currentPath, LanguagePrefix.English, queryString)
}

/**
 *
 * Create a new path with one or more params that may or may not be undefined.
 * The function should take in a localized path (from one of the functions below) and a params object.
 */
export const createPath = (path: string, params: { [key: string]: string | undefined }): string => {
  let newPath = path
  let firstAdded = false
  Object.keys(params).forEach((key) => {
    if (params[key] && !firstAdded) {
      newPath += `?${key}=${params[key]}`
      firstAdded = true
    } else if (params[key]) {
      newPath += `&${key}=${params[key]}`
    }
  })
  return newPath
}

export const getHomepagePath = localizedPathGetter("/")
export const getRentalDirectoryPath = localizedPathGetter("/listings/for-rent")
export const getSaleDirectoryPath = localizedPathGetter("/listings/for-sale")
export const getAssistancePath = localizedPathGetter("/get-assistance")
export const getSignInPath = localizedPathGetter("/sign-in")
export const getForgotPasswordPath = localizedPathGetter("/forgot-password")
export const getResetPasswordPath = localizedPathGetter("/reset-password")
export const getFavoritesPath = localizedPathGetter("/favorites")
export const getMyAccountPath = localizedPathGetter("/my-account")
export const getMyApplicationsPath = localizedPathGetter("/my-applications")
export const getMyAccountSettingsPath = localizedPathGetter("/account-settings")
export const getAdditionalResourcesPath = localizedPathGetter("/additional-resources")
export const getHousingCounselorsPath = localizedPathGetter("/housing-counselors")
export const getDocumentChecklistPath = localizedPathGetter("/document-checklist")
export const getShareListingPath = localizedPathGetter("/share")
export const getApplicationPath = localizedPathGetter("/applications")
export const getListingDetailPath = localizedPathGetter("/listings")
export const getCreateAccountPath = localizedPathGetter("/create-account")

// Rental Listing Directory
export const getHelpCalculatingIncomeLink = localizedPathGetter("/income-calculator/rental/intro")
export const getEligibilityEstimatorLink = localizedPathGetter("/eligibility-estimator/rental")

// Footer
export const getDisclaimerPath = localizedPathGetter("/disclaimer")
export const getPrivacyPolicyPath = localizedPathGetter("/privacy")

export enum RedirectType {
  Account = "account",
  Applications = "applications",
  Settings = "settings",
  Home = "home",
}

export enum AlertReason {
  SignOut = "sign-out",
  TimeOut = "time-out",
  ConnectionIssue = "connection-issue",
  LoginRequired = "login-required",
}

export const mapRedirectParamToEnum = (param: string | null): RedirectType => {
  switch (param) {
    case "account":
      return RedirectType.Account
    case "applications":
      return RedirectType.Applications
    case "settings":
      return RedirectType.Settings
    case "home":
      return RedirectType.Home
    default:
      return RedirectType.Home
  }
}

export const mapAlertParamToEnum = (param: string | null): AlertReason => {
  switch (param) {
    case "sign-out":
      return AlertReason.SignOut
    case "time-out":
      return AlertReason.TimeOut
    case "connection-issue":
      return AlertReason.ConnectionIssue
    case "login-required":
      return AlertReason.LoginRequired
    default:
      return AlertReason.ConnectionIssue
  }
}

export const SignInRedirectUrls = {
  [RedirectType.Account]: getMyAccountPath(),
  [RedirectType.Applications]: getMyApplicationsPath(),
  [RedirectType.Settings]: getMyAccountSettingsPath(),
  [RedirectType.Home]: getHomepagePath(),
}

const getRedirectUrl = (key: RedirectType): string => {
  return SignInRedirectUrls[key] || SignInRedirectUrls[RedirectType.Home]
}

export const getSignInRedirectUrl = (redirect: RedirectType) => {
  return getRedirectUrl(redirect || RedirectType.Account)
}

export enum AppPages {
  Home = "home",
  RentalDirectory = "for rent Listings",
  SaleDirectory = "for sale listings",
  GetAssistance = "get assistance",
  SignIn = "sign in",
  CreateAccount = "create account",
  ForgotPassword = "forgot password",
  ResetPassword = "reset password",
  Favorites = "favorites",
  MyAccount = "my account",
  MyApplications = "my applications",
  AccountSettings = "account settings",
  AdditionalResources = "additional resources",
  HousingCounselors = "housing counselors",
  DocumentChecklist = "document checklist",
  ShareListing = "share listing",
  Application = "application",
  ListingDetail = "listing detail",
  HelpCalculatingIncome = "help calculating income",
  EligibilityEstimator = "eligibility estimator",
  Disclaimer = "disclaimer",
  PrivacyPolicy = "privacy policy",
  HowToApply = "how to apply",
  ListingInterest = "listing interest",
  ListingApplyForm = "listing apply form",
}
