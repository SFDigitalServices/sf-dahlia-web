# Migrating off `@bloom-housing/ui-components`

`@bloom-housing/ui-components` (v12.7.x) is no longer actively maintained and pins very old
dependencies (Tailwind v2, sass, AgGrid 26, react-beautiful-dnd, react-text-mask, react-media,
node-polyglot, etc.). We still use ~70 of its exports, so the plan is to **vendor the components
we actually use** into `app/javascript/components/uic/`, converting their SCSS to plain CSS with
custom properties (the package already uses `--bloom-*` CSS vars for nearly all values), and to
drop the package — and eventually the sass toolchain — entirely.

## Status

Branch: `jdunning/poc/vendor-uic`.

| Phase | State |
|---|---|
| 0 — Scaffold | ✅ done |
| 1 — Leaf utilities | ✅ done |
| 2 — Forms | ✅ done |
| 3 — Layout & listings | ✅ done |
| 4 — Special cases | ✅ done |
| 5 — Global styles & package removal | ✅ done |

**`@bloom-housing/ui-components` has been uninstalled.** Everything the app
renders or builds with now lives in the repo. Full jest suite (835), eslint, and
tsc are green; a standalone sass compile of all vendored globals also succeeds.

Static verification is complete. The only outstanding item is the end-to-end
**browser smoke-test**, which is pending a webpack dev-server restart (see
[Operational notes](#operational-notes)).

Phase 5 specifics:
- The 16 global SCSS files were vendored **as-is (kept sass)** per maintainer
  choice — copied verbatim into `app/javascript/components/uic/global/` (+
  `/tokens`), with `base.scss` `@import`s repointed to `./uic/global/*`.
- The package's two build-time exports were vendored too: its Tailwind theme →
  `config/tailwind/bloomTheme.js` (consumed by the repo's `tailwind.config.js`),
  and `tailwind.tosass.js` → `config/webpack/loaders/tailwindToSass.js` (feeds the
  sass loader's `additionalData`, i.e. the `$screen-*`/`$tailwind-*` vars).
- The barrel's `export *` and the translator's `addTranslation` forwarding were
  removed.
- Three transitive deps had to be promoted to **direct** because the package was
  their only path: `node-polyglot`, `tailwindcss-rtl`, and `typesafe-actions`
  (the last is used by the auth/listing-details context reducers).
- A `resolutions` pin for `@types/react`/`@types/react-dom` (^18) was added:
  removing the package let `@bloom-housing/ui-seeds` resolve a nested
  `@types/react@19` (whose `ReactNode` includes `bigint`), which broke tsc.
- `jest.config.js` `transformIgnorePatterns` was a **malformed no-op**
  (`node_modules/?!(…)` — missing the `(?!` lookahead paren) that silently
  transformed *all* of `node_modules`. It was rewritten to a correct lookahead
  that transforms only `@bloom-housing/ui-seeds` (still-untranspiled ESM).

Remaining (separate, out-of-scope efforts): convert the repo's own SCSS —
`base.scss` still uses `@tailwind`/`@apply`/`$vars` — to drop `sass` entirely,
and upgrade off Tailwind v2.

## Operational notes

- **The running webpack dev server must be restarted after the Phase 5 install.**
  Uninstalling the package and re-running `yarn install` re-hoisted the dependency
  tree: `@bloom-housing/ui-seeds`'s nested `focus-trap-react` and `react-tabs`
  moved up to top-level `node_modules`. Both still resolve correctly, but a
  *running* `webpack-dev-server` caches the old nested module paths and throws
  `ENOENT … @bloom-housing/ui-seeds/node_modules/focus-trap-react/...` (and the
  same for `react-tabs`) in the browser until it is restarted. This is **not** a
  code issue — tsc/jest/sass are all green. The dev server is not in
  `Procfile.development`; it's started separately, so restart that process (and,
  if it persists, clear `node_modules/.cache` / `tmp/cache`).

## Key findings

- This repo **never imports AgTable/AgGrid** from the package. The `ag-grid-community` in our
  package.json is our own, newer copy.
- `StandardTable` is used only in plain, non-draggable mode (3 files in `modules/listingDetails`),
  so the `react-beautiful-dnd` code path can simply be deleted when vendoring.
- The biggest coupling is the `t()` translator (197 import sites), then `Icon` (37) and
  `Button`/`LinkButton` (~40).
- `app/javascript/components/base.scss` (lines ~78–94) imports 16 global SCSS files from the
  package (tokens, mixins, forms, tables, …). These must be ported too (Phase 5).
- Unused entirely (never port): AgTable, Dropzone, MultiSelectField, ListingMap (mapbox),
  and everything else not listed below.

## Cutover mechanism

`app/javascript/components/uic/index.ts` is the barrel and the single import surface
(`@uic`) for all former package components. **It now re-exports only vendored local
modules** — the original `export * from "@bloom-housing/ui-components"` (which let
not-yet-migrated symbols still resolve while local copies took precedence) has been
removed, and the package is uninstalled.

During the migration, all app imports of `"@bloom-housing/ui-components"` were rewritten
once to the `@uic` alias (tsconfig `paths`, webpack `resolve.alias`, jest
`moduleNameMapper`) — that wiring is still how `@uic` resolves — and the work then
proceeded symbol-by-symbol inside the barrel with no further call-site churn until the
star export could be dropped.

### Style conversion rules

These applied to the **per-component** styles (phases 1–4):

- Vendored component styles are written as `.scss` files containing **only plain,
  un-nested CSS** — no `@import`, no mixins, no `@apply`, no `$variables` — so they keep
  working in today's sass pipeline and can be renamed to `.css` when sass is removed.
- Values come from the existing `--bloom-*` custom properties, now defined by the
  vendored token files under `app/javascript/components/uic/global/tokens/`.
- Sass mixins used by a component (`filled-appearances`, `outlined-appearances`, etc.) are
  inlined and flattened into the component's stylesheet.

**The 16 global files (Phase 5) were the exception**: they were vendored *as-is, kept as
sass* (per maintainer choice), so they still use `@apply`, the shared mixins, and the
`$screen-*` / `$tailwind-*` variables the sass loader prepends. They will need this same
plain-CSS conversion if/when `sass` is dropped — but `base.scss` itself still uses
`@tailwind`/`@apply`/`$vars`, so that's a separate effort regardless.

## Component inventory (what we use)

| Area | Exports used |
|---|---|
| Core | `t`, `addTranslation`, `Icon`, `IconFillColors`, `IconTypes`, `UniversalIconType`, `Button`, `LinkButton`, `AppearanceStyleType/SizeType/BorderType`, `Heading`, `Mobile`, `Desktop`, `NavigationContext`, `GenericRouter`, `GenericRouterOptions` |
| Forms | `Field`, `FieldProps`, `Form`, `Select`, `FieldGroup`, `PhoneField`, `DOBFieldValues`, `FormCard` |
| Layout / page | `PageHeader`, `Hero`, `ActionBlock`, `ActionBlockLayout`, `SidebarBlock`, `InfoCard`, `InfoCardGrid`, `ListSection`, `ContentAccordion`, `ExpandableContent`, `ExpandableText`, `ExpandableSection`, `ProgressNav`, `OrDivider`, `Message`, `Tag`, `Description`, `MultiLineAddress`, `Contact`, `QuantityRowSection`, `EventSection` |
| Listings | `ListingDetails`, `ListingDetailItem`, `ListingCard`, `ImageCard`, `PreferencesList`, `AdditionalFees`, `ApplicationStatusType`, `StatusBarType` |
| Tables | `StandardTable`, `StackedTableRow` (type only), `CategoryTable` |
| Chrome | `SiteHeader`, `SiteFooter`, `FooterNav`, `FooterSection`, `LanguageNav`, `LangItem`, `SiteAlert`, `AlertBox`, `AlertTypes`, `Modal`, `LoadingOverlay` |
| Test-only | `resetAccordionUuid` |

## Gotchas & lessons learned

Things that bit us during phases 1–4 — worth keeping in mind for Phase 5 and any
future vendoring:

- **Type-only re-exports must use `export type`** in the barrel. Babel strips
  interfaces, so a value-style `export { SomeType }` triggers a webpack
  "export not found" warning at runtime. Use `export type { … }`.
- **Dual polyglot instances (resolved in Phase 5).** While `export *` was still
  present (phases 1–4), package-internal components called the *package's* `t`, not
  the vendored one, so the vendored `addTranslation` had to forward phrases to the
  package's `addTranslation` too — otherwise package components rendered
  `{{ Missing Translation Phrases }}`. That forwarding was removed once the star
  export went away. Watch for this class of bug any time a vendored singleton
  (translator, icon registry, etc.) coexists with a still-imported package copy.
- **CSS source-order dependencies.** Several package rules rely on stylesheet
  injection order rather than specificity. The gallery `Modal` was the worst case: the
  open modal carries both `modal__inner-with-footer` (`--modal-margin-top: bloom-s6`)
  and `image-card__gallery-modal` (`--modal-margin-top: bloom-s32`) at **equal
  specificity**, so whichever stylesheet loads last wins. The package happened to inject
  `Modal.scss` after `ImageCard.scss`; once vendored that order isn't guaranteed, the
  128px rule won, and the modal's footer (the CLOSE bar) fell below the viewport. Fixed
  with a higher-specificity `.modal.image-card__gallery-modal.modal__inner-with-footer`
  rule so it's order-independent. **When porting the global SCSS in Phase 5, watch for
  more of these** — prefer specificity over relying on import order.
- **`react-media` renders both branches when `matchMedia.matches` is true.** Tests mock
  `window.matchMedia` with `matches: true`, so the vendored `Mobile`/`Desktop` (and the
  native `ResponsiveContentList`) must reproduce the package's "render nothing outside an
  `Accordion`" behavior. The native rewrite gates its mobile-accordion branch on a
  React context provided only by `ResponsiveContentList`, and the provider sits **inside**
  the `Mobile` branch so desktop-rendered items don't also mount the mobile sub-tree when
  both media queries match. Missing this caused accordions to render 4× in tests.
- **App breakpoints differ from the package defaults.** This repo's Tailwind config sets
  `$screen-lg: 1200px` (not 1024px). When inlining `@screen lg` / `$screen-lg` into plain
  CSS, use **1200px**. (`$screen-sm`=640, `$screen-md`=768 match.)
- **`$screen-print` compiles to garbage.** The package's `@media (min-width: $screen-print)`
  resolves to `[object Object]` (the value is `{ raw: "print" }`), so the rule never
  applied in practice. The vendored copies omit it.
- **`eslint --fix` is aggressive on vendored code.** It rewrote `props.size` truthy checks
  to numeric comparisons (breaking the string union), turned `getElementById` into
  `querySelector` (losing the `HTMLElement` typing — use `querySelector<HTMLElement>`),
  and flagged faithful-copy patterns. Re-run tsc after `--fix`, and prefer targeted
  `eslint-disable` with an "avoid behavior drift" note over rewriting upstream logic.
- **The barrel override pattern tripped `import/export` (phases 0–4).** While the
  `export *` coexisted with explicit named exports that intentionally shadowed it,
  `index.ts` needed a file-level `/* eslint-disable import/export */`. That disable
  was removed in Phase 5 along with the star export.
- **Pre-existing tsc noise.** A type error in the package's nested `markdown-to-jsx` types
  is not ours; filter type-check output with `| grep -v markdown-to-jsx`.
- **Visual spot-check after every phase.** Snapshot tests catch markup drift but not
  layout regressions (the gallery footer bug passed all tests). Open the real pages.
- **Transitive-dep traps when uninstalling the package.** Several deps resolved *only*
  through `@bloom-housing/ui-components` and broke on removal: `node-polyglot`,
  `tailwindcss-rtl`, and — least obvious — `typesafe-actions` (used by the app's own
  auth and listing-details context reducers, not anything UI). After uninstalling, tsc
  and the build surface these; promote each to a direct dependency at its
  already-installed version.
- **Nested `@types/react` after the dependency tree changes.** Removing the package let
  `@bloom-housing/ui-seeds` resolve a *nested* `@types/react@19` (whose `ReactNode`
  includes `bigint`), which conflicts with the app's v18 types and breaks tsc. Fix with a
  `resolutions` pin for `@types/react`/`@types/react-dom` (^18) **and** delete the stale
  nested copy (`rm -rf node_modules/@bloom-housing/ui-seeds/node_modules/@types/react*`)
  before reinstalling — yarn won't always prune it on its own.
- **`jest.config` `transformIgnorePatterns` was a malformed no-op.** The old value,
  `node_modules/?!(@bloom-housing/ui-components)`, was missing the `(?!` lookahead paren,
  so it matched nothing and jest silently transformed *all* of `node_modules`. Removing
  it reverted jest to its default (ignore all node_modules) and broke the
  still-untranspiled `@bloom-housing/ui-seeds` ESM (`Unexpected token 'export'`). The
  correct form is `node_modules/(?!(@bloom-housing/ui-seeds)/)`.
- **Restart the dev server after the uninstall** — see [Operational notes](#operational-notes).

## Phases

### Phase 0 — Scaffold (this PR)
Create `app/javascript/components/uic/`, the `@uic` alias in tsconfig/webpack/jest, the barrel,
and rewrite all `"@bloom-housing/ui-components"` imports to `"@uic"`.

### Phase 1 — Leaf utilities (this PR)
Vendor: `translator` (`t`/`addTranslation`; keeps node-polyglot for now), `Icon` + `Icons` +
appearance types, `Button`/`LinkButton`, `Heading`, `NavigationContext`/`GenericRouter`,
`Mobile`/`Desktop` (reimplemented with `window.matchMedia`, dropping react-media).
This removes the package from ~80 % of import sites.

### Phase 2 — Forms
Vendor `Field`, `Form`, `Select`, `FieldGroup`, `FormCard`, `PhoneField`. The package's
react-hook-form v6 matches our own pin, so components port unchanged. Reimplement the phone
mask with a small `onChange` formatter to drop `react-text-mask`.

### Phase 3 — Layout & listings components ✅
Mostly mechanical copy + SCSS→CSS conversion. `ContentAccordion` was rewritten
natively (button + aria) instead of `react-accessible-accordion`, and
`ResponsiveContentList` (the desktop-list / mobile-accordion switcher behind
`ListingDetails`/`ListingDetailItem`) was likewise reimplemented natively. The
`resetAccordionUuid` export is kept as a **no-op** for call-site/test compatibility
(the native version has no global uuid counter to reset).

### Phase 4 — Special cases ✅
- **Tables** — `StandardTable`/`MinimalTable`/`StackedTable`/`CategoryTable`. The
  `draggable` branch was deleted (drops `react-beautiful-dnd` and the fontawesome grip
  icon); non-test row/cell keys use a small module-scoped counter instead of `nanoid`.
- **Overlays** — `Overlay`/`Modal`/`LoadingOverlay`, vendored as-is. They still use
  `react-focus-lock`, `react-remove-scroll`, and `react-transition-group`; these were
  promoted from transitive to **direct dependencies** in `package.json` (at the
  already-installed versions). Native `<dialog>` is still a possible later cleanup. The
  portal root is the `#__next` div in `app/views/layouts/application-react.html.slim`.
- **Cards** — `ImageCard`/`ListingCard`, plus their helpers `Tooltip`,
  `ApplicationStatus`, `LocalizedLink`, `useFallbackImage`, and the
  `StatusBarType`/`ImageItem` types. `Tooltip`'s scroll listener had an upstream bug (it
  removed a *fresh* arrow function, so it never detached); the vendored copy uses a stable
  reference — same visible behavior, no leak.
- **Alerts & misc** — `AlertBox`/`SiteAlert`/`alertTypes`, `Card`, and the
  `DOBFieldValues` type (the `DOBField` component itself — dayjs + RHF — was not vendored;
  only the type is used).
- **Chrome** — package `SiteHeader` (rendered by the app's fork when the
  `temp.webapp.newAccountLayout` flag is off), `SiteFooter`, `FooterNav`,
  `FooterSection`, `LanguageNav`. `@bloom-housing/ui-seeds` was **not** adopted as a
  replacement — the existing markup/SCSS was vendored directly to avoid behavior drift.
  The app's forked `SiteHeader` now imports the vendored `../uic/SiteHeader.scss` instead
  of the package subpath, removing the last direct package import in app code.

### Phase 5 — Global styles & removal ✅
Vendored the 16 `base.scss` global imports and removed the package. See the
[Status](#status) section for exactly what was done — note the globals were
vendored **as-is (kept sass)** rather than converted to plain CSS, which differs
from this section's original plan ("token files → `:root`; the rest → plain CSS").

Uninstalling `@bloom-housing/ui-components` also dropped its old transitive baggage
(ag-grid 26, react-beautiful-dnd, mapbox, react-map-gl, aria-autocomplete,
react-text-mask, react-accessible-accordion, react-media). `react-focus-lock`,
`react-remove-scroll`, and `react-transition-group` (promoted in Phase 4) plus
`node-polyglot`, `tailwindcss-rtl`, and `typesafe-actions` (promoted here) are now
direct dependencies and must stay.

Follow-up (separate efforts, not in this migration): convert the repo's own SCSS —
`base.scss` still uses `@tailwind`/`@apply`/`$vars` — to drop `sass` entirely
(which would also convert the as-is global files to plain CSS), and upgrade off
Tailwind v2.

## Post-vendoring roadmap

The vendoring is complete; what remains is cleanup and modernization. A survey of the
vendored code surfaced one structural fact that drives the ordering below:

> **The global SCSS files barely use "real" sass.** Their dependence is almost entirely
> Tailwind v2 directives (`@apply`, `@screen`) plus the injected `$tailwind-*` / `$screen-*`
> variables that `config/webpack/loaders/tailwindToSass.js` prepends via the sass loader's
> `additionalData`. Genuine sass features are nearly absent: `mixins.scss` is the only file
> with `@mixin`/`@use`/`math.`, and **9 of its 10 mixins are dead** (only `has-toggle` is
> still `@include`d; `filled-appearances`/`outlined-appearances`/etc. were inlined into the
> per-component `.scss` during phases 1–4). The per-component `.scss` files are already plain
> CSS by the Phase 1–4 conversion rule.

Consequence: **"drop sass" and "Tailwind v2 → v4" are effectively one project.** sass can't be
removed without resolving `@apply`/`@screen`/`$tailwind-*`, and the cleanest resolution is the
v4 migration itself (v4 is CSS-first: `@theme` tokens, no JS config, `@screen` removed, `@apply`
reworked). Doing them separately means doing the hard part twice.

Order: **Phase 6 (orphan sweep) → Phase 7 (Tailwind v4 + sass removal) → Phase 8 (translation
rearchitecture).** Translation is last because it's independent of the CSS work and carries the
most design weight (SSR + a library swap).

### Phase 6 — Orphaned-style sweep ✅ (done 2026-06-13)

Delete dead CSS so there's less to migrate in Phase 7. Each item below was confirmed by grep,
not assumed.

**What was removed** (branch `jdunning/poc/vendor-uic`):
- `base.scss`: the AG Grid import pair, the entire `.ag-theme-alpine.ag-theme-bloom` block, and
  `.data-pager*` rules; plus the orphaned Bulma `$vars` block (`$scheme-main`/`$colors`/etc.).
  `ag-grid-community` was dropped from `package.json` + `yarn.lock` (nothing in source imports it).
- `global/mixins.scss`: 9 of 10 mixins (kept only `has-toggle`); `@use "sass:math"` went with them.
- `global/tables.scss`: the deleted-in-Phase-4 draggable leftovers (`.table__draggable-cell`,
  `.table__is-dragging`) and the unused reserved-units feature (`td.reserved`, `.reserved-icon`,
  `tr.group-reserved`).
- `global/blocks.scss`: `.notice-block`, `.shadow-left`/`.md:shadow-left` + `$shadow-left-slight`,
  `.sidebar-detail-layout`.
- `global/text.scss`: `.info-group__item`.

**Verified green**: standalone sass compile of all globals (1616 → 1515 lines), `tsc --noEmit`,
full jest (835/835, 129 snapshots).

**Learnings:**
- **Grep across *every* source surface before deleting a selector**, not just `.tsx`. Classes
  reach the DOM from `.slim`/`.erb` Rails templates, from translation JSON rendered through
  `renderMarkup`, and from template-literal `className` composition (e.g. `action-block__${x}`).
  The high-confidence deletions here were the ones with zero hits across `.tsx/.ts/.slim/.rb/.erb/.json`.
- **Some "orphans" are fossils of earlier phases.** The draggable-table rules were dead because
  Phase 4 deleted that branch; the reserved-units styling (`td.reserved` et al.) had no emitter
  left. When a vendored component drops a feature, its global CSS often lingers.
- **Mind shared sass vars when deleting rules** — removing `.shadow-left` also orphaned
  `$shadow-left-slight`; removing the last `math.div` user let `@use "sass:math"` go. Re-running
  the standalone sass compile catches dangling refs immediately.
- **A standalone `sass.compile` of the globals (with the tosass vars prepended) is the fast
  feedback loop** for this kind of work — far quicker than a full webpack build, and the
  output-line delta (1616 → 1515) is a cheap sanity check that real rules were removed.
- Repo-wide `yarn lint` carries a backlog of pre-existing errors unrelated to vendoring; scope
  lint expectations to touched files (eslint doesn't cover scss anyway).

Original plan (for reference) — each item below was confirmed by grep:

- **AG Grid is fully orphaned.** `base.scss` imports `ag-grid-community/styles/*.css` and carries
  the entire `.ag-theme-alpine.ag-theme-bloom { … }` block plus `.data-pager*` rules (~110 lines),
  but nothing under `app/javascript/**/*.tsx` renders AgGrid/AgTable (this repo never used the
  package's table — see [Key findings](#key-findings)). Remove the imports, the theme block, and
  the data-pager rules; check whether `ag-grid-community` can then leave `package.json`.
- **9/10 mixins in `global/mixins.scss` are dead** — only `has-toggle` is used. Drop
  `custom-linear-gradient`, `overlay-image`, `clearfix`, `has-image-skeleton`,
  `filled-appearances`, `outlined-appearances`, `transition-timing`, `ellipsis`, `headings`.
- **Selector sweep across the remaining globals** (`homepage.scss`, `print.scss`,
  `custom_counter.scss`, `blocks.scss`, `lists.scss`, `text.scss`, `forms.scss`, `tables.scss`):
  grep each top-level class selector against `app/javascript/**/*.tsx` **and**
  `app/views/**/*.slim` (Rails templates can reference these too) before deleting.
- **Bulma leftovers in `base.scss` (lines ~50–76)** — `$scheme-main`, the `$colors` map, etc.
  Determine whether Bulma is still in the pipeline at all; if not, these are orphans too.

Caveat: Tailwind v2's JIT purge already drops unused *utility* classes, so this phase targets
hand-written rules and `@apply` blocks, not utilities.

### Phase 7 — Tailwind v4 + sass removal ✅ (done 2026-06-13)

Branch: `jdunning/chore/update-tailwind-remove-sass`. Tailwind v2.2 → **v4.3**; first-party
sass removed (all app stylesheets are now plain `.css`).

**What changed:**
- **Theme** → `app/javascript/styles/theme.css`: `@import "tailwindcss" important;` (the
  `important` keyword preserves v2's `important: true` cascade), a `@source` glob, and an
  `@theme` block translating the former `bloomTheme.js` (colors→`--color-*`, screens→
  `--breakpoint-*` incl. the **lg=1200** override, fontSize→`--text-*`, fontFamily→`--font-*`,
  letterSpacing→`--tracking-*`). `--color-*: initial` clears TW defaults so only the bloom
  palette exists (matching v2's full `colors` replacement). A `@layer base` rule restores the v2
  default border color (gray-450; v4 defaults to currentColor).
- **Entry** `base.scss` → `base.css`: remote font `@import`s first (kept), then
  `@import "../styles/theme.css"`, tokens, and globals (all `.css`). IE11 hack and the v2
  duplicate-`@import "tailwindcss/utilities"` specificity trick dropped.
- **All ~115 `.scss` → `.css`** via script: `@screen <bp>` → media queries, `$screen-*`/`$tailwind-*`
  → literal px / `var(--bloom-*)`, `map-get($tailwind-gray, N)` → `var(--bloom-color-gray-N)`,
  `#{}` interpolation inlined, `//` comments → `/* */`, the lone `has-toggle` mixin inlined.
  **CSS nesting was kept** (native nesting / Lightning CSS handles it) — only sass-specific syntax
  was rewritten. 126+ JS `import "./x.scss"` rewritten to `.css`; `custom.d.ts` updated.
- **`@reference`**: 31 JS-imported component `.css` files that use `@apply` got a
  `@reference "<rel>/styles/theme.css"` line (v4 compiles each separately-imported file in
  isolation, so `@apply` of custom utilities needs the theme in scope). Globals don't need it —
  they're `@import`ed into `base.css`'s single compilation unit.
- **Webpack**: `loaders/sass.js` replaced by `loaders/css.js` (`style-loader` → `css-loader`
  (with `url.filter` to leave root-relative `/images/...` alone) → `postcss-loader` with
  `@tailwindcss/postcss`). `tailwindToSass.js`, `tailwind.config.js`, `bloomTheme.js` deleted.
  Removed deps: `tailwindcss-rtl` (no RTL languages/variants used), `autoprefixer`,
  `postcss-preset-env`, `postcss-flexbugs-fixes`, `cssnano`, `clone-deep`, `postcss-nested`,
  `resolve-url-loader` (v4/Lightning CSS handles prefixing + nesting).
- **Utility renames**: `flex-grow`→`grow`, `outline-none`→`outline-hidden` (v4 semantics).
- **Two pre-existing upstream CSS bugs** surfaced by Lightning CSS and fixed: a `@md {` typo in
  `tables.css` (was silently dead under sass; now a real `@media (min-width: 768px)`) and
  `var(seeds-s4)` → `var(--seeds-s4)` in `ApplicationItem.css`.

**sass is NOT fully gone — by necessity.** `@bloom-housing/ui-seeds` is consumed from source
(`/src`) and ships sass component styles (`Card.scss`, etc.) that import its own tokens. A
**minimal sass rule** (`loaders/sass.js`: style → css → sass-loader, no postcss/Tailwind, since
ui-seeds' scss uses no `@apply`/`@tailwind`) is kept **solely for that third-party package**.
`sass` + `sass-loader` therefore remain as deps. If ui-seeds ever ships prebuilt CSS (or is
dropped), sass can go entirely.

**Verified**: production `webpack` build green (0 errors, only pre-existing asset-size warnings),
`tsc`, full `jest` (835/835), `yarn lint` (0). **Visual smoke-test still pending** — jest mocks
CSS (`identity-obj-proxy`), so it cannot catch layout/styling regressions. Run the standard
surface: listings directory, listing detail (pricing tables + gallery modal), header/footer,
language nav, account pages, and the `?featureFlag[temp.webapp.newAccountLayout]=false` header.

**Post-migration visual fixes (commit on the same branch):**
- **Nested `@media` cascade order.** Keeping native CSS nesting changed cascade vs sass: sass
  *hoisted* a rule's nested `@media`/style rules to **after** its bare declarations + `@apply`,
  so the `@media` value won at the breakpoint. In source order, a bare decl/`@apply` written
  *after* a nested `@media` now comes later and overrides it. This broke directory unit-table
  column alignment (`@media{text-left}` before `@apply text-right`) and hid expanded
  unit-accordion type names (`@media{display:block}` before `display:none`). Fixed with a PostCSS
  pass that moves nested style rules + block at-rules after bare decls/`@apply` (19 rules, 10
  files), replicating sass output. **This is a general gotcha for any future sass→nested-CSS
  conversion** — `@apply` parses as an at-rule, so the partition must keep block-less at-rules
  (`@apply`) in the head with declarations and only hoist *block* at-rules.

- **Cascade-layer `!important` inversion (class of bug).** v4 puts utilities in `@layer
  utilities`. With cascade layers, `!important` precedence is **inverted**: an `!important`
  declaration in a layer beats an `!important` declaration in **unlayered** CSS, regardless of
  selector specificity (normal declarations work the opposite way). In v2 there were no layers,
  so a component rule's `!important` beat a utility's `!important` by specificity. Result: any
  **unlayered component CSS that used `!important` to override a Tailwind utility now silently
  loses.** First instance: `.open-houses div { padding-bottom: 0 !important }` lost to
  `.pb-3 { … !important }`, leaving stray bottom padding on open-house links. Targeted fix: wrap
  the override in `@layer components` (earlier than `utilities` → its `!important` wins again).
  **~26 first-party CSS files use `!important`** — all had the same latent bug. **Fixed
  systemically in Phase 7.5** (below): all first-party CSS is now wrapped in `@layer components`
  and ui-seeds in `@layer seeds`, so `!important` overrides win and ui-seeds-vs-first-party
  precedence is preserved.

**Watch-out for visual review:** in v2 `important: true`, `@apply`'d declarations inside component
CSS were `!important`; in v4 they are **not** (only directly-used utility classes are, via the
`important` import flag). Component rules that relied on an `@apply`'d property out-specifying
something may differ — check the smoke-test surface for cascade regressions.

### Phase 7.5 — Systemic cascade-layer rework ✅ (done 2026-06-14)

Replaced the per-instance `@layer components` wrapping (open-houses) with a uniform, automatic
scheme so every first-party `!important` reliably beats a Tailwind utility `!important`, and
first-party CSS reliably overrides ui-seeds.

**Layer order** (declared in `app/javascript/styles/theme.css`):
`@layer theme, base, seeds, components, utilities;`

- `seeds` — `@bloom-housing/ui-seeds` CSS (compiled by sass-loader).
- `components` — all first-party app CSS.
- `utilities` — Tailwind utilities (`!important` via the import flag).

Mechanics (cascade layers): for **normal** declarations a later layer wins (so `components` beats
`seeds`, and `utilities` beats `components` — the v2 "utilities win" behavior); for **`!important`**
declarations precedence is reversed, an earlier layer wins (so a first-party `!important` in
`components` beats a utility `!important` in `utilities` — the override escape hatch). ui-seeds in
`seeds` < `components` reproduces v2's first-party-beats-ui-seeds source-order behavior.

**Implementation** — a single PostCSS plugin factory, `config/webpack/loaders/wrapLayer.js`:
- `css.js` runs it after `@tailwindcss/postcss` to wrap first-party CSS in `@layer components`.
- `sass.js` gained a `postcss-loader` step that wraps ui-seeds in `@layer seeds`.
- It leaves `@import`/`@charset`/`@layer`/`@property` at the top level and wraps everything else.

**Gotcha that cost the most time:** `@tailwindcss/postcss` inlines the `@import "tailwindcss"`
(and theme.css's other `@import`s) **into the entry file (`base.css`) before** `wrapLayer` runs, so
skipping by filename (`theme.css`) doesn't work — Tailwind's emitted `@layer theme/base/utilities`
blocks and order statements arrive in the same root. An early version wrapped *those* too, nesting
`utilities` as a **sublayer** of `components` (`components.utilities`) and scrambling the cascade
(symptom: `.pb-3` still beat `.open-houses … !important`). Fix: never wrap `@layer`/`@property`
at-rules — only bare rules. Verified live (computed `padding-bottom: 0px`) and via inspecting the
resolved layer statement order in `document.styleSheets`.

#### Original plan (for reference)

After the sweep, the remaining sass usage is just `@apply` / `@screen` / injected vars. Migrate:

- `tailwind.config.js` + `config/tailwind/bloomTheme.js` → a CSS-first `@theme` block. v4 drops
  the JS config; the `--bloom-*` custom properties the components already consume map naturally
  onto `@theme` tokens.
- Replace every `@screen <bp>` with a media query. **Use this repo's breakpoints, not v4
  defaults** — `$screen-lg` is **1200px** here (not 1024), `$screen-sm`=640, `$screen-md`=768
  (see [Gotchas](#gotchas--lessons-learned)). Confirm no kept rule still references
  `$screen-print` (it compiled to garbage and never applied).
- Retire `config/webpack/loaders/tailwindToSass.js` and the sass-loader `additionalData` in
  `config/webpack/loaders/sass.js`; rework the loader chain for plain CSS (drop `sass-loader`,
  keep postcss/tailwind). Rename `.scss` → `.css` once `@import`/`$vars`/`@apply` are gone.
- `base.scss` itself (`@tailwind base/components/utilities`, `@apply`, Bulma `$vars`) is the
  largest single file to convert.

This is the highest-risk phase — re-run the full vendoring smoke-test surface (listings
directory, listing detail pricing tables + gallery modal, header/footer, language nav) plus the
`?featureFlag[temp.webapp.newAccountLayout]=false` header path. Snapshot tests won't catch layout
regressions (the gallery-footer bug passed all tests).

### Phase 8 — Translation rearchitecture (move to a maintained library)

Current state and why it must change:

- `uic/translator.ts` holds a **module-level global mutable singleton** (`(global as any).Translator`
  + a single `node-polyglot` instance) that `addTranslation` mutates at bootstrap from
  `util/languageUtil.tsx`. This is client-only by design — hostile to SSR (shared mutable state
  across requests, no per-request locale), which blocks rendering these pages under TanStack Start.
- `locale()` is **hardcoded to `"en"`** (translator.ts:35); the 4-language support works only
  because polyglot phrases are swapped wholesale per navigation.
- `node-polyglot` is ~2 years stale and was promoted to a direct dep only to keep this alive.

Decision (per maintainer): **move to a maintained i18n library** (recommend `i18next` /
`react-i18next` — SSR-friendly, request-scoped instances, consumes the existing nested
`assets/json/translations/react/{en,es,zh,tl}.json` bundles, and its `{{var}}` interpolation is
close to polyglot's `%{var}`). Plan:

- **Keep `t()` as a stable façade** over the new backend to avoid churning all **207 call sites**
  at once. `getTranslationWithArguments` (the `key*arg:val*arg:val` syntax) becomes a thin shim
  over the new interpolation.
- Make the active instance **request-scoped via React context/provider** instead of a global
  singleton — this is the actual SSR unblock.
- Reconcile interpolation token syntax (`%{x}` → `{{x}}`) — likely a build-time transform of the
  JSON bundles or an i18next interpolation-format override.
- Wire dayjs locale + the `LANGUAGE_CONFIGS` lazy-`import()` bundle loading into the provider.

Write a short design doc for this phase before implementing — the façade-vs-hooks decision and
the interpolation reconciliation are the load-bearing choices.

### Running fix-list (incidental issues noticed while planning)

1. AG Grid CSS in `base.scss` is dead weight — Phase 6.
2. `translator.ts` global mutable singleton — core SSR blocker, Phase 8.
3. `locale()` hardcoded to `"en"` despite 4-language support — brittle, Phase 8.
4. Bulma `$vars` block in `base.scss` (50–76) — confirm Bulma is still wired or treat as orphan.
5. Confirm no kept global still references `$screen-print` (compiles to invalid media query).
6. `markdown-to-jsx` nested-types tsc noise (currently grep-filtered) — pin/resolve cleanly.
