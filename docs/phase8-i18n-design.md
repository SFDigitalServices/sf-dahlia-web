# Phase 8 — Translation rearchitecture design doc

**Status:** proposed (awaiting sign-off before implementation)
**Author:** Phase 8 kickoff
**Supersedes the translation layer described in:** `docs/uic-migration-plan.md` Phase 8

## 1. Problem & goal

The vendored node-polyglot translation layer is the last SSR blocker remaining after the
ui-components vendoring + Tailwind v4 work (Phases 0–7.5).

- `app/javascript/components/uic/translator.ts` keeps a **module-level global mutable singleton**:
  `(global as any).Translator` wrapping a single `node-polyglot` instance, mutated at bootstrap by
  `addTranslation()` from `util/languageUtil.tsx`. Shared mutable state with no per-request locale is
  hostile to server-side rendering under TanStack Start — this is the core blocker.
- `locale()` (translator.ts:35) is **hardcoded to `"en"`**. 4-language support (en/es/zh/tl) only
  works because polyglot phrases are swapped wholesale per navigation. `locale()` is consumed only for
  English ordinal suffixes today.
- `node-polyglot` is ~2 years stale, promoted to a direct dep only to keep this alive.

**Goal:** replace the polyglot backend with `i18next` + `react-i18next`, keep `t()` as a stable
façade so call sites don't churn, and make the active instance **request-scoped via React context**
so SSR becomes possible.

**Library choice:** `i18next` + `react-i18next`. Rationale: maintained, SSR-native (supports
per-request `i18next` instances via `createInstance()` / `I18nextProvider`), consumes the existing
nested JSON bundles directly as `resources`, and its interpolation/plural behavior can be configured
to match the existing bundles without rewriting them. `i18next-scanner` is already a devDependency,
so the tooling family is partially present.

## 2. Verified scope (numbers re-confirmed this session)

| Fact | Value |
|---|---|
| `t(...)` call sites | 1,883 (1,556 excl. tests) |
| Files importing `t` | 187 (143 excl. tests) |
| `%{var}` interpolation occurrences in en.json | **263** |
| Plural keys using polyglot `\|\|\|\|` smart_count | **11** |
| `getTranslationWithArguments` production call sites | 3 (`index.ts` re-export, `getTranslationWithArguments.ts`, `StandardTable.tsx`) |

Bundles: `app/assets/json/translations/react/{en,es,zh,tl}.json`, lazy-loaded via `import()` in
`LANGUAGE_CONFIGS` (languageUtil.tsx). Rails translation-sync pipeline (`bin/git-sync-translations`)
writes these — **do not rewrite the bundle format** if avoidable, to keep that pipeline untouched.

## 3. The load-bearing decisions

### 3.1 Façade signature — must accept polyglot's overloaded second argument

This is the single most important compatibility constraint, and it is **broader than the handoff
captured.** Call sites pass the second argument in three shapes:

1. **Omitted:** `t("a.b.c")`
2. **Interpolation object:** `t("key", { income: "...", per: "..." })` — the common case (263 vars).
3. **A bare number:** `t("listings.forHouseholdSize", 5)` — polyglot treats a numeric second arg as
   `smart_count`. **All but one of the 11 plural keys are invoked this way.** Confirmed sites:
   - `DirectoryHelpers.tsx:570,574` (`forHouseholdSize`, `includingChildren`)
   - `ListingDetailsPreferences.tsx:116` (`upToUnits`)
   - `ListingDetailsEligibility.tsx:84,86` (`occupancyDescriptionAllSro`)
   - `ListingDetailsLotteryPreferences.tsx:51,53`, `…PreferencesEducator.tsx:40,44,47,52`,
     `…LotteryResultsRow.tsx:85,92` (`upToXUnitsAvailable`, `numberApplicantsQualifiedForPreference[.veteran|.nonVeteran]`)
   - `ListingDetailsWaitlist.tsx:22` (`availableUnitsAndWaitlistDescription`)
   - `housing-counselors.tsx:205` (`findACounselor.filter.results`)

   The one object-style smart_count call is `ListingDetailsPricingTable.tsx:291`
   (`t("listings.habitat.incomeRange", { smart_count: i, … })`) — note `habitat.incomeRange` has
   **no `\|\|\|\|` delimiter**; there `smart_count` is used purely as an interpolation variable
   (`%{smart_count}`), not for pluralization.

**i18next does not accept a bare number** and uses `count` (not `smart_count`) for plural selection.
The façade must normalize:

```ts
type TOptions = number | Record<string, unknown> | undefined

const t = (phrase: string, options?: TOptions): string => {
  const i18n = /* active instance (see 3.4) */
  // NOTE: never forward `count` to i18next.t — that triggers i18next's own plural
  // suffix resolution (key_other), which our bundles do not use and which would
  // miss for single-form languages (zh). Plurals are chosen in the façade (3.3).
  if (typeof options === "number") {
    // polyglot bare-number === smart_count: interpolate %{smart_count}, then split.
    const raw = i18n.t(phrase, { smart_count: options })
    return choosePolyglotPlural(raw, options)
  }
  if (options && typeof options.smart_count === "number") {
    const raw = i18n.t(phrase, options) // smart_count used purely as interp var
    return choosePolyglotPlural(raw, options.smart_count)
  }
  return i18n.t(phrase, options)
}
```

This keeps every existing call site unchanged. See §3.3 for `choosePolyglotPlural`.

### 3.2 Interpolation syntax — override, don't transform

Bundles use polyglot `%{var}` (263 occurrences). i18next defaults to `{{var}}`. **Decision: override
i18next's interpolation delimiters** rather than build-time rewriting the JSON:

```ts
interpolation: {
  prefix: "%{",
  suffix: "}",
  escapeValue: false, // strings are rendered through markdown-to-jsx / React; polyglot did not HTML-escape
}
```

Rationale: zero bundle churn, keeps `bin/git-sync-translations` and the Rails side untouched, and
avoids a second source of truth. `escapeValue: false` matches polyglot's non-escaping behavior — and
several phrases embed HTML (`<span className='eligibility-subtext'>%{smart_count}</span>`) that is
later fed to `renderInlineMarkup` / `markdown-to-jsx`; escaping would break them.

### 3.3 Pluralization — replicate polyglot in the façade; do NOT use i18next plurals

**Revised after verifying the bundles.** The `||||` delimiter counts are inconsistent across
languages:

| Bundle | `\|\|\|\|` keys |
|---|---|
| en | 11 |
| es | 12 |
| zh | **0** |
| tl | 3 |

This rules out the i18next-native `_one`/`_other` + `count` approach: zh stores these keys as a
**single string with no plural variant**, so passing `count` would make i18next resolve `key_other`,
miss, and return the bare key. The en/es/tl mismatches (11/12/3) have the same hazard wherever a key
is pluralized in one bundle but single in another.

**What polyglot actually does today** (and therefore the behavior we must preserve): the polyglot
instance is constructed with **no locale**, and `locale()` is hardcoded `"en"` — so *every* display
language uses the **English plural rule** (`n === 1 → first form, else → second form`), splitting on
`||||`. Single-form strings (all of zh, most of tl) are returned verbatim with `%{smart_count}`
interpolated. Tagalog/Spanish plurals are already selected by English count logic in production.

So: **keep the bundles untouched, do not use i18next's plural system, and select the form in the
façade** — i18next interpolates the full string (both halves), then the façade splits and picks:

```ts
// Mirrors node-polyglot's effective behavior in this app (locale defaults to "en").
const choosePolyglotPlural = (text: string, count: number): string => {
  if (!text.includes("||||")) return text
  const [one, other] = text.split("||||")
  return (count === 1 ? one : other).trim()
}
```

Notes:
- Because i18next interpolates *before* the split, `%{smart_count}` (and any other vars) land in
  both halves correctly; the chosen half is already interpolated.
- The façade never forwards `count` to `i18next.t` (see §3.1), so i18next's own plural resolver is
  never engaged — eliminating the cross-bundle category-mismatch risk entirely.
- No `_one`/`_other` transform, no bundle rewrite. Zero churn, consistent with §3.2.
- Faithfully reproduces a known quirk: non-English languages currently pluralize by English rules.
  Fixing that (real per-locale CLDR plurals) is deferred — see §8.

**Verified:** delimiter present in en/es/tl, absent in zh (single-form) — the façade approach handles
all four without per-bundle special-casing.

### 3.4 Request-scoping — the actual SSR unblock

Replace the global mutable polyglot singleton with an i18next instance created via
`i18next.createInstance()` and held behind a small **module-scoped "active instance" ref**.

- **Client (today, react-on-rails):** `loadTranslations()` creates one instance, initialized to the
  language derived from the URL (`getCurrentLanguage`), and sets the ref. Functionally equivalent to
  today's single-locale-per-page-load model.
- **Server (TanStack Start, future):** call `createInstance()` per request, init with the request's
  locale + resources, set the ref for the duration of that single render pass. No shared *mutable
  phrases* state across requests.

The façade `t()` reads the active instance via the ref. Why a ref and not React context/hooks:

- **(A) Context-only (hooks):** `t` becomes `useTranslation()` everywhere. **Rejected for Phase 8** —
  churns ~187 files and breaks the ~30 non-component call sites (utils, helpers like
  `languageUtil.tsx`, `getReservedCommunityType`) that call `t()` outside React.
- **(B) Module-scoped active-instance ref, instance created per `loadTranslations`/request.**
  **Chosen.** Keeps all 1,500+ synchronous `t()` calls working unchanged. The *instance* is
  request-created (not module-constructed-and-mutated), so the SSR blocker — shared mutable phrases —
  is gone.

**Scope note (refined during implementation):** Phase 8 does **not** add `react-i18next` or an
`<I18nextProvider>`. Those exist only to feed the `useTranslation` hook, which we are deferring
(§8 item 3) — adding them now would mean wrapping all 23 react-on-rails entrypoints (no shared
wrapper exists) for zero current consumers. The ref is set directly in `loadTranslations`. When the
hook migration happens, the provider is added alongside it. If TanStack Start later needs *concurrent*
per-request isolation on the server, the ref is replaced by `AsyncLocalStorage` (§8 item 4) — not
needed for the current single-render SSR path.

### 3.5 Missing-key behavior — `t(key) === key` contract

`defaultIfNotTranslated` and `getTranslatedString` (languageUtil.tsx) depend on `t(key)` returning
**the key unchanged** when the phrase is missing (polyglot's default). i18next must be configured to
match:

```ts
{
  returnNull: false,
  returnEmptyString: false,
  parseMissingKeyHandler: (key) => key, // return the key itself, like polyglot
  // do NOT set a `fallbackLng` that would substitute a different string for these helpers
}
```

Verify with a unit test on `defaultIfNotTranslated` against a deliberately-absent key.

### 3.6 dayjs locale wiring → into the provider

`loadTranslations()` currently also `dayjs.extend(localizedFormat)` and
`require('dayjs/locale/<code>')` per language (languageUtil.tsx:96–103). Fold this into the provider's
init path so locale data loads alongside the i18next instance for the active language. `dayJsLocales`
mapping and `localizedFormat()` / `formatTimeOfDay()` stay as-is; only *where* the locale is loaded
moves.

### 3.7 `locale()` and `getTranslationWithArguments`

- `locale()` — replace the hardcoded `"en"` with the active instance's language. Only consumer is
  English ordinal suffixes today; returning the real language is strictly more correct. Keep the
  export for API stability.
- `getTranslationWithArguments` (3 sites) — unchanged public behavior; internally still calls the
  façade `t(key, argsObject)`. No edit needed beyond confirming it imports the new façade.

## 4. Bootstrap changes

- `packs/react_application.tsx:40` — `loadTranslations(currentLanguage).then(register)` stays, but
  `loadTranslations` now (a) loads bundles, (b) runs the plural transform, (c) creates/initializes the
  i18next instance + sets the active-instance ref + loads dayjs locale, instead of mutating the
  polyglot global. The `deferReactOnRailsAutoRender` race-guard remains relevant — keep it.
- `__tests__/setupTests.ts:120` — already calls `loadTranslations(English)` for real (tests do **not**
  mock translations; they assert real English copy). The new `loadTranslations` must remain awaitable
  and leave `t()` synchronously usable afterward. This is the main automated regression guard for the
  façade + interpolation; plural + multi-language still need the manual smoke pass.

## 5. Verification plan

Jest uses the real English bundle, so unit tests catch façade/interpolation/missing-key regressions
but **not** locale switching or non-English plurals. Required passes:

1. **Unit:** add/extend tests for (a) `t(key, number)` plural selection, (b) `%{var}` interpolation,
   (c) `t(missingKey) === missingKey`, (d) `getTranslationWithArguments` shim.
2. **Manual smoke, all 4 languages (en/es/zh/tl)** via `agent-browser` against `localhost:3000`
   (Rails) + webpack dev server `:3035`:
   - listings directory (`forHouseholdSize` / `includingChildren` plurals in subheader)
   - listing detail: pricing tables, eligibility (`occupancyDescriptionAllSro` plural), HMI
   - lottery results (`numberApplicantsQualifiedForPreference*`, `upToXUnitsAvailable` plurals)
   - waitlist aside (`availableUnitsAndWaitlistDescription`)
   - housing counselors filter (`findACounselor.filter.results`)
   - application form, account pages
   - language-nav switching (the wholesale-swap path)
3. **dayjs:** confirm localized dates/times render per-language on listing detail + applications.

Reminder: webpack **config** changes require a dev-server restart (it caches required modules).

## 6. Out of scope for Phase 8

Phase 8 is the minimal SSR-unblocking swap. The bundle-format migration, hook migration,
per-locale plurals, and concurrent-server scoping are all deferred — see §8 for the full list and
rationale. The one item with no follow-up planned: `renderMarkup` / `renderInlineMarkup`
(markdown-to-jsx interplay) stay exactly as they are.

## 7. Implementation order (after sign-off)

1. Add `i18next` dep (already present at 25.8.0); keep `node-polyglot` until cutover green.
   No `react-i18next` (see §3.4 scope note).
2. Build the new backend behind `translator.ts` (façade + active-instance ref) — no call-site edits.
3. Rework `loadTranslations` (bundle load → `createInstance`/init+`addResourceBundle` → dayjs locale
   → set active ref). No bundle transform — `||||` strings stay as-is and are split in the façade
   (§3.3).
4. Unit tests (§5.1); run full jest.
5. Manual 4-language smoke (§5.2–5.3).
6. Remove `node-polyglot` dep + the `(global as any).Translator` shim; update the migration plan.

## 9. Implementation notes (as built)

Status: **steps 1–4 and 6 complete; step 5 (manual 4-language smoke) pending a running dev env.**

- **Files changed:**
  - `app/javascript/components/uic/translator.ts` — rewritten as the i18next-backed façade
    (`t`, `locale`, `addTranslation` compat shim, new `createTranslationInstance` /
    `setActiveTranslationInstance`, module-scoped active-instance ref, `choosePolyglotPlural`).
  - `app/javascript/util/languageUtil.tsx` — `loadTranslations` now builds an instance with
    `{ en, <target> }` resources (fallbackLng `en`) and sets it active; dayjs wiring unchanged.
  - `app/javascript/components/uic/index.ts` — barrel re-exports the new functions + `TranslationBundle`.
  - `app/javascript/__tests__/components/uic/translator.test.ts` — 14 façade unit tests.
  - `package.json` — removed `node-polyglot`; added `i18next` as a **direct** dependency.

- **i18next version is pinned to exact `26.3.1` (no `^`).** History/caution: the `25.9.x–25.10.x`
  line printed a one-time promotional `console.info` (the Locize banner) on `init()`, and this repo's
  `jest-fail-on-console` turns any test-time console call into a failure — that range broke the entire
  jest suite (verified: 25.10.10 failed all 136 suites). **`26.3.1` does not emit the banner** (full
  suite green). The exact pin is kept deliberately so a future patch bump can't silently reintroduce a
  console call; if bumping, re-run the full jest suite and, if a banner returns, silence it (option in
  `init`) or mock it in `setupTests`.

- **No `react-i18next` / `<I18nextProvider>`** was added — see §3.4 scope note; folded into the
  deferred hook migration (§8 item 3).

- **Verification done:** `tsc --noEmit` clean; eslint clean on changed files; full jest
  **136 suites / 849 tests** pass (835 prior + 14 new), all snapshots unchanged — confirming
  interpolation and plural output are byte-identical to the polyglot implementation for English.
  Jest exercises the real English bundle only; the **4-language smoke (§5.2) is the remaining gate.**

## 8. Deferred work / candidate follow-ups (explicitly NOT in Phase 8)

Phase 8 deliberately minimizes churn: keep `t()`, keep the bundle format, keep English plural rules.
These are the things we are choosing to defer, captured so the next phase has a starting list. None
of them block SSR.

1. **Batch-migrate the bundles to i18next-native syntax.** Mechanically rewrite `%{var}` → `{{var}}`
   (263 occurrences) and `a |||| b` → `key_one`/`key_other` siblings across all four bundles, drop the
   façade's interpolation override (§3.2) and `choosePolyglotPlural` (§3.3), and let i18next own
   interpolation + pluralization. **Coupled requirement:** update or retire the Rails translation-sync
   pipeline (`bin/git-sync-translations`) and the upstream Rails locale format so re-syncs don't
   reintroduce `%{}`/`||||`. This is the "do it properly" cleanup; kept out of Phase 8 because it
   touches the cross-repo pipeline and all four bundles at once.

2. **Real per-locale pluralization.** Today (and after Phase 8, by design) every language uses the
   **English** plural rule, and zh/tl carry incomplete plural data (zh 0, tl 3 of 11). Adopting
   i18next's CLDR plural categories (item 1) would let zh collapse correctly and tl/es use their own
   rules — but requires translators to supply the missing plural forms. Product/loc decision, not a
   pure code change.

3. **Move call sites to the `useTranslation` hook.** Replace the module-scoped active-instance ref
   (§3.4) with idiomatic `const { t } = useTranslation()` in components. Removes the last piece of
   non-context indirection and is the cleanest fit for concurrent SSR — but churns ~187 files and
   still needs a non-hook escape hatch for the ~30 util/helper call sites (`languageUtil.tsx`,
   `getReservedCommunityType`, etc.). High churn, low urgency.

4. **`AsyncLocalStorage`-scoped instance on the server.** Only needed if/when TanStack Start SSR does
   *concurrent* per-request rendering. The §3.4 ref handles the current single-render-pass path; swap
   it for `AsyncLocalStorage` (or pass the instance explicitly) when concurrency arrives.

5. **Lazy / split bundle loading.** Bundles are loaded wholesale per language. Once on i18next, its
   backend plugins (`i18next-http-backend` / namespaces) could load per-route namespaces to trim the
   initial payload. Pure optimization.

6. **Type-safe keys.** With i18next + `i18next-scanner` (already a devDep) we could generate a key
   union for compile-time checking of `t()` keys, catching the "missing key returns the key string"
   failures (§3.5) at build time instead of runtime.
</content>
</invoke>
