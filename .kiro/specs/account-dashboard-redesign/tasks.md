# Implementation Plan: Account Dashboard Redesign

## Overview

Transform the `/my-account` page from a card-based layout to a two-pane layout with persistent sidebar navigation. Create a shared `AccountLayout` component used by all three account pages, extract inner content from existing pages, and wire everything together while preserving existing authentication, i18n, and functional behavior.

## Tasks

- [x] 1. Create AccountLayout component
  - [x] 1.1 Create `app/javascript/layouts/AccountLayout.tsx` with a two-pane grid layout
    - Render a left sidebar pane and right content area pane side by side
    - Apply responsive stacking: sidebar above content on viewports below the `md` breakpoint
    - Accept `children` as the content area content
    - Wrap content in a background section (`bg-gray-300`) with appropriate padding
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.2 Create `app/javascript/layouts/AccountLayout.scss` for layout-specific styles
    - Define the two-pane grid layout styles
    - Define the active indicator blue left border style
    - _Requirements: 1.1, 2.5_

- [x] 2. Create AccountSidebar component
  - [x] 2.1 Create `app/javascript/pages/account/components/AccountSidebar.tsx`
    - Render a `<nav>` landmark with `aria-label` for account navigation
    - Display "ACCOUNT" heading at the top
    - Render navigation items in order: Overview, Applications and lottery results, Account settings, Sign out
    - Use `getPathWithoutLanguagePrefix` on `window.location.pathname` to determine active section via `getActiveSection` utility function
    - Apply `aria-current="page"` and blue left border class to the active navigation item
    - Use localized paths from `routeUtil` (`getMyAccountPath`, `getMyApplicationsPath`, `getMyAccountSettingsPath`) for nav item hrefs
    - Handle Sign out by calling `UserContext.signOut()` and redirecting to sign-in page
    - Use `t()` for all navigation labels
    - Use icons from `@bloom-housing/ui-components` for each nav item (`profile`, `application`, `settings`)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 4.4, 5.1, 5.2, 5.3, 5.4_

  - [ ]* 2.2 Write property test for `getActiveSection` (Property 1)
    - **Property 1: Active section detection is correct for all valid account paths**
    - Generate random URL paths combining language prefixes (`/es/`, `/zh/`, `/tl/`, or none), account path segments (`/my-account`, `/my-applications`, `/account-settings`), and optional query strings
    - Verify `getActiveSection` returns the correct section identifier for each generated path
    - Use `fast-check` with Jest, minimum 100 iterations
    - **Validates: Requirements 2.5, 2.6, 5.2**

  - [ ]* 2.3 Write unit tests for AccountSidebar
    - Test all four nav items render in correct order
    - Test "ACCOUNT" heading is present
    - Test `<nav>` landmark has `aria-label`
    - Test `aria-current="page"` is applied to the active item
    - Test Sign out calls `signOut()` and redirects
    - Test nav items have correct localized `href` values
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 5.2_

- [x] 3. Create OverviewContent component
  - [x] 3.1 Create `app/javascript/pages/account/components/OverviewContent.tsx`
    - Read user profile from `UserContext`
    - Display personalized greeting ("Hi, {firstName}") when `firstName` is available
    - Display generic greeting (without name) when `firstName` is undefined/null/empty
    - Render summary card for "Applications and lottery results" with a "See applications" button linking to `getMyApplicationsPath()`
    - Render summary card for "Account settings" with an "Edit settings" button linking to `getMyAccountSettingsPath()`
    - Render "Sign out of account" link at the bottom that calls `signOut()` and redirects
    - Use `t()` for all text content
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.4_

  - [ ]* 3.2 Write property test for greeting logic (Property 2)
    - **Property 2: Greeting includes the user's first name when available**
    - Generate random non-empty strings (including unicode, special characters, spaces) as `firstName`
    - Verify the greeting text contains the exact `firstName` value
    - Use `fast-check` with Jest, minimum 100 iterations
    - **Validates: Requirements 3.1, 3.2**

  - [ ]* 3.3 Write unit tests for OverviewContent
    - Test greeting renders with user's first name
    - Test generic greeting renders when no first name
    - Test both summary cards render with correct links
    - Test sign out link is present and functional
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Integrate AccountLayout into existing pages
  - [x] 5.1 Refactor `app/javascript/pages/account/my-account.tsx`
    - Replace the existing card-based layout with `AccountLayout` wrapping `OverviewContent`
    - Keep `withAppSetup` and `withAuthentication` HOC wrappers on the page entry point
    - Remove the old `AccountDashCard` component and related card layout markup
    - _Requirements: 1.4, 4.3_

  - [x] 5.2 Refactor `app/javascript/pages/account/my-applications.tsx`
    - Extract inner content (everything inside `<Layout>`) into the existing file or a separate content component
    - Wrap extracted content with `AccountLayout` instead of `<Layout>`
    - Remove `max-w-2xl mx-auto` centering constraints from the content wrapper so it fills the content area
    - Remove the outer `<section className="bg-gray-300 ...">` wrapper (background handled by `AccountLayout`)
    - Preserve all existing functional behavior (application list, modals, delete flow)
    - Keep `withAppSetup` and `withAuthentication` HOC wrappers on the page entry point
    - _Requirements: 1.4, 4.1, 4.3_

  - [x] 5.3 Refactor `app/javascript/pages/account/account-settings.tsx`
    - Extract inner content (everything inside `<Layout>`) into the existing file or a separate content component
    - Wrap extracted content with `AccountLayout` instead of `<Layout>`
    - Remove `md:max-w-lg mx-auto` centering constraints from the content wrapper so it fills the content area
    - Remove the outer `<section className="bg-gray-300 ...">` wrapper (background handled by `AccountLayout`)
    - Preserve internal card structure, form padding (`p-2 md:py-2 md:px-10`), and all form behavior
    - Keep `withAppSetup` and `withAuthentication` HOC wrappers on the page entry point
    - _Requirements: 1.4, 4.2, 4.3_

- [x] 6. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Existing HOC wrappers (`withAppSetup`, `withAuthentication`) remain on each page entry point unchanged
- The sidebar determines active section from `window.location.pathname` since pages are Rails-served (not SPA)
