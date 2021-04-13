import { LangItem, t } from "@sf-digital-services/ui-components"

type PhraseBundle = Record<string, unknown>
export interface LangConfig {
  prefix: string
  isDefault: boolean
  getLabel: () => string
  load: () => Promise<Record<string, unknown>>
}

export const LANGUAGE_CONFIGS: { [key: string]: LangConfig } = {
  en: {
    prefix: "en",
    isDefault: true,
    getLabel: () => t("languages.en"),
    load: async () => (await import("../../assets/json/translations/locale-en.json")).en,
  },
  es: {
    prefix: "es",
    isDefault: false,
    getLabel: () => t("languages.es"),
    load: async () => (await import("../../assets/json/translations/locale-es.json")).es,
  },
  tl: {
    prefix: "tl",
    isDefault: false,
    getLabel: () => t("languages.tl"),
    load: async () => (await import("../../assets/json/translations/locale-tl.json")).tl,
  },
  zh: {
    prefix: "zh",
    isDefault: false,
    getLabel: () => t("languages.zh"),
    load: async () => (await import("../../assets/json/translations/locale-zh.json")).zh,
  },
}

export const getLanguageOptions = (): LangItem[] =>
  Object.values(LANGUAGE_CONFIGS).map((item) => ({
    prefix: item.isDefault ? "" : item.prefix,
    label: item.getLabel(),
  }))

/**
 * Get the language prefix from the url. Or null if no prefix is on the path
 */
export const getCurrentLanguagePrefix = (): string | null => {
  const path = window.location.pathname

  const langConfig = Object.values(LANGUAGE_CONFIGS).find(
    (languageConfig) =>
      path === `/${languageConfig.prefix}` || path.startsWith(`/${languageConfig.prefix}/`)
  )

  return langConfig?.prefix
}

/**
 * Get the language prefix from the url. Or null if no prefix is on the path
 */
export const getPathWithoutLanguagePrefix = (): string => {
  const path = window.location.pathname
  const prefix = getCurrentLanguagePrefix()
  if (!prefix) return path

  const pathWithoutLeadingSlash = path.replace("/", "")
  const langConfig = Object.values(LANGUAGE_CONFIGS).find((config) => config.prefix === prefix)
  return `/${pathWithoutLeadingSlash.replace(langConfig.prefix, "")}`
}

export const getCurrentLanguage = (): string =>
  getCurrentLanguagePrefix() || LANGUAGE_CONFIGS.en.prefix

export const loadTranslations = async (): Promise<{ [key: string]: PhraseBundle }> => {
  const phrases: { [key: string]: PhraseBundle } = {}

  for (const key in LANGUAGE_CONFIGS) {
    const config = LANGUAGE_CONFIGS[key]
    phrases[key] = await config.load()
  }

  return phrases
}
