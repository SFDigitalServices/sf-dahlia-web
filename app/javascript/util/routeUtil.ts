import {
  getPathWithoutLanguagePrefix,
  LANGUAGE_CONFIGS,
  LangConfig,
  LanguagePrefix,
  toLanguagePrefix,
  getCurrentLanguage,
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

const localizedPathGetter = (newPathNonLocalized: string) => (
  currentPath: string | undefined = window.location.pathname
): string => getLocalizedPath(newPathNonLocalized, getCurrentLanguage(currentPath))

/**
 * Get new path after switching languages
 */
export const getNewLanguagePath = (
  currentPath: string | undefined,
  newLanguagePrefix: string,
  queryString: string | undefined
): string => getLocalizedPath(currentPath, toLanguagePrefix(newLanguagePrefix), queryString)

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

// Footer
export const getDisclaimerPath = localizedPathGetter("/disclaimer")
export const getPrivacyPolicyPath = localizedPathGetter("/privacy")
