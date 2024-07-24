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

export const getHomepagePath = localizedPathGetter("/")
export const getRentalDirectoryPath = localizedPathGetter("/listings/for-rent")
export const getSaleDirectoryPath = localizedPathGetter("/listings/for-sale")
export const getAssistancePath = localizedPathGetter("/get-assistance")
export const getSignInPath = localizedPathGetter("/sign-in")
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

// Rental Listing Directory
export const getHelpCalculatingIncomeLink = localizedPathGetter("/income-calculator/rental/intro")
export const getEligibilityEstimatorLink = localizedPathGetter("/eligibility-estimator/rental")

// Footer
export const getDisclaimerPath = localizedPathGetter("/disclaimer")
export const getPrivacyPolicyPath = localizedPathGetter("/privacy")
