# Informational Template Overrides

This document tracks intentional page-specific overrides after the global informational layout cleanup.

For role-based regression validation steps, see `docs/informational-style-regression-test-plan.md`.

## Shared Baseline Applied

The following shared primitives are now used as the baseline for informational pages/components:

- Container and breakpoint contract: `info-template-container`, `info-template-main-content`
- Section rhythm and divider spacing: `info-template-content`, `info-template-section`, `info-template-divider`
- Callout shell: `info-template-callout`
- List tokens: `info-template-list`, `info-template-list--unordered`, `info-template-list--ordered`, `info-template-list--nested`, `info-template-list--compact`, `info-template-list--lower-alpha`
- Link tokens: `info-template-link`, `info-template-link-direct`
- Sidebar shell: `info-template-sidebar`

## Intentional Overrides

### 1) Privacy and Disclaimer pages keep direct `Layout` usage

- Files:
  - `app/javascript/pages/getAssistance/privacy.tsx`
  - `app/javascript/pages/getAssistance/disclaimer.tsx`
- Why intentional:
  - These pages do not include the standard assistance contact sidebar and have legal/policy-specific content flow.
  - They include `MailingListSignup` at the bottom and retain this structure.

### 2) Additional Resources keeps card-grid local style customizations

- Files:
  - `app/javascript/pages/getAssistance/additional-resources.tsx`
  - `app/javascript/pages/getAssistance/additional-resources.scss`
- Why intentional:
  - `InfoCardGrid` typography and spacing for headings/subtitles are tuned to card density and readability.
  - Grid-specific title/subtitle visual treatment should remain local to the card module.

### 3) Housing Counselors keeps tag and counselor-card specific styling

- Files:
  - `app/javascript/pages/getAssistance/housing-counselors.tsx`
  - `app/javascript/pages/getAssistance/housing-counselors.scss`
- Why intentional:
  - Language/service tags and counselor card metadata require custom visual hierarchy and interaction patterns.
  - Mobile/desktop contact action behavior remains tailored to this directory-like experience.

### 4) Invite-to documents pages retain workflow-specific information architecture

- Files:
  - `app/javascript/pages/inviteTo/inviteToApply/InviteToApplyDocuments.tsx`
  - `app/javascript/pages/inviteTo/inviteToInterview/InviteToInterviewDocuments.tsx`
  - `app/javascript/pages/inviteTo/invite-to.module.scss`
- Why intentional:
  - These pages are transaction-oriented process flows with specialized blocks (accordion sequences, print actions, upload guidance).
  - Shared link tokens are applied, while flow structure remains purpose-built.
