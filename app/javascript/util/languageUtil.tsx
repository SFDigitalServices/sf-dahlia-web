import { t, addTranslation } from "@bloom-housing/ui-components"
import Markdown from "markdown-to-jsx"
import dayjs, { PluginFunc } from "dayjs"
import React from "react"

import { stripMostTags } from "./filterUtil"
import { cleanPath, getPathWithoutLeadingSlash } from "./urlUtil"
import { CUSTOM_LISTING_TYPES, SFGOV_LINKS } from "../modules/constants"
import {
  RailsTranslationLanguage,
  RailsTranslations,
} from "../api/types/rails/listings/RailsTranslation"

type PhraseBundle = Record<string, unknown>
export interface LangConfig {
  prefix: LanguagePrefix
  isDefault: boolean
  getLabel: () => string
  load: () => Promise<PhraseBundle>
}

interface TranslationInterpolations {
  [key: string]: string
}

export enum LanguagePrefix {
  English = "en",
  Spanish = "es",
  Chinese = "zh",
  Tagalog = "tl",
}

// Mapping of language prefixes to dayjs language codes
enum dayJsLocales {
  en = "en",
  es = "es",
  tl = "tl-ph",
  zh = "zh",
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

  // load the plugin for localized formats https://day.js.org/docs/en/plugin/localized-format
  const localizedFormat: PluginFunc<unknown> = require("dayjs/plugin/localizedFormat")
  dayjs.extend(localizedFormat)

  // load the locale
  if (prefix !== LanguagePrefix.English) {
    require(`dayjs/locale/${dayJsLocales[prefix]}`)
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
export const getCurrentLanguage = (path?: string | undefined): LanguagePrefix => {
  return getRoutePrefix(path || window.location.pathname) || LanguagePrefix.English
}

/**
 * Get an SF.gov url given the DAHLIA language prefix using the sf.gov node suffix
 *
 */
export const getSfGovUrl = (enLink: string, node?: number, path?: string) => {
  if (!SFGOV_LINKS.includes(enLink) || enLink.includes("pdf")) return enLink
  switch (getCurrentLanguage(path || window.location.pathname)) {
    case LanguagePrefix.Spanish:
      return `https://sf.gov/es/node/${node}`
    case LanguagePrefix.Tagalog:
      return `https://sf.gov/fil/node/${node}`
    case LanguagePrefix.Chinese:
      return `https://sf.gov/zh-hant/node/${node}`
    default:
      return enLink
  }
}

/**
 * Get a renderable version of a translated string with e.g. a link in it as an alternative to using <Markdown />
 */
export function renderMarkup(translatedString: string, allowedTags?: string) {
  return (
    <Markdown options={{ forceBlock: true, namedCodesToUnicode: { "#39": "\u0027" } }}>
      {stripMostTags(translatedString, allowedTags)}
    </Markdown>
  )
}

export function renderInlineMarkup(translatedString: string, allowedTags?: string) {
  return (
    <Markdown options={{ namedCodesToUnicode: { "#39": "\u0027" } }}>
      {stripMostTags(translatedString, allowedTags)}
    </Markdown>
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

// Get the translated custom listing
export function getCustomListingType(type: string | undefined): string {
  switch (type) {
    case CUSTOM_LISTING_TYPES.EDUCATOR_ONE:
      return t("listings.customListingType.educator")
    default:
      return undefined
  }
}

/**
 * If no translation exists for current key, return default salesforce value
 */
export function defaultIfNotTranslated(
  key: string,
  value: string,
  translationInterpolations?: TranslationInterpolations
): string {
  let translatedKey

  if (translationInterpolations) {
    translatedKey = t(key, translationInterpolations)
  }

  if (!translationInterpolations) {
    translatedKey = t(key)
  }
  return translatedKey === key ? value : translatedKey
}

// TODO: rename to specify this formats date only, not time-of-day
/**
 * Localize a given date for the current language.
 *
 * @param date {string} - date to format
 * @param format {string} - format string. see https://day.js.org/docs/en/display/format#list-of-localized-formats
 * @returns {string} localized date
 */
export function localizedFormat(date: string, format: string): string {
  const lang = getCurrentLanguage(window.location.pathname)

  return dayjs(date).locale(dayJsLocales[lang]).format(format)
}

// Time zone is assumed to be Pacific
export const formatTimeOfDay = (time: string) => {
  const formattedTime = dayjs(time).format("h:mm")
  const hour = Number(dayjs(time).format("H"))
  const suffix = hour >= 12 ? "PM" : "AM"
  return `${formattedTime} ${suffix}`
}

/**
 * Get the current language prefix as a capitalized string, or default to the english prefix if there is no explicit prefix in
 * the path.
 * @returns {string} - language code: ES, ZH, TL, EN
 */
export const getPageLanguageCode = (): string => {
  const languageInRoute = getCurrentLanguage()
  const languageConfig = LANGUAGE_CONFIGS[languageInRoute]
  return RailsTranslationLanguage[languageConfig?.prefix.toUpperCase()]
}

/**
 * Get the translated string for a given field name from the translations object.
 * @param originalValue {string} - original value of the field
 * @param fieldName {string} - field name to get the translation for in Saleforce notation: Credit_Rating__c
 * @param translations {[key: string]: RailsTranslation} - translations object for the listing
 * @returns {string} - translated string for current language or original value if no translation exists
 */
export const getTranslatedString = (
  originalValue: string,
  fieldName: string,
  translations: RailsTranslations
) => {
  const languageCode = getPageLanguageCode()
  if (!languageCode) {
    return originalValue
  }
  const isTranslationsEmpty = !translations || Object.keys(translations).length === 0
  if (isTranslationsEmpty) {
    return originalValue
  }
  const translatedValue = translations[fieldName]?.[languageCode] as string
  return translatedValue || originalValue
}
