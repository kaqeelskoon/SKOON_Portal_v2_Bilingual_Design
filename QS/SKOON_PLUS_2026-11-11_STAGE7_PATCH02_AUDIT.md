# SKOON Plus Stage 7 — Patch 02 QA checkpoint
Date: 2026-11-11 Asia/Dubai | Status: QA HOLD — not merged and not deployed.

## SOURCE
- Original governance ZIP: SKOON_AI_GOVERNANCE_SGP01_v1.0(1).zip / SKOON_GOVERNANCE/SKOON_AI_GOVERNANCE_MASTER_v1.0.md.
- Linked GitHub production repository: kaqeelskoon/SKOON_Portal_v2_Bilingual_Design.
- Branch: skoon-plus/stage7-governance-20261111.
- Referenced files: build-hub/app.js, build-hub/index.html, build-hub/style.css, app.js (root portal).
- Vercel production project skoon.ai untouched; Stage 6 separate review remains held.

## RULES
SGP-01 original: preserve sources, keep QS evidence outside contractor tender deliveries, don't assert unexecuted tests or visual errors.

## REFERENCES & execution trace
- Root portal `app.js`: `new URLSearchParams(location.search).get('lang')` reads language from query parameter.
- Build directory before Patch 02: `build-hub/app.js` `initial.companies` SKOON link was `https://skoonaiv2.vercel.app/index.html` without query lang; `renderCards()` generated href using `safe(c.url)`, independently of selected language. **Code-level mismatch** (not declared a visually verified bug).
- After Patch 02: `companyHref(c)` adds `lang` query parameter to the exact known SKOON URL only; other links remain unchanged; card markup uses `safe(companyHref(c))`.
- App code commit f89cffb5455b096f413df2f259ea8f89c7d088ae. Verified fresh blob ae22ddcfa2175abcb8426e086b48ebe734b5866f.
- Added Node built-in `node:test` static QA source `tests/build-hub-i18n.test.cjs`; original commit 62003637f7030c89be9425c40378ba7878355ec7; extended test commit 1eaa51e93bd9695be9bb5f0ad6917d4c1091c94; verified blob 6bfb2ce9d0c8f5445573308ae3e69fe1de1467bb.
- Read-only GitHub source-level checks executed in the connected tool sandbox: six predicates passed: EN/AR key parity; HTML data-i key coverage; localized title/hero alt/close aria bindings; portal lang forwarding expression; external URL bypass; committed regression test presence.
- EN/AR dictionary extraction yielded 69 keys per language; HTML had 34 distinct data-i labels; no missing keys observed.
- Important: Node `node --test` has **not** been executed against a checked-out GitHub tree. The six predicates above are not a substitute for executing the test file or end-to-end browser QA.

## CHANGES (branch only)
- `build-hub/app.js`: language forwarding for known internal SKOON destination.
- `tests/build-hub-i18n.test.cjs`: reusable EN/AR static regression suite (seven test() cases).
- Earlier Stage 7 Patch 01 localizes page title, hero alt, editor close ARIA.
- No edits to production/main or Vercel deployment.

## Gate / remaining HOLDs
SOURCE PASS; RULES PASS; REFERENCES N/A; SCOPE PASS for the examined files only; QA HOLD (Node test not executed, no browser/screenshots, no mobile or RTL visual evidence); LOCATION PASS (QS); AUTHORITY HOLD (no merge/release); RESUME PASS.

## Checkpoint
1. Run `node --test tests/build-hub-i18n.test.cjs` in the exact branch checkout or CI. Record stdout, exit code and checked commit hash.
2. Preview same branch without touching production; capture EN/AR desktop and mobile screenshots and test language propagation after clicking SKOON company.
3. Verify directory card navigation, browser-only editor persistence, import/export, safety and keyboard handling. Any observed UI error must be visually evidenced before classification.
4. Collect Eslam feedback on Stage 6 separately; obtain authorization before merge/release.
