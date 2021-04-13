import {
  getPathWithoutLanguagePrefix,
  getCurrentLanguage,
  LANGUAGE_CONFIGS,
  LangConfig,
} from "./languageUtil"

export const getLocalizedPath = (path: string, languageOverride?: string): string => {
  const config: LangConfig = LANGUAGE_CONFIGS[languageOverride || getCurrentLanguage()]

  if (config.isDefault) {
    return path
  } else {
    return `/${config.prefix}${path}`
  }
}

export const getRentalDirectoryPath = (): string => getLocalizedPath("/listings/for-rent")
export const getSaleDirectoryPath = (): string => getLocalizedPath("/listings/for-sale")
export const getAssistancePath = (): string => getLocalizedPath("/get-assistance")
export const getSignInPath = (): string => getLocalizedPath("/sign-in")
export const getFavoritesPath = (): string => getLocalizedPath("/favorites")
export const getMyDashboardPath = (): string => getLocalizedPath("/account/dashboard")
export const getMyApplicationsPath = (): string => getLocalizedPath("/account/dashboard")
export const getMyAccountSettingsPath = (): string => getLocalizedPath("/account/settings")

export const getNewLanguagePath = (newLanguagePrefix: string): string =>
  getLocalizedPath(getPathWithoutLanguagePrefix(), newLanguagePrefix || "en")
