### Shared style contracts in scope

- `info-template-container`
- `info-template-main-content`
- `info-template-content`
- `info-template-section`
- `info-template-stack`
- `info-template-divider`
- `info-template-callout`
- `info-template-list` variants
- `info-template-link`
- `info-template-link-direct`
- `info-template-contact-link`
- `info-template-sidebar`

### Components in scope

- `app/javascript/components/informational/InformationalPageElements.tsx`
- `app/javascript/layouts/HeaderSidebarLayout.tsx`
- `app/javascript/layouts/Sidebar/ContactSidebarBlock.tsx`
- `app/javascript/components/base.scss`
- `app/javascript/pages/inviteTo/invite-to.module.scss`

## Impacted Pages

### Get Assistance pages

- `app/javascript/pages/getAssistance/get-assistance.tsx`
- `app/javascript/pages/getAssistance/document-checklist.tsx`
- `app/javascript/pages/getAssistance/privacy.tsx`
- `app/javascript/pages/getAssistance/disclaimer.tsx`
- `app/javascript/pages/getAssistance/additional-resources.tsx`
- `app/javascript/pages/getAssistance/housing-counselors.tsx`

### Invite-to pages and templates

- `app/javascript/pages/inviteTo/invite-to.tsx`
- `app/javascript/pages/inviteTo/InviteToLayout.tsx`
- `app/javascript/pages/inviteTo/InviteToGetHelp.tsx`
- `app/javascript/pages/inviteTo/InviteToLeasingAgentInfo.tsx`
- `app/javascript/pages/inviteTo/InviteToContactMeLater.tsx`
- `app/javascript/pages/inviteTo/InviteToDeadlinePassed.tsx`
- `app/javascript/pages/inviteTo/InviteToWithdrawn.tsx`
- `app/javascript/pages/inviteTo/inviteToApply/InviteToApplyNextSteps.tsx`
- `app/javascript/pages/inviteTo/inviteToApply/InviteToApplyDocuments.tsx`
- `app/javascript/pages/inviteTo/inviteToInterview/InviteToInterviewNextSteps.tsx`
- `app/javascript/pages/inviteTo/inviteToInterview/InviteToInterviewDocuments.tsx`

## Test Environment

1. Browser coverage:
1. Chrome latest
2. Safari latest on macOS
3. Mobile Safari (iOS simulator or device)
4. Optional: Firefox latest

2. Viewports (breakpoint-driven checks):

Use the actual breakpoints referenced by these pages:

- `sm`: 640px
- `md`: 768px
- `lg`: 1200px
- Invite-to specific rule: 1024px (`@media (max-width: 1024px)`)

Run QA at these exact widths (desktop browser responsive mode, height can be 900 unless noted):

| Breakpoint Target | Width x Height (px) | Why this matters |
| --- | --- | --- |
| Below `sm` | 639x900 | Validates phone/mobile stack behavior before `sm` |
| At `sm` | 640x900 | Confirms `sm` transition behavior |
| Below `md` | 767x900 | Catches pre-tablet wrapping and spacing before `md` |
| At `md` | 768x900 | Confirms sidebar/layout behavior at `md` boundary |
| Invite-to cutoff | 1024x900 | Verifies invite-to padding rule at exact cutoff |
| Above invite-to cutoff | 1025x900 | Confirms invite-to layout immediately after cutoff |
| Below `lg` | 1199x900 | Validates near-desktop behavior before `lg` |
| At `lg` | 1200x900 | Confirms large-screen transitions at `lg` |
| Wide desktop baseline | 1440x900 | Final desktop readability and rhythm confirmation |

Mobile device sanity checks (real-device profiles):

| Device Profile | Width x Height (px) |
| --- | --- |
| iPhone 12/13/14 | 390x844 |
| iPhone SE | 375x667 |
| Small Android | 360x740 |

Recommended browser zoom: 100% for desktop/tablet checks.


## Regression Checklist for Designers

1. Validate vertical rhythm consistency.
- Check section-to-section spacing across all informational pages.
- Confirm no extra gap appears between heading blocks, lists, callouts, and accordions.

2. Validate typography and hierarchy.
- Confirm heading sizes/weights appear consistent by level.
- Confirm paragraph spacing and readability are consistent across pages.

3. Validate list presentation.
- Confirm ordered/unordered/nested lists use consistent indentation and marker style.
- Confirm compact list variants remain visually tighter where expected.

4. Validate divider and callout treatment.
- Confirm divider spacing feels consistent before/after section boundaries.
- Confirm callouts retain intended contrast and padding.

5. Validate link treatment.
- Confirm regular informational links remain underlined.
- Confirm phone and email links are blue and not underlined.
- Confirm hover/focus states are still visible and accessible.

6. Validate sidebar behavior.
- Confirm sidebar border/padding/alignment at desktop.
- Confirm mobile stacking and spacing remain readable and intentional.

7. Record findings.
- Capture screenshot pairs for each failed check: expected reference and actual.
- Note page, viewport, locale, and a short severity label.

## Regression Checklist for Engineers

1. Run automated checks.
- Run targeted lint on touched informational files.
- Run targeted page tests for get-assistance and invite-to suites.

2. Verify class contract usage.
- Confirm migrated pages use shared informational wrappers instead of one-off spacing wrappers.
- Confirm `info-template-contact-link` is used for `tel:` and `mailto:` links.

3. Verify route flows and state branches.
- Invite-to apply flow: yes/no/contact branches.
- Invite-to interview flow: yes/no/contact branches.
- Deadline passed and not passed branches for both flows.

4. Verify responsive behavior.
- Confirm no content clipping in sidebars/cards on mobile.
- Confirm list and accordion content do not overflow on narrow widths.

5. Verify visual regression hotspots.
- `document-checklist` accordion spacing and nested list spacing.
- `housing-counselors` card metadata and contact link styles.
- `get-assistance` action block spacing after wrapper migration.
- Invite-to response card sections that now use `InformationalStack`.

6. Verify accessibility baseline.
- Keyboard tab order through links/buttons/accordions.
- Visible focus indicator on links and controls.
- Headings and list semantics remain intact.

## Page-by-Page Test Tasks

1. `get-assistance`
- Confirm five action blocks have uniform spacing.
- Confirm alternating card backgrounds still match intended pattern.

2. `document-checklist`
- Confirm no unexpected space above/below accordion groups.
- Confirm nested lists and alpha lists render correctly.

3. `privacy` and `disclaimer`
- Confirm legal copy sections preserve spacing and list consistency.
- Confirm bottom mailing list area remains visually separated.

4. `additional-resources`
- Confirm local card-grid overrides still apply.
- Confirm card title/subtitle/body hierarchy remains readable.

5. `housing-counselors`
- Confirm counselor card metadata spacing remains stable.
- Confirm phone/email links are not underlined.
- Confirm website links remain underlined.

6. Invite-to docs and next-steps pages
- Confirm accordion and action block spacing consistency.
- Confirm side panel contact block spacing and link styles.

7. Invite-to response templates
- Confirm `contact me later`, `withdrawn`, and `deadline passed` sections have consistent spacing after stack migration.
- Confirm inline markup links render with expected informational link styling.

## Exit Criteria

1. No high-severity visual regressions across desktop/tablet/mobile.
2. Link behavior is consistent with rule set:
- Underlined: regular informational links.
- Not underlined: phone/email links.
3. No layout breakages in invite-to branch-specific screens.
4. Targeted lint/tests are green.
5. All design findings are triaged with owner and follow-up issue IDs.
