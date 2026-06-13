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
