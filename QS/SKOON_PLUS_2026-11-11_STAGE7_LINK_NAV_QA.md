# SKOON Plus Stage 7 — Company-link navigation QA checkpoint

Date: 2026-11-11 Asia/Dubai
State: SOURCE / RUNTIME LINK FUNCTION PASS; CLICK NAVIGATION HOLD; MOBILE QA HOLD

## SOURCE
- Governance: QS/governance/SKOON_AI_GOVERNANCE_MASTER_v1.0.md (SGP-01 v1.0, 2026-10-27, proposed), read for this turn; original governance ZIP previously reviewed. No claim this file is system-enforced.
- App: kaqeelskoon/SKOON_Portal_v2_Bilingual_Design, branch skoon-plus/stage7-governance-20261111.
- Source paths: build-hub/app.js, tests/build-hub-i18n.test.cjs.

## RULES
SGP-01 §2 SOURCE-first, §6 visual evidence gates, §7 preserve permissions/production, §8 checkpoint.

## REFERENCES AND QA EVIDENCE
Browser run: https://agent.tinyfish.ai/runs/43948e37-56a5-4a92-8210-f258c0bb8e35
Preview deployed source: https://skoon-kr5h09l6x-kaqeel-7380.vercel.app/build-hub/ (deployment dpl_6eHuH8giNbWFmWUipVYkxAQYMwVh, commit b197e12c267d5b35c0dc08f6a98cc00c9ffff080).

- Browser selected Arabic and Consultants and identified link `https://skoonaiv2.vercel.app/index.html?lang=ar`.
- Browser selected English and Consultants and identified link `https://skoonaiv2.vercel.app/index.html?lang=en`.
- Browser automation reported toast "رابط الموقع قريباً" / "Website coming soon" instead of visible new tab on card click, while identifying a real anchor with target="_blank". The observed report conflicts with source branch where pending toast is associated with `[data-pending]`, and the SKOON anchor has a URL. Therefore no confirmed defective user-facing click result without captured screenshot/actual new-tab inspection. Classification: **اشتباه غير قابل للتأكيد**.
- No downstream destination rendering was verified; agent's assertion about destination language is not evidence that it navigated.
- Mobile viewport was not changed/tested. No screenshot bytes attached to this checkpoint.

Code improvement in this phase: ONLY tests/build-hub-i18n.test.cjs updated, commit e21edd08c4297940f2e534fef3ee9184e1c289fa (no application logic changed). New Node vm-based test extracts and executes actual companyHref function for both `ar`, `en`, and checks unchanged external URL behavior.
GitHub Actions exact run: https://github.com/kaqeelskoon/SKOON_Portal_v2_Bilingual_Design/actions/runs/43090439539
- Run job 130765759197: status completed, conclusion success (connector job API).
- Original job log retrieved: `node --check build-hub/app.js` successful, `node --check tests/build-hub-i18n.test.cjs` successful, `node --test tests/build-hub-i18n.test.cjs`: `# tests 8`, `# pass 8`, `# fail 0`.
- Evidence test line: `ok 8 - execute real companyHref for both languages without modifying external URLs`.

## CHANGES
- Stage 7 branch only, one test suite extension and this QS checkpoint. No changes to main, deployed production, preview auth settings, or Stage 6 candidate.

## GATES
SOURCE PASS; RULES PASS; REFERENCES N/A; SCOPE PASS (companyHref/link logic only); QA PASS for exact function execution + CI; VISUAL / CLICK / MOBILE HOLD; LOCATION PASS (QS); AUTHORITY HOLD for release/merge; RESUME PASS.

## RESUME
1. In browser QA use real tab handling or capture user-visible screenshot of click/toast (not inference from an iframe/blocked pop-up). Explicitly identify whether a new tab opened.
2. Verify destination `skoonaiv2.vercel.app/index.html?lang=ar` and English end-to-end and any separate Vercel authentication; do not weaken protection.
3. Test fixed mobile viewport with screenshot evidence for directory and editor, both languages.
4. Do not merge until Eslam feedback and explicit approval.
