# SKOON Plus Stage 8 — Isolated Live Browser Regression Evidence
Date: 2026-11-12 Asia/Dubai
Status: Four synthetic cases browser-observed; GitHub Chromium CI still HOLD; do not merge.

## SOURCE / RULES
- SGP-01 master v1.0 proposed, consulted this turn at `QS/governance/SKOON_AI_GOVERNANCE_MASTER_v1.0.md` (original uploaded governance source present in conversation).
- Stage8 branch `skoon-plus/stage8-legacy-qa-20261112`, based on production `ffa9e3e0920ded85dd6e151fa8be410df2c94b20`.
- Production `build-hub/app.js` source blob SHA `ae22ddcfa2175abcb8426e086b48ebe734b5866f`; data handling section lines 19–23.
- Tests source: `tests/build-hub-browser.test.cjs`.
- Rules: SGP-01 §§2, 6, 7, 8; never silently overwrite browser data, keep internal QS separate from production, evidence before confirmed defects.

## WHY INDEPENDENT BROWSER TEST
- GitHub Actions old run `43095906521` and latest test-source run `43096584795` remained QUEUED, with `fetch_workflow_run_jobs` returning `jobs=[]`. No CI failure or exact scheduling root cause confirmed.
- A temporary synthetic data seeding page was installed ONLY on preview branch, commit `01cef4ef962d6c036967e8e8183dcdbeddd76491`, at `build-hub/qa-stage8-fixtures.html`, and Vercel deployed preview `dpl_2owrx7ZDjqjAzXQtQR74RTQJ7Nig` at `https://skoon-okfyclret-kaqeel-7380.vercel.app/`, Vercel API state READY and SHA matched. Preview and production have different origins.
- Fixture backs up exact previous localStorage directory and language to tab sessionStorage once, allows four synthetic test inputs and explicit restore.

## ACTUAL BROWSER RESULTS
1) v1 legacy schema with custom company and blank SKOON URL:
   - Browser run `https://agent.tinyfish.ai/runs/5a33e95d-1c08-4681-95c2-ca8d8bf2f4b5`.
   - Observed custom company 'شركتي', URL `https://example.org/my-firm` persisted; SKOON URL remained blank/pending; schema migrated from 1 to 2. Agent response covers v1 only, not other cases in that run.
2) v2 current schema:
   - Browser run `https://agent.tinyfish.ai/runs/4b6ad43c-c2f6-409c-8c3e-d54641898d78`.
   - Observed schemaVersion=2, SKOON URL `https://skoonaiv2.vercel.app/index.html`, custom 'شركتي' URL `https://example.org/my-firm` in stored companies. Did not independently assert popup from new Vercel page in this run.
3) malformed JSON:
   - Browser run `https://agent.tinyfish.ai/runs/b00a772a-1e23-42de-bdbe-ec38b9c4ef79`.
   - Seed `{bad json`; actual Build Hub displayed six default categories; fixture after navigation reported `parseError:true` and exact invalid raw string unchanged, language ar, backupPresent=true.
4) stored unsafe URL:
   - Browser run `https://agent.tinyfish.ai/runs/fc058667-4273-49c5-93fa-6f4b57b385d8`.
   - Seed JSON URL `javascript:alert(1)`; actual Build Hub displayed six default categories; no Unsafe/غير آمن listing or script alert; fixture after navigation reported original malicious URL retained in raw JSON (not accepted for rendering).
   - **Restoration confirmed**: clicked 'RESTORE ORIGINAL DATA', fixture reported `backupPresent:false`, `stored:{}`, `lang:null` (original preview-domain profile empty).
- All test data synthetic. No actual user-company records imported; no production origin storage touched.
- Browser reports are not durable exported screenshot bytes; do not claim all screenshots captured/reviewed. UI-specific rendering defects are not asserted.

## CLEANUP
- Temporary test fixture HTML deleted from Stage8 branch in commit `78de7458d6807f84232aa60bf2830d4d1bea9cad`.
- Rechecked compare `main...skoon-plus/stage8-legacy-qa-20261112`: ONLY `.github/workflows/skoon-plus-stage7-tests.yml` and `tests/build-hub-browser.test.cjs` changed. No temporary fixture, no QA logs, no application source in diff. Historic immutable Vercel preview URL for fixture commit may remain accessible in deployment history; do not represent its removal from branch as deletion of historic deployment.
- No PR, merge, or production deployment made in Stage8.

## STATUS / HOLDS
- SOURCE PASS; RULES PASS; REFERENCES N/A; SCOPE PASS; independent synthetic-browser functional QA PARTIAL PASS (4 case observations); GitHub Actions Chromium CI HOLD; exported visual screenshot QA HOLD; LOCATION PASS internal QS; release AUTHORITY HOLD; CHECKPOINT PASS.
- Historical real-user profiles and their data are NOT verified; migration into central backend remains architecture/authority HOLD.
- Stage6 Eslam feedback separately pending.

## RESUME
1. Obtain GitHub Actions job logs for latest test commit if scheduler recovers; run test suite with screenshot artifacts on latest clean branch SHA.
2. Do not publish synthetic fixtures on production; merge of tests not needed until CI gate verified.
3. Request Eslam's review of already released Stage7; preserve Stage6 prior candidate.
