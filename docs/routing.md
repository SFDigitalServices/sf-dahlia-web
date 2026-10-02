# Routing in the Rails + React app

## Table of contents

- [Scope](#scope)
- [Routing architecture (end-to-end)](#routing-architecture-end-to-end)
- [Rails routing behavior](#rails-routing-behavior)
  - [Language-prefixed routes](#language-prefixed-routes)
  - [Constraint-based listing routes](#constraint-based-listing-routes)
  - [Catch-all fallback](#catch-all-fallback)
- [React router behavior (`react_application.tsx`)](#react-router-behavior-react_applicationtsx)
  - [Route sources of truth](#route-sources-of-truth)
  - [Localization behavior in React routes](#localization-behavior-in-react-routes)
  - [React wildcard behavior](#react-wildcard-behavior)
- [When navigation is handled by Rails vs by React](#when-navigation-is-handled-by-rails-vs-by-react) **<- RECOMMENDED READ**
- [Legacy Angular bridge](#legacy-angular-bridge-appassetsjavascriptssharedsharedservicejscoffee)
  - [What it does](#what-it-does)
  - [Where the handoff happens](#where-the-handoff-happens)
  - [Important behavior details](#important-behavior-details)
- [Example cross-stack navigation flow](#example-cross-stack-navigation-flow-react-listing---angular-application---react-page) **<- RECOMMENDED READ**
- [Current React route inventory](#current-react-route-inventory)
- [Auth flow navigation and redirect map](#auth-flow-navigation-and-redirect-map)
- [Auth flow complexity assessment and simplification suggestions](#auth-flow-complexity-assessment-and-simplification-suggestions) **<- RECOMMENDED READ**
- [Page-level routing patterns to know](#page-level-routing-patterns-to-know)
  - [Paths with `:id`](#paths-with-id)
  - [Auth flow routes rely on navigation state](#auth-flow-routes-rely-on-navigation-state)
  - [Query-parameter-driven behavior](#query-parameter-driven-behavior)
- [Safe checklist for adding/changing a React route](#safe-checklist-for-addingchanging-a-react-route)

## Scope

This document covers routing behavior in:

- `config/routes.rb`
- `app/javascript/packs/react_application.tsx`
- Page-level React components under `app/javascript/pages/**`

It intentionally does **not** document general AngularJS client routing in `app/assets/javascripts/**`, except for one interoperability bridge (`shared/SharedService.js.coffee`) that hands Angular state transitions off to Rails routes.

## Routing architecture (end-to-end)

Routing is split across two layers:

1. **Rails request routing** (`config/routes.rb`) decides which controller/action handles the URL.
2. **React client routing** (`BrowserRouter` in `react_application.tsx`) chooses the page component once the React app is mounted.

Request flow:

1. Browser requests a path (for example `/es/sign-in`).
2. Rails matches a server route.
3. `ApplicationController#layout_name` picks the layout:
   - `?react=true` forces `application-react`
   - `?react=false` forces `application-angular`
   - otherwise it uses the controller’s `use_react_app` value
4. React-backed actions render `react_component 'App', props: ...` in their view.
5. `react_application.tsx` loads translations for the URL language, registers `App`, and runs `reactOnRailsPageLoaded`.
6. `BrowserRouter` matches the path to a route in `PAGE_ROUTES` / `INVITE_TO_PATHS`.
7. If React does not match the path, the wildcard route triggers a full page reload (`window.location.assign(window.location.href)`), so Rails can handle the path (including Angular fallback).

## Rails routing behavior

### Language-prefixed routes

Most user-facing routes use an optional `(:lang)` prefix with:

- `en`
- `es`
- `zh`
- `tl`

Example: both `/sign-in` and `/es/sign-in` are valid server routes.

### Constraint-based listing routes

Two listing routes depend on constraints and route ordering:

- `(:lang)/listings/:id` uses `DalpConstraint`:
  - non-DALP listings render `listing#index`
  - DALP listings fall through to subsequent redirect routes
- `(:lang)/listings/:id/how-to-apply` uses `HowToApplyConstraint`:
  - valid FCFS ownership listings render `listing#how_to_apply`
  - others fall through to redirect routes

Because Rails evaluates in order, these fallback redirects only run when constraints fail.

### Catch-all fallback

At the end of `routes.rb`:

- `get '*path', to: 'angular#index'`

This handles HTML paths that are not explicitly server-routed to React controllers.

## React router behavior (`react_application.tsx`)

### Route sources of truth

- `PAGE_ROUTES`: standard React page routes
- `INVITE_TO_PATHS`: invite-to-next-steps/documents routes

### Localization behavior in React routes

For each route path, `localizedPaths(...)` registers:

- unprefixed path (`/sign-in`)
- `/es/...`, `/zh/...`, `/tl/...`
- explicit `/en/...` alias (English)

Notes:

- English is treated as the default language for unprefixed URLs.
- `routeUtil.ts` helpers (for example `getSignInPath`, `getMyAccountPath`) should be used for links so locale prefixes stay consistent.

### React wildcard behavior

`<Route path="*" element={<AngularRoute />} />` is intentional:

- it avoids a React 404 screen
- it forces a server round-trip for unknown client paths
- Rails can then resolve redirects or serve Angular fallback pages

## When navigation is handled by Rails vs by React

| Navigation trigger | Typical code pattern in this repo | First handler | What happens next |
|---|---|---|---|
| Direct URL entry, refresh, open-in-new-tab, or any anchor-style navigation | Browser address bar, `<a href=...>`, `Link`/`LinkButton` with `href`, `window.location.assign(...)`, `window.location.replace(...)`, `window.location.href = ...` | Rails | Rails routes the request, chooses layout/controller/view, then React mounts if that view renders `react_component 'App'`. |
| In-app SPA navigation | `navigate(...)`, `<Navigate to=... />`, `<Link to=...>` (from `react-router`) | React Router (`BrowserRouter`) | Route is matched against `PAGE_ROUTES` / `INVITE_TO_PATHS` without a full page reload. |
| React navigation to a path not registered in `PAGE_ROUTES`/`INVITE_TO_PATHS` | Any `navigate(...)`/`<Link to>` landing on an unmatched path | React Router, then Rails | React hits `<Route path="*">`, `AngularRoute` calls `window.location.assign(currentUrl)`, then Rails handles the URL. |
| Server-side redirect rules | `config/routes.rb` redirects (for example `/my-account -> /account`) | Rails | Redirect resolves before React route matching on the destination request. |
| Auth guard redirects from account pages | `withAuthentication` HOC uses `window.location.assign(...)` | Rails | Protected pages redirect through Rails to sign-in or add-profile routes. |

## Legacy Angular bridge: `app/assets/javascripts/shared/SharedService.js.coffee`

`SharedService` does not participate in React Router directly, but it **does** affect whether navigation stays in Angular or is handed off to Rails (which may then render React).

### What it does

- Defines `railsRoutedPages`, a map of Angular state names (for example `dahlia.listings-for-rent`, `dahlia.listing`, `dahlia.sign-in`) to:
  - `buildUrl(state, params)`: builds a Rails URL
  - `shouldRailsRoute(isFirstLoad)`: decides whether to leave Angular and do a full page navigation
- Exposes:
  - `shouldRouteViaRails(stateName, isFirstLoad)`
  - `buildUrl(state, params)`

### Where the handoff happens

In `app/assets/javascripts/config/angularInitialize.js.coffee`, on `$stateChangeStart`:

1. Angular checks `SharedService.shouldRouteViaRails(toState.name, isFirstLoad)`.
2. If true, Angular sets `window.location.href = SharedService.buildUrl(toState, toParams)` (and prevents the state transition for most states).
3. Browser performs a full request.
4. Rails routes the request and chooses layout/controller; if it lands on a React-backed route, React boots from the server response.

So this file is the Angular-era **bridge into Rails routing**, not a React-side router.

### Important behavior details

- Most handoff rules are `!isFirstLoad`, so first page load usually stays in Angular and subsequent transitions can hand off to Rails.
- `dahlia.redirect-home` is configured to always route via Rails.
- `buildUrl` adds language prefixes (`/es/...`, `/zh/...`, etc.) but currently does not preserve arbitrary query params (the file has a TODO for this).
- Several auth/account handoffs are feature-flag gated by window globals (`ACCOUNT_INFORMATION_PAGES_REACT`, `SIGN_IN_PAGE_REACT`, `CREATE_ACCOUNT_PAGE_REACT`, `PASSWORD_PAGES_REACT`).

## Example cross-stack navigation flow (React listing -> Angular application -> React page)

Example assumptions:

- `FORM_ENGINE` is off (so Apply links use `/listings/:id/apply-welcome/intro`, the Angular short-form flow)
- `ACCOUNT_INFORMATION_PAGES_REACT` is `"true"` (so My Applications is handed off to Rails/React)

Flow:

1. User starts on React listing detail at `/:lang?/listings/:id`.
   - Rails route: `listing#index`
   - React route: `/listings/:id` -> `ListingDetail`
2. User clicks **Apply Online**.
   - `ListingDetailsApply.tsx` sets `applyLink` to `localizedPath("listings/:id/apply-welcome/intro")` when `FORM_ENGINE` is false.
   - The button uses `href` (`LinkButton`), **so this is a full browser navigation.**
3. Browser requests `/:lang?/listings/:id/apply-welcome/intro`.
   - Rails has no dedicated React route for this path, so it falls through to `get '*path', to: 'angular#index'`.
4. Angular router handles the URL via short-form states (`dahlia.short-form-welcome` / `...intro`), and the user completes the application flow.
5. User submits from the application review flow.
   - Angular `ShortFormApplicationController.submitApplication()` transitions to `dahlia.short-form-application.confirmation`.
6. User proceeds to **My Applications** from the confirmation flow (`ui-sref` / `$state.go('dahlia.my-applications')`).
7. During Angular `$stateChangeStart`, `SharedService.shouldRouteViaRails('dahlia.my-applications', isFirstLoad)` returns true (because `ACCOUNT_INFORMATION_PAGES_REACT == "true"`), so Angular sets `window.location.href` to `/:lang?/account/applications`.
8. Rails serves `account#applications`, and React boots on `/account/applications`.
   - React route: `/account/applications` -> `Applications`

This journey touches all three layers in one path:

- **React routing** (listing/detail page)
- **Rails fallback + Angular routing** (short-form application pages)
- **Legacy Angular bridge + Rails + React routing** (handoff back to React My Applications)

## Current React route inventory

Unless noted, paths below support unprefixed and localized forms (`/es/...`, `/zh/...`, `/tl/...`, `/en/...`).

<details>
<summary><strong>Primary page routes</strong></summary>

| Path pattern | Rails action | React page component |
|---|---|---|
| `/` | `home#index` | `pages/index.tsx` (`HomePage`) |
| `/listings/for-rent` | `directory#rent` | `pages/listings/for-rent.tsx` |
| `/listings/for-sale` | `directory#sale` | `pages/listings/for-sale.tsx` |
| `/listings/:id` | `listing#index` (when `DalpConstraint` passes) | `pages/listings/listing-detail.tsx` |
| `/listings/:id/how-to-apply` | `listing#how_to_apply` (when `HowToApplyConstraint` passes) | `pages/howToApply/how-to-apply.tsx` |
| `/listings/:id/apply/intro` | `form#listing_apply_form` | `pages/form/listing-apply-form.tsx` |
| `/sign-in` | `auth#sign_in` | `pages/sign-in.tsx` |
| `/sign-in/code` | `auth#enter_verification_code` | `pages/account/verification-code.tsx` |
| `/create-account` | `auth#create_account` | `pages/account/create-an-account.tsx` |
| `/create-account/code` | `auth#enter_verification_code` | `pages/account/verification-code.tsx` |
| `/add-password` | `auth#add_password` | `pages/account/add-password.tsx` |
| `/add-profile` | `auth#add_profile` | `pages/account/add-profile.tsx` |
| `/forgot-password` | `auth#forgot_password` | `pages/forgot-password.tsx` |
| `/change-password` | `auth#change_password` | `pages/account/change-password.tsx` |
| `/reset-password` | `auth#reset_password` | `pages/reset-password.tsx` |
| `/update-email` | `auth#update_email` | `pages/account/update-email.tsx` |
| `/update-email/code` | `auth#enter_verification_code` | `pages/account/verification-code.tsx` |
| `/housing-counselors` | `assistance#housing_counselors` | `pages/getAssistance/housing-counselors.tsx` |
| `/get-assistance` | `assistance#get_assistance` | `pages/getAssistance/get-assistance.tsx` |
| `/document-checklist` | `assistance#document_checklist` | `pages/getAssistance/document-checklist.tsx` |
| `/additional-resources` | `assistance#additional_resources` | `pages/getAssistance/additional-resources.tsx` |
| `/privacy` | `assistance#privacy` | `pages/getAssistance/privacy.tsx` |
| `/disclaimer` | `assistance#disclaimer` | `pages/getAssistance/disclaimer.tsx` |
| `/account` | `account#account` | `pages/account/account.tsx` |
| `/account/applications` | `account#applications` | `pages/account/applications.tsx` |
| `/account/settings` | `account#settings` | `pages/account/settings.tsx` |
| `/account/contact` | `account#contact` | `pages/account/contact.tsx` |

</details>

<details>
<summary><strong>Invite-to routes (all use <code>InviteToPage</code>)</strong></summary>

| Path pattern | Rails action | React page component |
|---|---|---|
| `/listings/:id/next-steps` | `invite_to#index` | `pages/inviteTo/invite-to.tsx` |
| `/listings/:id/next-steps/documents` | `invite_to#documents` | `pages/inviteTo/invite-to.tsx` |
| `/listings/:id/invite-to-apply` (deprecated path) | `invite_to#index` | `pages/inviteTo/invite-to.tsx` |
| `/listings/:id/invite-to-apply/documents` (deprecated path) | `invite_to#documents` | `pages/inviteTo/invite-to.tsx` |

</details>

<details>
<summary><strong>Legacy/client-only nuances</strong></summary>

| Path | Server behavior | React behavior |
|---|---|---|
| `/my-account` | Rails redirects to `/account` (and localized equivalent) | Still present in `PAGE_ROUTES` as `pages/account/my-account.tsx` |
| `/my-applications` | Rails redirects to `/account/applications` | Still present in `PAGE_ROUTES` as `pages/account/my-applications.tsx` |
| `/account-settings` | Rails redirects to `/account/settings` | Still present in `PAGE_ROUTES` as `pages/account/account-settings.tsx` |
| `/forgot-password/code` | No explicit Rails route; request can fall to Angular catch-all | Present in `PAGE_ROUTES` as `verification-code` for in-app auth flow navigation |

</details>

## Auth flow navigation and redirect map

This section maps redirects and route transitions used by the current auth implementation (Clerk + legacy Devise fallback).

<details>
<summary><strong>1) Automatic auth guards and redirects</strong></summary>

| Source | Condition | Redirect target | Mechanism |
|---|---|---|---|
| `withAuthentication` (used by account pages) | Not authenticated (`!isTokenValid` in Devise mode, or signed out in Clerk mode) | Localized `/sign-in?redirect={account|applications|settings}` | `window.location.assign(...)` (Rails navigation) |
| `withAuthentication` (Clerk mode) | Authenticated session exists but profile is missing | Localized `/add-profile` | `window.location.assign(...)` (Rails navigation) |
| `pages/sign-in.tsx` (Devise mode) | Token already valid and no housing-counselor `t` query param | Localized `/account` | `<Navigate ... replace />` (React navigation) |
| `pages/account/verification-code.tsx` | Clerk disabled | Localized `/sign-in` | `navigate(...)` |
| `pages/account/verification-code.tsx` | Missing `location.state.email` or `location.state.flow` | Flow fallback path: `/sign-in`, `/create-account`, `/forgot-password`, or `/update-email` | `navigate(...)` |
| `pages/account/verification-code.tsx` | Non-update-email flow, already signed in with profile | Localized `/account` | `navigate(...)` |
| `pages/account/verification-code.tsx` | Non-update-email flow, already signed in without profile | Localized `/add-profile` | `navigate(...)` |
| `pages/account/add-password.tsx` | Clerk disabled or signed out | Localized `/sign-in` | `navigate(...)` |
| `pages/account/add-password.tsx` | Non-account-settings flow, signed in with profile | Localized `/account` | `navigate(...)` |
| `pages/account/add-password.tsx` | Non-account-settings flow, signed in without profile but password already exists | Localized `/add-profile` | `navigate(...)` |
| `pages/account/add-password.tsx` (`AddPasswordPage`) | Forgot-password reset attempt is stale | Localized `/forgot-password` | `<Navigate ... replace />` |
| `pages/account/add-profile.tsx` | Clerk disabled or signed out | Localized `/sign-in` | `navigate(...)` |
| `pages/account/add-profile.tsx` | Profile already exists | Localized `/account` | `navigate(...)` |
| `pages/account/update-email.tsx` | Clerk disabled or signed out | Localized `/sign-in` | `navigate(...)` |
| `pages/account/change-password.tsx` | Clerk disabled or signed out | Localized `/sign-in` | `navigate(...)` |
| `pages/account/change-password.tsx` | Signed in but no password set | Localized `/account/settings` | `navigate(..., { replace: true })` |
| `pages/reset-password.tsx` (legacy form mode) | No profile when auth state is loaded | Localized `/sign-in` | `window.location.assign(...)` |

</details>

<details>
<summary><strong>2) Auth step-to-step navigation (successful actions)</strong></summary>

| Source | Action/result | Next route | Mechanism |
|---|---|---|---|
| `authentication/SignInFlow.tsx` | Password sign-in success | `redirectUrl` (if passed in `location.state`) or localized `/account` | `navigate(...)` |
| `authentication/SignInFlow.tsx` | Password sign-in success but housing-counselor authorization fails | Same destination with `?hcAccess=0` appended | `navigate(...)` |
| `authentication/SignInFlow.tsx` | User chooses one-time code and code send succeeds | Localized `/sign-in/code` with `state: { email, flow: SIGN_IN, ... }` | `navigate(...)` |
| `authentication/SignInFlow.tsx` | Already signed-in user opens a housing-counselor token link | Localized `/account` (or `/account?hcAccess=0` on failed counselor auth) | `navigate(...)` |
| `authentication/SignInForm.tsx` (legacy) | Sign-in succeeds | Localized redirect target from `?redirect=` (`/account`, `/account/applications`, `/account/settings`); defaults to `/account` when missing | `navigate(...)` |
| `pages/account/create-an-account.tsx` | `createAccount(...)` returns `needsSignIn` | Localized `/sign-in/code` with `flow: SIGN_IN` | `navigate(...)` |
| `pages/account/create-an-account.tsx` | `createAccount(...)` succeeds | Localized `/create-account/code` with `flow: CREATE_ACCOUNT` | `navigate(...)` |
| `pages/account/create-account.tsx` (legacy) | Account creation succeeds | Localized `/sign-in` | `window.location.replace(...)` |
| `pages/account/verification-code.tsx` | Sign-in code verification succeeds | `redirectUrl` (if provided) or localized `/account`; may append `?hcAccess=0` | `signInSession.activateSession(destination)` |
| `pages/account/verification-code.tsx` | Sign-up code verification succeeds | Localized `/add-password` with `state.flow` | `signUpSession.activateSession(...)` |
| `pages/account/verification-code.tsx` | Sign-in code indicates sign-up required | Localized `/add-password` with `flow: CREATE_ACCOUNT` | `signUpSession.activateSession(...)` |
| `pages/account/verification-code.tsx` | Forgot-password code verification succeeds | Localized `/reset-password` with `state: { email, flow, code }` | `navigate(...)` |
| `pages/account/verification-code.tsx` | Update-email code verification succeeds | Localized `/account/settings` with `state: { emailChanged: true }` | `navigate(...)` |
| `authentication/ForgotPasswordFlow.tsx` | Reset code send succeeds | Localized `/forgot-password/code` with `state: { email, flow: FORGOT_PASSWORD }` | `navigate(...)` |
| `pages/account/add-password.tsx` (`AddPasswordPage`) | Forgot-password password reset succeeds | Localized `/account` | `activateSession(getMyAccountPath())` |
| `pages/account/add-password.tsx` (`AddPasswordPage`) | Add-password succeeds during account creation | Localized `/add-profile` | `navigate(...)` |
| `pages/account/add-password.tsx` (`AddPasswordPage`) | Add/change password succeeds in account-settings mode | Localized `/account/settings` with `state: { passwordChanged: true }` | `navigate(...)` |
| `pages/account/add-profile.tsx` | Profile submission succeeds | Localized `/account` with `state: { accountReady: true }` | `navigate(...)` |
| `pages/account/update-email.tsx` | New email accepted and verification code requested | Localized `/update-email/code` with `state: { email, flow: UPDATE_EMAIL }` | `navigate(...)` |
| `pages/account/change-password.tsx` | Password change succeeds | Localized `/account/settings` with `state: { passwordChanged: true }` | `navigate(...)` |
| `pages/reset-password.tsx` (legacy form mode) | Password reset succeeds | Localized `/account/applications` | `window.location.assign(...)` |

</details>

<details>
<summary><strong>3) Shared redirect parameters used by auth flows</strong></summary>

- `?redirect=account|applications|settings` is set by `withAuthentication` when sending unauthenticated users to sign-in.
- Legacy sign-in (`SignInForm`) maps that param via `getSignInRedirectUrl(...)`:
  - `account` -> `/account`
  - `applications` -> `/account/applications`
  - `settings` -> `/account/settings`
  - `home` (or unknown values) -> `/`
  - if `redirect` is absent, sign-in defaults to `/account`
- `AUTH_FLOW_PATH` in `routeUtil.ts` is used by verification-code fallback behavior:
  - `SIGN_IN` -> `/sign-in`
  - `CREATE_ACCOUNT` -> `/create-account`
  - `FORGOT_PASSWORD` -> `/forgot-password`
  - `UPDATE_EMAIL` -> `/update-email`
- `redirectUrl` can be passed in React location state (for example from `ListingDetailsApply`) so users return to their original target after sign-in.
- `hcAccess=0` is appended when housing-counselor authorization fails, so account pages can show no-access messaging.

</details>

<details>
<summary><strong>4) Idle-timeout redirects (auth-adjacent)</strong></summary>

`withAppSetup` wraps pages with `IdleTimeout`, which can trigger auth-related redirects:

| Source | Condition | Redirect target | Mechanism |
|---|---|---|---|
| `authentication/components/IdleTimeout.tsx` | Logged-in user times out (`profile && timeOut`) | Localized `/sign-in` | `window.location.href = ...` (full page navigation) |
| `authentication/components/IdleTimeout.tsx` | Form timeout enabled (`useFormTimeout: true`) and user is not logged in | Localized `/` | `window.location.href = ...` (full page navigation) |

</details>

## Auth flow complexity assessment and simplification suggestions

**Complexity assessment:** **high**. The auth navigation layer is currently transitional, with multiple stacks and redirect mechanisms active at the same time.

Main complexity drivers:

1. **Two auth implementations in parallel** (Clerk + legacy Devise), each with separate redirect paths.
2. **Distributed redirect logic** across many pages/components (`withAuthentication`, sign-in flows, verification-code, add-password/add-profile/update-email/change-password, reset-password, idle-timeout).
3. **Mixed navigation primitives** (`navigate`, `<Navigate>`, `window.location.assign/replace/href`, and session `activateSession(...)` callbacks), which do not all behave the same.
4. **Multiple redirect-context channels** (query params like `redirect`/`alert`/`t`/`hcAccess` plus `location.state` values like `flow`/`email`/`redirectUrl`).
5. **Angular interop during application flows**, where users can move between React, Angular, and back to React.

Practical suggestions to simplify:

1. **Centralize auth route decisions into one module** (for example an `authNavigationPolicy` helper/hook) that owns:
   - signed-out redirects,
   - signed-in/no-profile redirects,
   - flow fallbacks (`SIGN_IN`, `CREATE_ACCOUNT`, `FORGOT_PASSWORD`, `UPDATE_EMAIL`),
   - post-auth destination resolution.
2. **Standardize redirect payloads** to one canonical shape (for example `returnTo` + optional `reason`) and validate destinations through a shared allowlist.
3. **Adopt route-guard wrappers** (for example `RequireSignedInProfile`, `RequireSignedOut`, `RequireSignedInNoProfile`) to replace repeated page-level redirect `useEffect` logic.
4. **Reduce full-page navigations for internal React paths**, reserving `window.location.*` for explicit full reload/Angular handoff cases only.
5. **Decommission legacy branches in phases** after flag rollouts stabilize:
   - remove Devise-only auth pages/redirects,
   - then remove duplicated redirect code paths and params no longer needed.
6. **Add a small redirect test matrix** (unit + e2e) that covers primary auth journeys and edge cases (housing counselor token, timeout, stale flows, missing state) to prevent regressions during simplification.

## Page-level routing patterns to know

### Paths with `:id`

- `/listings/:id/apply/intro` uses `useParams()` in `listing-apply-form.tsx`.
- `listing-detail.tsx`, `how-to-apply.tsx`, and `invite-to.tsx` derive `listingId` from `pathname` after `getPathWithoutLanguagePrefix(...)` and `split("/")`.
  - If these path shapes change, update that parsing logic.

### Auth flow routes rely on navigation state

Several auth pages pass/expect `location.state` via `navigate(...)` (especially `verification-code`, `add-password`, `update-email`, create-account flow pages). Direct URL entry without expected state often redirects to sign-in or flow fallback routes.

### Query-parameter-driven behavior

- Sign-in checks for `t` in the query string before auto-redirecting authenticated users.
- Account page reads `hcAccess=0` for delegated-access messaging.
- Invite flows use query params (`t` or decoded params) for response state.

## Safe checklist for adding/changing a React route

1. Add or update the server route in `config/routes.rb` **before** the final `*path` catch-all.
2. Ensure controller/action sets React props and renders a React view (`react_component 'App'`).
3. Add the page to `PAGE_ROUTES` (or `INVITE_TO_PATHS`) in `react_application.tsx`.
4. Use `routeUtil.ts` helpers for navigation links to preserve locale behavior.
5. If you changed a `/listings/:id/...` path shape, update manual `listingId` parsing in affected page components.
6. Verify both direct load and in-app navigation for unprefixed + localized paths.
