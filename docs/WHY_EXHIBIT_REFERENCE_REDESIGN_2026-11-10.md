# IMDX 2027 — Why Exhibit page update / 10 Nov 2026

## Reference and editorial rationale
Source: [Mining Indonesia — Why Exhibit](https://www.mining-indonesia.com/why-exhibit/). The reference explains a trade show's value as five exhibitor outcomes: lead generation, branding, networking, customer connection, and market feedback. This implementation uses that **information architecture**, not its copyrighted copy, photos, logos, proprietary layout, or Mining Indonesia's visitor counts.

## Implemented in static frontend
- Reordered the existing `make-your-next-connection` designed section so the existing image/CTA comes first, then five IMDX-specific business benefits, then the previously-approved three China–Indonesia strategic arguments.
- New five cards: qualified leads; brand visibility; networking; customer relationships; market intelligence. First card is featured in brand-brown and rest retain cream/orange styling.
- Added sticky, keyboard-accessible local section links. Mobile navigation scrolls horizontally without clipping; all IDs remain stable. No new service or booking flow.
- Preserved `a-world-of-opportunity` (all 8 cards and modal), `exhibitor-downloads`, and the floorplan CTA. Exhibitor Directory remains absent.
- New content has English and Simplified Chinese defaults. `assets/exhibitor-benefits.js` translates only *unchanged English default* text and intentionally leaves organizer-edited CMS content alone.
- Added original SVG line icons and CSS; reused existing IMDX images, logo, colors (#C2410C, #520F00, #F9F0E2) and typography. No external imagery or assets copied.

## CMS / backend coordination
Related backend branch: `feat/cms-exhibitors-benefits-fields-20261110` in `saohdir/mining-expo-2027-backend`.
- Adds field definitions `make-your-next-connection.18–31` to `src/lib/page-fields.json` so CONTENT_EDITOR/SUPER_ADMIN can edit new benefit copy in the established Pages & Layout CMS.
- Adds corresponding English → Simplified Chinese translations to `scripts/i18n/zh.json`.
- Original field keys 0–17 and existing block ID `make-your-next-connection` are preserved to avoid invalidating old published CMS layouts.
- **Do not** re-seed/publish all CMS page layouts on an already populated UAT without reviewing differences; `scripts/apply-site-content.ts --publish` can overwrite organizer edits. Frontend fallback keeps new cards Chinese on /zh/ even if the published zh layout lacks new keys.

## QA: required before merge/deployment
1. Run `node --test tests/exhibitors-business-benefits.test.mjs` in the frontend.
2. Confirm each benefit card has a heading, short description and original SVG icon, and previous three bilateral arguments remain.
3. Verify desktop (1440, 1024), tablet (768) and mobile (390, 320) in EN and 中文. No horizontal page overflow; scrollable page subnav, not the entire document.
4. Test keyboard navigation, visible focus, anchor scrolling with sticky header, reduced motion and readable contrast in the featured card.
5. Test public `/exhibitors/` and `/zh/exhibitors/` after CMS fields/zh overrides load. Confirm custom Chinese translations are not clobbered.
6. Test 8 scope cards/modal, exhibitor reservation button, published floorplan link, PDF downloads and footer/header.
7. Test CMS Page Builder: save/publish/rollback of a new benefit field in EN and zh; confirm no regression of original keys and published layout, and original copy can be restored.
8. Check console and network requests for JS/runtime exceptions or 404s, including versioned CSS and JS assets.
9. Ensure no hard-coded Mining Indonesia facts/figures or unapproved IMDX visitor, lead, exhibitor claims.
10. Confirm no payments, Gmail SMTP, customer-account settings or QR scanning have changed.

## Deployment
Two repositories are affected; review/test both PRs and merge in a coordinated order (backend CMS manifest first, then frontend, or in one planned release). Updating GitHub **does not** update the running Hostinger VPS until the appropriate git pull/Compose or static-web refresh. Do not report UAT live until it is verified in a browser.

## Eight golden rules checklist
- Consistency: same IMDX design tokens/components; unchanged global navigation.
- Universal usability: responsive grid, keyboard focus, semantic list and anchors.
- Feedback: active section nav and clickable CTAs; hover/focus states.
- Closure: category dialog retains close/return controls, booking CTA remains explicit.
- Error prevention: no fake statistics and no uncontrolled new booking paths.
- Easy reversal: anchor navigation and modal close, CMS draft/publish rollback.
- User control: navigable local anchors; no unexpected page redirects.
- Low memory load: simple five-benefit structure, short copy, visible section titles.
