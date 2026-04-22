# Requirements Document

## Introduction

Redesign the `/my-account` page in the DAHLIA SF Housing Portal from a card-based layout to a two-pane layout. The new design features a left sidebar navigation panel with section links and a right content area that displays the active section's content. The header and footer remain unchanged. Existing functionality for application results and account settings is preserved but rendered within the new layout framework.

## Glossary

- **Account_Dashboard**: The main `/my-account` page that serves as the entry point for authenticated users to manage their account
- **Sidebar_Navigation**: The left pane containing navigation items that allow users to switch between account sections
- **Content_Area**: The right pane that displays the content for the currently active section
- **Navigation_Item**: A clickable element in the Sidebar_Navigation representing a section (Overview, Applications and lottery results, Account settings, Sign out)
- **Active_Indicator**: A visual highlight (blue left border) applied to the currently selected Navigation_Item
- **Overview_Section**: The default content view showing a personalized greeting and summary cards linking to other sections
- **Account_Layout**: The reusable two-pane layout component wrapping all account pages (dashboard, applications, settings)

## Requirements

### Requirement 1: Two-Pane Account Layout

**User Story:** As an authenticated user, I want to see my account pages in a two-pane layout with sidebar navigation, so that I can easily navigate between account sections without leaving the account context.

#### Acceptance Criteria

1. THE Account_Layout SHALL render a left Sidebar_Navigation pane and a right Content_Area pane side by side on desktop viewports
2. WHEN the viewport width is below the medium breakpoint, THE Account_Layout SHALL stack the Sidebar_Navigation above the Content_Area vertically
3. THE Account_Layout SHALL preserve the existing site header and footer without modification
4. THE Account_Layout SHALL be used by the Account_Dashboard page, the applications page, and the account settings page

### Requirement 2: Sidebar Navigation

**User Story:** As an authenticated user, I want a sidebar with clearly labeled navigation items, so that I can quickly access different sections of my account.

#### Acceptance Criteria

1. THE Sidebar_Navigation SHALL display a heading labeled "ACCOUNT" at the top of the navigation list
2. THE Sidebar_Navigation SHALL display the following Navigation_Items in order: Overview, Application and lottery results, Account settings, Sign out
3. WHEN a user clicks a Navigation_Item (other than Sign out), THE Sidebar_Navigation SHALL navigate the user to the corresponding account section
4. WHEN a user clicks the Sign out Navigation_Item, THE Sidebar_Navigation SHALL sign the user out and redirect to the sign-in page
5. THE Sidebar_Navigation SHALL display an Active_Indicator (blue left border) on the Navigation_Item corresponding to the currently active section
6. WHEN the Overview Navigation_Item is active, THE Active_Indicator SHALL be displayed on the Overview Navigation_Item

### Requirement 3: Overview Section Content

**User Story:** As an authenticated user, I want to see a personalized overview when I land on my account page, so that I can quickly understand my account status and navigate to detailed sections.

#### Acceptance Criteria

1. THE Overview_Section SHALL display a greeting that includes the user's first name (e.g., "Hi, Rosa")
2. IF the user's first name is not available, THEN THE Overview_Section SHALL display a generic greeting without a name
3. THE Overview_Section SHALL display a summary card for "Applications and lottery results" with a button labeled "See applications" that links to the applications page
4. THE Overview_Section SHALL display a summary card for "Account settings" with a button labeled "Edit settings" that links to the account settings page
5. THE Overview_Section SHALL display a "Sign out of account" link at the bottom of the Content_Area

### Requirement 4: Existing Functionality Preservation

**User Story:** As an authenticated user, I want my existing application results and account settings functionality to work the same way within the new layout, so that I do not lose any capabilities.

#### Acceptance Criteria

1. WHEN a user navigates to the applications section, THE Content_Area SHALL render the existing my-applications page content within the Account_Layout
2. WHEN a user navigates to the account settings section, THE Content_Area SHALL render the existing account-settings page content within the Account_Layout
3. THE Account_Layout SHALL continue to enforce authentication via the existing withAuthentication higher-order component
4. THE Account_Layout SHALL support internationalization for all navigation labels and content text using the existing t() translation function

### Requirement 5: Accessibility

**User Story:** As a user relying on assistive technology, I want the new layout to be navigable and understandable, so that I can use all account features effectively.

#### Acceptance Criteria

1. THE Sidebar_Navigation SHALL use a `<nav>` landmark element with an accessible label identifying it as account navigation
2. THE Active_Indicator SHALL convey the active state to assistive technologies using an appropriate ARIA attribute (e.g., aria-current="page")
3. THE Account_Layout SHALL maintain a logical focus order from Sidebar_Navigation to Content_Area
4. WHEN a Navigation_Item is activated via keyboard, THE Sidebar_Navigation SHALL navigate to the corresponding section
