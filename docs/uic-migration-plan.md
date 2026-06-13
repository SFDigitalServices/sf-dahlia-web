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
| 5 — Global styles & package removal | ⬜ not started |

Everything the app renders now resolves to vendored code under
`app/javascript/components/uic/`. The only remaining ties to the package are:

1. the barrel's `export * from "@bloom-housing/ui-components"` (kept until Phase 5
   so any not-yet-vendored symbol still resolves),
2. the vendored `translator` forwarding phrases to the package's own `addTranslation`
   (so package-internal components still translate while the star export lives), and
3. the 16 global SCSS `@import`s in `app/javascript/components/base.scss` (Phase 5).

Full jest suite, eslint, and tsc are green after Phase 4 (835 tests).

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

`app/javascript/components/uic/index.ts` is a barrel that re-exports the whole package
(`export * from "@bloom-housing/ui-components"`) and overrides symbols with vendored local
copies as they are migrated (explicit local exports take precedence over `export *`).

All app imports of `"@bloom-housing/ui-components"` are rewritten once to the `@uic` alias
(tsconfig `paths`, webpack `resolve.alias`, jest `moduleNameMapper`). After that, migration
proceeds symbol-by-symbol inside the barrel with no further call-site churn. When the
`export *` line is finally removed, the package can be uninstalled.

### Style conversion rules

- Vendored styles are written as `.scss` files containing **only plain, un-nested CSS** —
  no `@import`, no mixins, no `@apply`, no `$variables` — so they keep working in today's
  sass pipeline and can be renamed to `.css` when sass is removed.
- Values come from the existing `--bloom-*` custom properties (defined by the package token
  files until Phase 5 ports them to a local `:root` block).
- Sass mixins used by a component (`filled-appearances`, `outlined-appearances`, etc.) are
  inlined and flattened into the component's stylesheet.

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
- **Dual polyglot instances.** While `export *` is still present, package-internal
  components call the *package's* `t`, not the vendored one. The vendored
  `addTranslation` therefore forwards phrases to the package's `addTranslation` too;
  otherwise package components render `{{ Missing Translation Phrases }}`. This
  forwarding can be deleted in Phase 5 once the star export is gone.
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
- **The barrel override pattern trips `import/export`.** `index.ts` has a file-level
  `/* eslint-disable import/export */` because explicit named exports intentionally shadow
  the `export *`.
- **Pre-existing tsc noise.** A type error in the package's nested `markdown-to-jsx` types
  is not ours; filter type-check output with `| grep -v markdown-to-jsx`.
- **Visual spot-check after every phase.** Snapshot tests catch markup drift but not
  layout regressions (the gallery footer bug passed all tests). Open the real pages.

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

### Phase 5 — Global styles & removal
Port the 16 `base.scss` package imports: token files → a local `:root` CSS-vars file; the rest
(markdown, text, forms, tables, …) → plain CSS. Remove `export *` from the barrel and the
translator's `addTranslation` forwarding, then uninstall `@bloom-housing/ui-components` (taking
ag-grid 26, react-beautiful-dnd, mapbox, react-map-gl, aria-autocomplete, react-text-mask,
react-accessible-accordion, react-media with it). Note: `react-focus-lock`,
`react-remove-scroll`, and `react-transition-group` were promoted to **direct** dependencies in
Phase 4 and must stay. Then evaluate converting the repo's own SCSS to drop `sass` and upgrade
Tailwind (separate effort).
