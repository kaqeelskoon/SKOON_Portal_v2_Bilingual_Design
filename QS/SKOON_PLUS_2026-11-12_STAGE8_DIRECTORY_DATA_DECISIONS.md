# SKOON Plus Stage 8 — Directory Persistence & Authority Decision Record
Date: 2026-11-12 (Asia/Dubai)
Status: PROPOSED / AUTHORITY HOLD. Do not deploy as a specification or implement without approval.

## SOURCES
- Governance: QS/governance/SKOON_AI_GOVERNANCE_MASTER_v1.0.md, original SGP-01 v1.0 (2026-10-27; proposed, not system-enforced), reviewed.
- Build Hub application: GitHub production commit ffa9e3e0920ded85dd6e151fa8be410df2c94b20, build-hub/app.js, specifically lines 19–25 (localStorage, schema migration, persistence), line 28 (cards) and editor handlers.
- Prior Stage7 release evidence: QS/SKOON_PLUS_2026-11-11_STAGE7_RELEASE_DEPLOYMENT_TRACE.md.
- Current Stage8 tests: branch skoon-plus/stage8-legacy-qa-20261112, tests/build-hub-browser.test.cjs.

## RULES
SGP-01 §§2,6,7,8. Keep QS evidence internal and out of client/contractor deliverables. User explicitly wanted production preserved while development is tested. Do not silently clear or overwrite existing browser data.

## VERIFIED CURRENT BEHAVIOR (SOURCE)
- Data store key: `skoon-build-directory-v1`, in browser localStorage only.
- Other key: `skoon-hub-lang`, AR/EN selection.
- `valid(d)` validates categories/companies and selects a stored directory if structurally valid.
- `schemaVersion !== 2` triggers legacy migration, `fillSlots(data)`, then writes back to localStorage; absent a stored directory, initial directory is cloned.
- Editor save updates in-memory data and calls `persist()`, writing to localStorage; no centralized server ownership or authentication evident in examined build-hub source.
- Company URL is optional. A blank URL renders a pending button, while a nonblank valid URL renders an anchor. Link language forwarding is special-cased to canonical SKOON URL.

## REQUIRED DECISIONS (NOT APPROVED)
1. Choose authority model for central records: SKOON Super Admin and designated Directory Editors; all other visitors read-only. Actual user identities/roles and approval paths must be verified from current ERP policies, not invented.
2. Choose authoritative source for existing companies. The current initial array and browser-local edited copies may disagree; neither should overwrite the other without an explicit owner-reviewed reconciliation.
3. Approve migration protocol: user-triggered export from each browser, checksum + dry-run import to a staging review table, duplicate review by stable ID and website, approval before promotion to central store; preserve original JSON and record who approved.
4. Define privacy and retention before importing contact/personal information. No contact records or browser-local data are pulled without specific consent.
5. Define operational audit: immutable create/edit/delete history with actor, timestamp, previous/new values, approval status; soft delete rather than irreversible deletion until approved.
6. Require server-side authorization for mutations and read controls. Never treat hiding UI controls or localStorage role flags as security.
7. Define bilingual data schema: category id, en/ar name, en/ar description, icon allowlist; company id, category id, en/ar name, website URL; record version and provenance; preserve unknown legacy fields in quarantined import for review rather than silently discard.

## SUGGESTED MIGRATION TEST MATRIX
- No stored data: bootstrap default directory, do not overwrite existing unrelated browser keys.
- Valid v1 data with custom company: migrate schema, preserve custom company and URL.
- Valid v2 data: idempotent render, no unwanted write.
- Historically blank SKOON URL: keep pending button, do not auto-inject canonical URL into user-owned record.
- Invalid/malformed JSON: safe default UI, no arbitrary delete; explicit non-destructive recovery flow for owners.
- Duplicate company or category ID: reject import with readable bilingual error; do not partially apply.
- Untrusted URLs: accept only http(s), disallow script URL injection; extra security validation required before production centralization.
- Browser storage quota denied: UI shows localized error and retains in-memory state; verify with executable test.
- Mixed Arabic/English strings: proper html dir and accessible names; visual screenshots.
- Multi-user edits: optimistic version conflict or server transaction, no silent last-writer-wins overwrites.

## EXECUTION / QA EVIDENCE
- Stage8 branch currently contains test-only changes; run https://github.com/kaqeelskoon/SKOON_Portal_v2_Bilingual_Design/actions/runs/43095906521 observed QUEUED from GitHub Actions UI, with no jobs/CI conclusion at time of this checkpoint. Mark QA HOLD; no functional fix or deployed change claimed.
- This document is a decision record only; no backend project created; no credentials retrieved; no user browser data read.

## STAGE STATUS
SOURCE PASS, RULES PASS, REFERENCES N/A, SCOPE PASS for observed directory code; QA HOLD for Stage8 new tests; LOCATION PASS QS; AUTHORITY HOLD on architecture and data import; RESUME PASS.

## RESUME
1. Check run 43095906521 and obtain exact job logs; only then close/revise the two legacy tests.
2. If passed, include additional negative-state cases from matrix on feature branch and execute before PR.
3. Obtain actual centralized authority/ERP source and user approval before modifying backend, schema, or authentication.
4. Retain previous production commit and Stage6 review untouched.
