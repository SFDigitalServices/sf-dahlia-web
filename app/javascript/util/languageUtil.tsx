import { t, addTranslation } from "@bloom-housing/ui-components"
import React from "react"

import { cleanPath, getPathWithoutLeadingSlash } from "./urlUtil"

type PhraseBundle = Record<string, unknown>
export interface LangConfig {
  prefix: LanguagePrefix
  isDefault: boolean
  getLabel: () => string
  load: () => Promise<PhraseBundle>
}

export enum LanguagePrefix {
  English = "en",
  Spanish = "es",
  Chinese = "zh",
  Tagalog = "tl",
}

export const LANGUAGE_CONFIGS: Record<LanguagePrefix, LangConfig> = {
  [LanguagePrefix.English]: {
    prefix: LanguagePrefix.English,
    isDefault: true,
    getLabel: () => t("languages.en"),
    load: async () => await import("../../assets/json/translations/react/en.json"),
  },
  [LanguagePrefix.Spanish]: {
    prefix: LanguagePrefix.Spanish,
    isDefault: false,
    getLabel: () => t("languages.es"),
    load: async () => await import("../../assets/json/translations/react/es.json"),
  },
  [LanguagePrefix.Chinese]: {
    prefix: LanguagePrefix.Chinese,
    isDefault: false,
    getLabel: () => t("languages.zh"),
    load: async () => await import("../../assets/json/translations/react/zh.json"),
  },
  [LanguagePrefix.Tagalog]: {
    prefix: LanguagePrefix.Tagalog,
    isDefault: false,
    getLabel: () => t("languages.tl"),
    load: async () => await import("../../assets/json/translations/react/tl.json"),
  },
}

const loadDefaultTranslation = async (): Promise<PhraseBundle> =>
  await Object.values(LANGUAGE_CONFIGS)
    .find((config) => config.isDefault)
    .load()

/**
 * Load the required translation phrases for the given language prefix.
 *
 * Ex: prefix="es" will load Spanish phrases with English as backup
 *
 * @param prefix is a string, cannot be blank or null.
 */
export const loadTranslations = async (prefix: LanguagePrefix): Promise<void> => {
  addTranslation(await loadDefaultTranslation())

  const config = LANGUAGE_CONFIGS[prefix]

  if (!config.isDefault) {
    addTranslation(await config.load())
  }
}

export const toLanguagePrefix = (routePrefix: string | undefined): LanguagePrefix => {
  switch (routePrefix) {
    case LanguagePrefix.Spanish:
      return LanguagePrefix.Spanish
    case LanguagePrefix.Chinese:
      return LanguagePrefix.Chinese
    case LanguagePrefix.Tagalog:
      return LanguagePrefix.Tagalog
    default:
      return LanguagePrefix.English
  }
}

/**
 * Get the language prefix from the url. Or null if no prefix is on the path
 */
export const getRoutePrefix = (path: string): LanguagePrefix | null => {
  const pathWithoutLeadingSlash = getPathWithoutLeadingSlash(path)
  const langConfig = Object.values(LANGUAGE_CONFIGS).find(
    (languageConfig) =>
      pathWithoutLeadingSlash === `${languageConfig.prefix}` ||
      pathWithoutLeadingSlash.startsWith(`${languageConfig.prefix}/`)
  )

  return langConfig?.prefix
}

/**
 * Get the current path minus the language prefix
 *
 * ex: /es/sign-in -> /sign-in, /sign-in -> /sign-in
 */
export const getPathWithoutLanguagePrefix = (path: string): string => {
  const cleanedPath = cleanPath(path)
  const prefix = getRoutePrefix(cleanedPath)
  if (!prefix) return cleanedPath

  const langConfig = Object.values(LANGUAGE_CONFIGS).find((config) => config.prefix === prefix)
  return cleanPath(`${cleanedPath.replace(langConfig.prefix, "")}`)
}

/**
 * Get the current language prefix, or default to the english prefix if there is no explicit prefix in
 * the path.
 */
export const getCurrentLanguage = (path: string | undefined): LanguagePrefix =>
  getRoutePrefix(path || "") || LanguagePrefix.English

/**
 * Get a renderable version of a translated string with e.g. a link in it as an alternative to using <Markdown />
 */
export function renderWithInnerHTML(translatedString: string) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: translatedString,
      }}
    />
  )
}

export function renderInlineWithInnerHTML(translatedString: string) {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: translatedString,
      }}
    />
  )
}

// Get the translated community type
export function getReservedCommunityType(type: string | undefined): string {
  switch (type) {
    case "Senior":
      return t("listings.reservedCommunityType.senior")
    case "Artist Live/Work":
      return t("listings.reservedCommunityType.artist")
    case "Habitat for Humanity":
      return t("listings.reservedCommunityType.habitat")
    case "Accessible Units Only":
      return t("listings.reservedCommunityType.accessible")
    case "Veteran":
      return t("listings.reservedCommunityType.veteran")
    case "Developmental disabilities":
      return t("listings.reservedCommunityType.disability")
    default:
      return type
  }
}
