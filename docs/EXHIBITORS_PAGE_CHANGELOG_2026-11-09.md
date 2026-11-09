# IMDX 2027 — Exhibitors page update / Claude Code handoff
**Change request:** Exhibitors section parity, PDF badges, removal of directory, bilingual Why Exhibit editorial.
**Source branch:** `feat/exhibitors-page-eight-cards-zh-benefits-pdf` (merge only after review).
**Page:** `/exhibitors/#exhibitors` and `/zh/exhibitors/#exhibitors`.

## What changed
1. **A world of opportunity:** replaced old eight-row accordion with eight illustrated, clickable cards, using the same `industry-photo-grid` / `industry-card` design and image assets as Home. The card modal uses `assets/industry-grid.js`; it now reads current CMS card text/details and image paths from the clicked card. Reused original `a-world-of-opportunity.0–29` CMS field keys where applicable to preserve currently-published content overrides.
2. **WHY EXHIBIT:** retained the current intro and added **three stronger numbered editorial reasons**, with Simplified Chinese translations via `assets/exhibitors.js`. The three reasons are static editorial content for now (`data-cms-skip`), not yet individually CMS-editable.
3. **Exhibitor downloads:** rendered PDF downloads show a distinctive PDF file icon and accessible download label. Non-PDF files show a generic document icon. URLs are limited to safe HTTPS or same-origin paths. Downloads are still populated by published CMS content, not fake assets.
4. **Exhibitor directory:** removed search/category/list section from the static Exhibitors page and removed the public runtime request for that directory. The distinct `View the published floorplan` CTA remains. No exhibitor or booking data was deleted.

### English Why Exhibit copy
1. Connect with the people shaping China–Indonesia energy cooperation. Engage with government representatives, industry associations, leading energy companies, trade and investment organizations, and experts in coal technology, equipment, exploration and engineering.
2. Turn shared priorities into real projects. Explore bilateral energy policies, coal trade, cleaner and lower-carbon technologies, coal preparation and chemicals, advanced equipment, coal–new energy integration, and targeted matchmaking across the value chain.
3. Build lasting partnerships through shared experience. Learn from China–Indonesia coal and energy cooperation in practice, deepen industry relationships, and discover new opportunities for meaningful cross-border collaboration.

### 简体中文 — 为何参展
1. 汇聚中印尼能源合作的关键力量。与两国政府机构、行业协会、重点能源企业、贸易与投资机构，以及煤炭技术装备、地质勘探和工程承包领域的专业人士交流，拓展高价值合作网络。
2. 让共同目标转化为务实项目。聚焦双边能源政策、煤炭贸易、清洁低碳技术、选煤与煤化工、先进装备、煤炭与新能源融合发展，以及覆盖全产业链的重点项目对接。
3. 以实践经验开启长期合作。分享中印尼煤炭与能源合作的真实案例与经验，深化产业联系，在更多领域探索持续、互利的合作机遇。

## Files
- `exhibitors/index.html`: scope cards, three reasons, modal, removes directory.
- `assets/exhibitors.css`: styles for reasons, CMS-driven download icons, card text.
- `assets/exhibitors.js`: Simplified Chinese reasons and page-local copy.
- `assets/industry-grid.js`: modal uses current card text and image.
- `assets/platform.js`: download PDF indicator and no exhibitor directory fetch.
- `tests/exhibitors-change.test.mjs`: structural regression checks.

## QA / acceptance checklist
- [ ] 8 cards visible on desktop/tablet/mobile; images, typography, spacing, popup behavior match Home; no old accordion.
- [ ] Click each card: correct category title, summary, image, and detailed description; close via X, backdrop, Escape; keyboard focus returns.
- [ ] Three numbered reasons visible and readable; text has no overflow at 320px, 768px, and 1440px.
- [ ] EN ⇄ 中文 toggle: three reasons and label translate correctly; Chinese modal contents and CMS text require end-to-end verification after CMS publish.
- [ ] CMS-published download PDFs show PDF icon; click returns actual `application/pdf` file, no 404; non-PDF icon remains generic; empty download collection stays hidden as designed.
- [ ] No Exhibitor directory heading, search/filter form or API request is visible on either locale.
- [ ] Distinct published floorplan CTA continues to work, including an appropriate unavailable state when no published floorplan exists.
- [ ] Neither Home nor other CMS-driven lists regress; nav, focus, layout, URLs still function.
- [ ] Verify page's design and behavior on **live UAT after deployment**. GitHub merge is not live deployment.

## Follow-up issues for Claude (verify, do not claim resolved)
- **CMS section manifest drift (P1):** the backend `src/lib/page-manifest.json` / `src/lib/page-fields.json` still lists `exhibitor-directory`, while frontend intentionally removes its section. Remove/retire it in backend with a safe migration plan for published/draft layouts and rollback history, keeping currently-deployed CMS data intact. The three new static reasons are not editable in the current CMS; make them locale-specific editable content if Product Owner requires this, with matching translation and rollout.
- **Chinese CMS published content (P1):** a published `zh` page layout may override static fields. Test against actual CMS-published en/zh layouts. Some detail text in Home's shared industry popup may fall back to English. Verify/fix complete zh modality and English fallback rather than relying on static screenshots.
- **Downloads availability (P1):** the `Exhibitor downloads` section remains hidden until backend returns published `DOWNLOAD` items. Verify actual PDF URLs, MIME types, permissions, signed/downloadable links, and approved content; sample PDFs are not final organizer materials.
- **External/official publication claims (P2):** the user-provided talking points about representatives from government institutions and industry groups are framed as event-networking opportunities, not confirmed attendees; review wording with organizer before production.
- **Website not remotely tested in this PR:** browser access to `uat.imdx.tech` could not be confirmed via our inspection tool. Run UAT checks after merge/deployment and record any screenshot, network, console, i18n and responsive defects.

## Safe deployment after review
Changes are in the **static frontend repo** only. They do not affect invoices, user accounts, SMTP, payment or backend migration. On the VPS, update the `mining-expo-2027-demo` checkout only after merge and ensure the running web service serves the new files; browser assets may be cached up to 1h, and HTML should reference versioned CSS/JS. Do not apply destructive database commands.
