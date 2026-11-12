# SKOON Plus — Published Bilingual Projects & Designs: Production Release Checkpoint
Date: 2026-11-12 Asia/Dubai
Status: VERIFIED FOR TESTED ROUTES/VIEWPORTS; ADDITIONAL PROJECTS HELD FOR SOURCE VERIFICATION.

## SOURCE
- Directly consulted SGP-01 original `QS/governance/SKOON_AI_GOVERNANCE_MASTER_v1.0.md` (status Proposed) prior to authoring.
- Source design photo `assets/aurum-p256-cover.jpg`, previously verified against original `SD-P256` project on SKOON Google Drive, source file `P256_A1_Enabling Package Cover.jpg` ID `199FebQorqd-s-Dnd8sH7wCFFTw4UPbyx`.
- Production repo `kaqeelskoon/SKOON_Portal_v2_Bilingual_Design`, baseline `899000d52033580500bb07d8d04ac90f8a40382b`.
- Original route contract `vercel.json`: `/` rewrites to `/build-hub/index.html` while `/index.html` is architectural intro page.

## RULES
- Display only project imagery with original attribution evidence; no invented names, quantities, designs or approvals.
- All page UI AR/EN, actual HTML RTL, preserve language in navigation across pages.
- Internal QA screenshots and checkpoint stored within QS or GitHub Actions artifacts, not contractor tender pack.
- Release only after browser and visual QA; no Stage9 PR3 merge or Supabase writes.

## CHANGES
1. PR #6 https://github.com/kaqeelskoon/SKOON_Portal_v2_Bilingual_Design/pull/6 merged as `dbaf2301c0c41afe76bb8e6b3cca765326a80bc8`. New `projects.html`, `projects.css`, `projects.js`; five project categories plus 'All', one sourced Aurum SD-P256 project and honest empty states. Header links added to `app.js`, `website/app.js`, `build-hub/index.html/app.js/style.css`, and the virtual office Projects link `office-tour-config.js`.
2. PR #7 https://github.com/kaqeelskoon/SKOON_Portal_v2_Bilingual_Design/pull/7 merged as `71ee50d3057cf97295279d15b79cdc361422e860`: `build-hub/app.js` respects explicit `?lang=ar|en` on entry above stored preference and updates current URL on language toggling. No project data changes.
3. PR #8 https://github.com/kaqeelskoon/SKOON_Portal_v2_Bilingual_Design/pull/8 merged as `4798884a50c9844d9a360b1b23da70fa112d2fba`: internal Projects nav link gets `id=projects-link` and updated href with effective locale, preventing Arabic header self-link redirecting to English.
4. Live production Vercel deployment `dpl_7dUoduJkvQUwkPxM3rDLjBuPhR8k` confirmed READY at exact main SHA `4798884a50c9844d9a360b1b23da70fa112d2fba`.

## EXECUTED QA AND VISUAL EVIDENCE
- Earlier initial CI found mobile directory nav hidden by inherited `nav a{display:none}`; fixed responsive presentation and retested.
- Screenshot visual inspection found white rectangle where dark brand image was force-inverted; changed to legible text SKOON.AI wordmark, visually re-inspected `/mnt/data/portfolio_verified/mobile-ar-hotel.png` and EN desktop gallery shot.
- PR #6 tested SHA `93d15ef457302e757f0f7eba5824f0eb03718724`: run https://github.com/kaqeelskoon/SKOON_Portal_v2_Bilingual_Design/actions/runs/43210465416, 3 Node test records PASS / 0 FAIL, 8 images artifact https://github.com/kaqeelskoon/SKOON_Portal_v2_Bilingual_Design/actions/runs/43210465416/artifacts/13940323089 ; source photo, EN/AR, desktop/mobile, category filter, mobile nav, virtual office Projects link.
- PR #7 targeted language route CI https://github.com/kaqeelskoon/SKOON_Portal_v2_Bilingual_Design/actions/runs/43211599377, exact SHA `1d91639fac657cf05b8367a2290893267310dd79`; 3 test records PASS / 0 FAIL, screenshots artifact 13941801030.
- PR #8 direct portfolio current-page link QA https://github.com/kaqeelskoon/SKOON_Portal_v2_Bilingual_Design/actions/runs/43212348822, SHA `c780669e10f0cfa5bb1e13db10619d16ff246a5d`; 3 test records PASS / 0 FAIL, screenshots artifact 13942046586.
- Read-only live production page checks https://agent.tinyfish.ai/runs/29498dac-5421-4898-8d9f-b16138db6d4e confirmed Arabic RTL title, six category selectors, Aurum SD-P256 only under Hotels/All, and honest empty states.
- Live production check after PR7 raised inconsistency with the current-page portfolio self-link pointing to English: https://agent.tinyfish.ai/runs/ffe7c0a2-4a60-43bb-815d-33ba1b7914ec . Corrected in PR8 and verified live at https://agent.tinyfish.ai/runs/86021e90-aba7-4245-8db5-0219bc506525: Arabic header current-page href `/projects.html?lang=ar`; click stays Arabic RTL; EN toggle and href update; Aurum hotel image remains visible.
- Scope: standalone portfolio plus navigation and CSS only. No unrelated Build Hub directory data changed, no database writes, no contract/BOQ/tender changes.

## REMAINING HOLDS / LIMITATIONS
- Additional actual villa, residential, interior and commercial projects: HOLD pending original SKOON image sources, attribution and rights clearance. Categories are placeholders only; no fake works shown.
- Original published Aurum visual licensing beyond SKOON project folder provenance was not independently audited.
- This QA is scoped to selected routes, viewports and interactions, not a claim that the entire platform underwent comprehensive visual audit.
- Stage9 PR3 remains separate and was not merged in this work. Previous independent Supabase RLS/TRUNCATE decisions remain untouched.

## SOURCE / RULES / REFERENCES / QA / CHANGES / HOLD / CHECKPOINT
SOURCE PASS scoped originals; RULES SGP-01 consulted; REFERENCES exact project ID, commits, PRs, and CI links above; QA PASS verified listed paths and interactions; CHANGES portfolio and locale routing only; remaining HOLD additional projects and image-rights verification; CHECKPOINT THIS DOCUMENT; resume by sourcing additional portfolio images and confirmed architect attribution before publishing further cards.
