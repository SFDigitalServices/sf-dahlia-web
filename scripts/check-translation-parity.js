#!/usr/bin/env node
/*
 * Verifies that every key in the English translation file exists in each of the
 * other locale files, and that the translated values themselves are well formed.
 *
 * Why this matters: loadTranslations() in app/javascript/util/languageUtil.tsx
 * loads en.json first and then overlays the target locale on top of it. A key
 * that is missing from es.json therefore renders the *English* string silently —
 * no raw key, no empty box, no console warning. Nothing in the app surfaces it,
 * and visual regression tooling can't either, because the English fallback is
 * simply what the page has always looked like.
 *
 * Keys that are intentionally identical across locales (proper nouns, acronyms)
 * do not need listing here — this checks key presence, not value difference.
 * Keys that are intentionally English-only go in known-translation-gaps.json.
 *
 * The value checks (CONTENT_CHECKS below) are ported from the Translation-Checker
 * tool devs have been running by hand — https://github.com/chadbrokaw/Translation-Checker
 * — which validates XLIFF pasted into a browser. The rules are the valuable part:
 * they catch the ways strings get mangled in the Phrase round trip. Two of them
 * are deliberately adapted rather than copied; see the notes on each.
 *
 * Usage:
 *   node scripts/check-translation-parity.js
 *   node scripts/check-translation-parity.js --json   # machine-readable output
 */

const fs = require("fs")
const path = require("path")

const TRANSLATIONS_DIR = path.join(__dirname, "..", "app", "assets", "json", "translations", "react")
const GAPS_FILE = path.join(__dirname, "known-translation-gaps.json")
const BASE_LOCALE = "en"

const flatten = (obj, prefix = "") =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    const name = prefix ? `${prefix}.${key}` : key
    return value && typeof value === "object" && !Array.isArray(value)
      ? { ...acc, ...flatten(value, name) }
      : { ...acc, [name]: value }
  }, {})

const readLocale = (locale) => {
  // Locale names only ever come from readdirSync on TRANSLATIONS_DIR or from
  // BASE_LOCALE, so they can't contain traversal sequences. Validated anyway so
  // that stays true if a caller is ever added, and to keep SAST scanners quiet.
  if (!/^[a-z]{2}(-[A-Za-z]{2,4})?$/.test(locale)) {
    console.error(`Refusing to read unexpected locale name: ${locale}`)
    process.exit(1)
  }
  const file = path.join(TRANSLATIONS_DIR, `${locale}.json`)
  try {
    return flatten(JSON.parse(fs.readFileSync(file, "utf8")))
  } catch (error) {
    console.error(`Could not read or parse ${file}: ${error.message}`)
    process.exit(1)
  }
}

/*
 * known-translation-gaps.json groups exempted keys under a reason, so the
 * allowlist documents itself:
 *   { "gaps": { "es": [ { "reason": "...", "keys": ["a.b"] } ] } }
 * Returns a flat Set of exempted keys per locale.
 */
const readKnownGaps = () => {
  if (!fs.existsSync(GAPS_FILE)) return {}
  try {
    const { gaps = {} } = JSON.parse(fs.readFileSync(GAPS_FILE, "utf8"))
    return Object.fromEntries(
      Object.entries(gaps).map(([locale, groups]) => [
        locale,
        new Set(groups.flatMap((group) => group.keys)),
      ])
    )
  } catch (error) {
    console.error(`Could not parse ${GAPS_FILE}: ${error.message}`)
    process.exit(1)
  }
}

const PLURAL_SEPARATOR = "||||"
// Number of plural forms each locale needs once a string is pluralized. Chinese
// uses a single form for all counts.
const EXPECTED_PLURAL_FORMS = { zh: 1 }
const DEFAULT_EXPECTED_PLURAL_FORMS = 2

const MALFORMED_BARS = [/(?<!\|)\|{1,3}(?!\|)/, /\|{5,}/]
const hasMalformedBars = (value) => MALFORMED_BARS.some((pattern) => pattern.test(value))

const variablesIn = (value) => value.match(/%\{.*?\}/g) || []

const CONTENT_CHECKS = [
  {
    id: "encoding",
    label: "encoding error (e.g. &nbsp;, &amp;)",
    // A literal "&amp;" or "nbsp;" in the JSON means the string was double-encoded
    // somewhere between Phrase and the repo.
    failed: (target) => /nbsp;/.test(target) || /&amp;/.test(target),
  },
  {
    id: "variablePrefix",
    label: "variable missing its % prefix",
    failed: (target) => /(?<!%)\{.*?\}/.test(target),
  },
  {
    id: "variableMismatch",
    label: "variables differ from en.json",
    // Compares the *set* of variable names, not the number of occurrences: a
    // pluralized translation repeats each variable once per form, so counting
    // occurrences (as the XLF tool does) false-positives on every plural.
    needsBase: true,
    failed: (target, base) => {
      const names = (value) => [...new Set(variablesIn(value))].sort().join(",")
      return names(target) !== names(base)
    },
  },
  {
    id: "pluralBars",
    label: `plural separator is not exactly four bars (${PLURAL_SEPARATOR})`,
    failed: (target) => hasMalformedBars(target),
  },
  {
    id: "pluralForms",
    label: "pluralized string has the wrong number of forms",
    // Only pluralized translations are checked, and against what the *locale*
    // needs rather than against en.json's form count. English often has one form
    // where Spanish legitimately needs two, so comparing to the base locale (as
    // the XLF tool does) flags correct translations.
    //
    // Malformed separators are skipped: already reported above, and the split
    // would produce meaningless counts.
    skip: (target) => !target.includes(PLURAL_SEPARATOR) || hasMalformedBars(target),
    failed: (target, base, locale) => {
      const expected = EXPECTED_PLURAL_FORMS[locale] ?? DEFAULT_EXPECTED_PLURAL_FORMS
      return target.split(PLURAL_SEPARATOR).filter((form) => form.trim() !== "").length !== expected
    },
  },
]

/*
 * Runs the value-level checks over one locale. Returns { [checkId]: [keys] },
 * omitting checks that found nothing.
 */
const runContentChecks = (target, base, locale) => {
  const problems = {}

  for (const key of Object.keys(target)) {
    const value = target[key]
    if (typeof value !== "string" || value.trim() === "") continue
    const baseValue = base[key]

    for (const check of CONTENT_CHECKS) {
      if (check.needsBase && typeof baseValue !== "string") continue
      if (check.skip && check.skip(value, baseValue, locale)) continue
      if (check.failed(value, baseValue, locale)) {
        problems[check.id] = problems[check.id] || []
        problems[check.id].push(key)
      }
    }
  }

  return problems
}

const main = () => {
  const asJson = process.argv.includes("--json")

  const locales = fs
    .readdirSync(TRANSLATIONS_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => path.basename(file, ".json"))

  if (!locales.includes(BASE_LOCALE)) {
    console.error(`No ${BASE_LOCALE}.json found in ${TRANSLATIONS_DIR}`)
    process.exit(1)
  }

  const base = readLocale(BASE_LOCALE)
  const baseKeys = Object.keys(base).sort()
  const knownGaps = readKnownGaps()

  const results = {}
  let failed = false
  let totalAllowed = 0

  for (const locale of locales.filter((l) => l !== BASE_LOCALE)) {
    const target = readLocale(locale)
    const allowed = knownGaps[locale] || new Set()

    const missing = baseKeys.filter((key) => !(key in target) && !allowed.has(key))
    const allowedStillMissing = baseKeys.filter((key) => !(key in target) && allowed.has(key))
    // A key that is present but empty renders as blank text, which is worse than
    // the English fallback — flag it alongside genuinely missing keys. Skipped
    // when en.json is itself empty for that key (e.g. an unused placeholder),
    // since mirroring an empty base value loses nothing.
    const empty = baseKeys.filter(
      (key) =>
        key in target &&
        typeof target[key] === "string" &&
        target[key].trim() === "" &&
        !(typeof base[key] === "string" && base[key].trim() === "")
    )
    const extra = Object.keys(target).filter((key) => !(key in base))
    // Two ways an allowlist entry goes stale: the key finally got translated, or
    // it was dropped from en.json entirely. Reporting both keeps the ratchet
    // tightening instead of letting dead exemptions pile up.
    const staleAllowlist = [...allowed].filter((key) => key in target)
    const orphanedAllowlist = [...allowed].filter((key) => !(key in base))

    const contentProblems = runContentChecks(target, base, locale)

    results[locale] = {
      missing,
      empty,
      extra,
      allowedStillMissing,
      staleAllowlist,
      orphanedAllowlist,
      contentProblems,
    }
    totalAllowed += allowedStillMissing.length

    if (missing.length > 0 || empty.length > 0 || Object.keys(contentProblems).length > 0) {
      failed = true
    }
  }

  if (asJson) {
    console.log(JSON.stringify({ baseKeyCount: baseKeys.length, results }, null, 2))
    process.exit(failed ? 1 : 0)
  }

  console.log(`Base locale ${BASE_LOCALE}.json: ${baseKeys.length} keys\n`)

  for (const [locale, result] of Object.entries(results)) {
    const { missing, empty, extra, allowedStillMissing, staleAllowlist, orphanedAllowlist } = result
    const { contentProblems } = result
    const status =
      missing.length === 0 && empty.length === 0 && Object.keys(contentProblems).length === 0
        ? "PASS"
        : "FAIL"
    console.log(`${status}  ${locale}.json`)

    if (missing.length > 0) {
      console.log(`  ${missing.length} key(s) missing (will silently render in English):`)
      missing.forEach((key) => console.log(`    - ${key}`))
    }
    if (empty.length > 0) {
      console.log(`  ${empty.length} key(s) present but empty (will render blank):`)
      empty.forEach((key) => console.log(`    - ${key}`))
    }
    for (const check of CONTENT_CHECKS) {
      const keys = contentProblems[check.id]
      if (!keys) continue
      console.log(`  ${keys.length} key(s) with ${check.label}:`)
      keys.forEach((key) => console.log(`    - ${key}`))
    }
    if (extra.length > 0) {
      console.log(`  note: ${extra.length} key(s) not present in ${BASE_LOCALE}.json (dead weight):`)
      extra.forEach((key) => console.log(`    - ${key}`))
    }
    if (staleAllowlist.length > 0) {
      console.log(
        `  note: ${staleAllowlist.length} allowlist entr(ies) now translated — remove from known-translation-gaps.json:`
      )
      staleAllowlist.forEach((key) => console.log(`    - ${key}`))
    }
    if (orphanedAllowlist.length > 0) {
      console.log(
        `  note: ${orphanedAllowlist.length} allowlist entr(ies) no longer in ${BASE_LOCALE}.json — remove from known-translation-gaps.json:`
      )
      orphanedAllowlist.forEach((key) => console.log(`    - ${key}`))
    }
    if (allowedStillMissing.length > 0) {
      console.log(`  ${allowedStillMissing.length} known gap(s) allowlisted`)
    }
    console.log("")
  }

  if (failed) {
    console.log("Translation check failed.")
    console.log(
      `Add the missing keys to the locale files, or — if a key is intentionally English-only —\n` +
        `add it to scripts/known-translation-gaps.json with a reason. Value problems (variables,\n` +
        `plural forms, encoding) need fixing in Phrase so the fix survives the next sync.`
    )
    process.exit(1)
  }

  console.log("Translation check passed.")
  if (totalAllowed > 0) {
    console.log(
      `${totalAllowed} allowlisted gap(s) remain in scripts/known-translation-gaps.json — these are\n` +
        `untranslated strings rendering in English today, not resolved issues.`
    )
  }
}

main()
