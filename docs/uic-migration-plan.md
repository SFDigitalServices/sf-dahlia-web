# Migrating off `@bloom-housing/ui-components`

`@bloom-housing/ui-components` (v12.7.x) is no longer actively maintained and pins very old
dependencies (Tailwind v2, sass, AgGrid 26, react-beautiful-dnd, react-text-mask, react-media,
node-polyglot, etc.). We still use ~70 of its exports, so the plan is to **vendor the components
we actually use** into `app/javascript/components/uic/`, converting their SCSS to plain CSS with
custom properties (the package already uses `--bloom-*` CSS vars for nearly all values), and to
drop the package — and eventually the sass toolchain — entirely.

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

### Phase 3 — Layout & listings components
Mostly mechanical copy + SCSS→CSS conversion. Reimplement `ContentAccordion` natively
(button + aria) instead of `react-accessible-accordion`, which also removes the
`resetAccordionUuid` test hack.

### Phase 4 — Special cases
- `StandardTable`: copy with the `draggable` branch and react-beautiful-dnd/nanoid imports
  deleted (no call site uses drag) — becomes a plain `<table>` renderer.
- `Modal`: vendor as-is first; consider native `<dialog>` later to drop
  react-focus-lock/react-remove-scroll.
- `SiteHeader`/`SiteFooter`/`LanguageNav`: heaviest SCSS; check whether
  `@bloom-housing/ui-seeds` (already a dependency) has replacements before porting.

### Phase 5 — Global styles & removal
Port the 16 `base.scss` package imports: token files → a local `:root` CSS-vars file; the rest
(markdown, text, forms, tables, …) → plain CSS. Remove `export *` from the barrel, uninstall
`@bloom-housing/ui-components` (taking ag-grid 26, react-beautiful-dnd, mapbox, react-map-gl,
aria-autocomplete with it). Then evaluate converting the repo's own SCSS to drop `sass` and
upgrade Tailwind (separate effort).
