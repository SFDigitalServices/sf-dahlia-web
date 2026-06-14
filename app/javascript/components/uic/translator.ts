// i18n façade over i18next (Phase 8 — replaces the vendored node-polyglot layer).
// See docs/phase8-i18n-design.md. The public surface (`t`, `addTranslation`, `locale`)
// is kept stable so the ~1,880 call sites and `getTranslationWithArguments` are untouched.
import { createInstance, type i18n as I18nInstance, type Resource } from "i18next"

export type TranslationBundle = Record<string, unknown>

// Module-scoped "active instance" ref (design §3.4). The façade reads this instead
// of a global mutable polyglot singleton; the instance itself is created per
// loadTranslations()/request, which is what unblocks SSR.
let activeInstance: I18nInstance | null = null

// Shared init options. Notable choices (design §3.2, §3.3, §3.5):
// - keySeparator/nsSeparator false: bundles are flat objects keyed by dotted strings
//   ("listings.forHouseholdSize"), so the whole string is one literal key.
// - interpolation %{ } with escapeValue false: matches polyglot's %{var} tokens and its
//   non-escaping behavior (several phrases embed <span> HTML for markdown-to-jsx).
// - parseMissingKeyHandler returns the key itself, preserving polyglot's t(key)===key
//   contract that defaultIfNotTranslated/getTranslatedString rely on.
const BASE_OPTIONS = {
  fallbackLng: "en",
  keySeparator: false as const,
  nsSeparator: false as const,
  returnNull: false,
  returnEmptyString: false,
  interpolation: { prefix: "%{", suffix: "}", escapeValue: false },
  parseMissingKeyHandler: (key: string) => key,
}

// Unwrap a webpack JSON `import()` namespace (`{ default: {...} }`) or accept a plain object.
const unwrapBundle = (phrases: TranslationBundle): TranslationBundle =>
  (phrases as { default?: TranslationBundle })?.default ?? phrases

/**
 * Create (but do not register) a translation instance for a given language with the
 * provided resources. Used by loadTranslations and available for SSR (one per request).
 * `resources` is keyed by language code; each value is the flat phrase bundle.
 */
export const createTranslationInstance = (
  lng: string,
  resources: Record<string, TranslationBundle>
): I18nInstance => {
  const instance = createInstance()
  const i18nResources: Resource = Object.fromEntries(
    Object.entries(resources).map(([code, bundle]) => [code, { translation: unwrapBundle(bundle) }])
  )
  // init is synchronous here: no async backend, resources supplied inline.
  void instance.init({ ...BASE_OPTIONS, lng, resources: i18nResources })
  return instance
}

/** Set the active instance the façade `t()` reads from. */
export const setActiveTranslationInstance = (instance: I18nInstance): void => {
  activeInstance = instance
}

/**
 * Backwards-compatible shim for the old polyglot `addTranslation`. Merges phrases into
 * the active instance (creating an English instance on first call), replicating
 * polyglot's "extend" merge. New code should prefer createTranslationInstance +
 * setActiveTranslationInstance via loadTranslations.
 */
export const addTranslation = (phrases: TranslationBundle, reset = false): void => {
  const bundle = unwrapBundle(phrases)
  if (!activeInstance || reset) {
    activeInstance = createTranslationInstance("en", { en: bundle })
    return
  }
  activeInstance.addResourceBundle(
    activeInstance.language,
    "translation",
    bundle,
    true /* deep */,
    true /* overwrite */
  )
}

// Replicates node-polyglot's effective plural behavior in this app: the instance had no
// locale and locale() was hardcoded "en", so every language used the English rule
// (n === 1 -> first form, else second), splitting on "||||". Single-form strings (all of
// zh, most of tl) have no delimiter and pass through unchanged. (design §3.3)
const choosePolyglotPlural = (text: string, count: number): string => {
  if (!text.includes("||||")) return text
  const [one, other] = text.split("||||")
  return (count === 1 ? one : other).trim()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TranslateOptions = number | Record<string, any> | undefined

/**
 * Translation façade. Accepts polyglot's overloaded second argument:
 *  - omitted: t("a.b")
 *  - interpolation object: t("key", { var: "x" })
 *  - bare number (polyglot smart_count): t("key", 5)
 *
 * Plural selection happens here (choosePolyglotPlural); `count` is intentionally never
 * forwarded to i18next.t — doing so would trigger i18next's own plural-suffix resolution
 * (key_other), which our bundles don't use and which would miss for single-form languages.
 */
const t = (phrase: string, options?: TranslateOptions): string => {
  if (!activeInstance) {
    return "{{ Missing Translation Phrases }}"
  }
  // Our config (no returnObjects, returnNull/returnEmptyString false) always yields a
  // string; i18next's t() return type is broader, so coerce at this boundary.
  const translate = (key: string, opts?: Record<string, unknown>): string =>
    activeInstance.t(key, opts)

  if (typeof options === "number") {
    return choosePolyglotPlural(translate(phrase, { smart_count: options }), options)
  }
  if (options && typeof options.smart_count === "number") {
    return choosePolyglotPlural(translate(phrase, options), options.smart_count)
  }
  return translate(phrase, options)
}

// Active display language. Previously hardcoded to "en"; now reflects the real instance
// language (only consumer is English ordinal suffixes). Falls back to "en" pre-init.
const locale = (): string => activeInstance?.language ?? "en"

export { t as default, t, locale }
