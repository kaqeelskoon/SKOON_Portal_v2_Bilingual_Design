# SKOON Plus Stage 9 — Prototype QA & Supabase least-privilege audit
Date: 2026-11-12 Asia/Dubai
Status: STAGE9 PROTOTYPE QA PASS (isolated mock only); REAL AUTH/DATABASE HOLD; NO PRODUCTION CHANGE.

## SOURCE
- Original repository governance: QS/governance/SKOON_AI_GOVERNANCE_MASTER_v1.0.md, SGP-01 v1.0 proposed, read before this task.
- Google Drive root SKOON Plus: https://drive.google.com/drive/folders/1skodQ2uof_k2LpYjfdlPhdQNpnTiTC6U. Historical originals 00_SKOON_PLUS_START_HERE.md (Drive 1fTUBX5uVcfox_nc0o5vNB9r8L96TDd4t) and 01_DATA_MAPPING_v0.1.md (Drive 1zdfKuWYT_F4XgbhkCvEO9FAnHAPrlVLf); the latter explicitly says local core.py is not authoritative production authorization and company context must be server-side.
- GitHub production baseline: 577803de82f8452dbd63c263048881ccffe3d8d8.
- Live Supabase account project list returned ONE project id `eodxkayaukhoohbzkjdv`, name `skoon-apps-main`, status ACTIVE_HEALTHY, PostgreSQL 17.
- Official references: PostgreSQL 17 RLS https://www.postgresql.org/docs/17/ddl-rowsecurity.html (TRUNCATE and REFERENCES not subject to row security); Supabase RLS https://supabase.com/docs/guides/database/postgres/row-level-security and Securing API https://supabase.com/docs/guides/api/securing-your-api .

## RULES
SGP-01 §§2/6/7/8, preserve originals, keep QA in QS, no backend writes without approved authorization design. Treat FIDIC and construction authority clauses N/A for software prototype.

## SECURITY SOURCE — VERIFIED DIRECT SQL (READ ONLY)
`list_tables(project_id=eodxkayaukhoohbzkjdv, schemas=['public'])` reported `public.projects`, `public.clients`, `public.contractors`, each RLS disabled, rows=0; advisory `rls_disabled` CRITICAL.
Executed read-only PostgreSQL privilege query using `has_table_privilege(r.oid,c.oid, privilege)` for roles `anon` and `authenticated` on these exact tables:
- SELECT=false, INSERT=false, UPDATE=false, DELETE=false.
- TRUNCATE=true for BOTH roles, all THREE tables.
`information_schema.role_table_grants` also listed REFERENCES, TRIGGER, TRUNCATE grants for those roles/tables.
NOTE: `TRUNCATE` is NOT restricted by PostgreSQL RLS (official PostgreSQL 17 docs). Enabling RLS alone will NOT fix the TRUNCATE grant. Lack of SELECT/INSERT/UPDATE/DELETE grants means the Supabase advisory's generic wording 'fully exposed readable/writable' does not precisely describe the current specific role privileges; do not claim a demonstrated anonymous API exploit. No direct API execution performed. Effective exploitation/exposure depends on API surface, schema usage and other controls; it is a genuine excessive grant even with zero rows.
Recommended remediation for owner-reviewed change plan (NOT EXECUTED):
```sql
-- Proposed narrow privilege correction; require owner approval / dependency review first.
REVOKE TRUNCATE ON TABLE public.projects, public.clients, public.contractors FROM anon, authenticated;
-- Consider removal of TRIGGER and REFERENCES after dependency assessment.
-- Enable RLS and exact read/write policies only after checking production consumers.
```
No Supabase migration, data mutation, grant or RLS change executed.

## STAGE9 ISOLATED CODE CHANGE
- Created feature branch `skoon-plus/stage9-directory-admin-prototype-20261112` from main SHA `577803de82f8452dbd63c263048881ccffe3d8d8`.
- Exact QA tested head `b66b16a1fb4e0dffbfd99cde3faa8c7453a0dea0`.
- Four added files only vs production main:
  1. `stage9-admin-prototype/index.html` -- static bilingual layout.
  2. `stage9-admin-prototype/app.js` -- local in-memory demonstration entries, language toggle, tab navigation, search, no persistence or remote calls.
  3. `tests/stage9-admin-prototype.test.cjs` -- original source non-operational checks and Chromium tests desktop/mobile EN/AR, search, RTL, overflow.
  4. `.github/workflows/skoon-plus-stage9-prototype-qa.yml` -- runs tests and uploads QA-only screenshots.
- Contents label itself DESIGN PROTOTYPE ONLY; proposed roles explicitly unapproved, all functional changes disabled/not implemented.
- No client data, API credentials, authentication, database connection or production code changed.
- Vercel branch preview deployment `dpl_Ek6MhDBzQ8mDjqS8NAYrJUPMoVNJ` state READY but read-only TinyFish hit Vercel SSO protection: https://agent.tinyfish.ai/runs/716d1682-5bf1-4e82-b6e6-994750eadc15 ; not a browser UI defect; direct URL access HOLD, protection not altered.

## QA EXECUTION / VISUAL EVIDENCE
GitHub Actions run https://github.com/kaqeelskoon/SKOON_Portal_v2_Bilingual_Design/actions/runs/43102992672 at exact SHA b66b16a1fb4e0dffbfd99cde3faa8c7453a0dea0.
Job stage9-browser-qa ID 130798964114: completed success; direct job logs `# tests 4`, `# pass 4`, `# fail 0`.
Browser coverage desktop 1440x900 and mobile 390x844, EN+AR switch, RTL and four tabs, search and no-match, four role proposals, five migration stages, horizontal overflow and JS pageerror assertions.
Artifact https://github.com/kaqeelskoon/SKOON_Portal_v2_Bilingual_Design/actions/runs/43102992672/artifacts/13893445270 contains 10 PNGs (overview EN/AR desktop+mobile, directory/access/migration AR desktop+mobile). SHA256 `8f9f6dac6bd42472aa71a0d1cc87459100f6741b91a0c45860cda8a7d45401d5` matched locally after download. Local file `/mnt/data/stage9-admin-qa.zip`; visual contact sheet `/mnt/data/stage9-qa-contact.jpg` inspected; no confirmed visual defect within these 10 images.
No testing of multi-tenant backend access (none exists), no real login session, and no signed security acceptance.

## PR / RELEASE
PR #3 https://github.com/kaqeelskoon/SKOON_Portal_v2_Bilingual_Design/pull/3 created DRAFT, head b66b16a..., base main. NO MERGE. Existing production Stage8 unaffected.
Proof-of-concept browser UI is in a protected Vercel preview; not publicly navigable without the deployment's authorized SSO.

## HOLD / RESUME
- Security: production Supabase three-table excessive TRUNCATE grants; immediate owner-authorized plan after dependency check; enabling RLS alone does not resolve TRUNCATE.
- Identity: need current authoritative ERP roles/tenants/memberships and access-control service contract, not historical local SQLite mock.
- Functional: real backend, database, audit ledger, authentication, server-side authorization and migration all NOT implemented.
- UX: Eslam Stage6 feedback pending separately.
- Release: PR3 stays Draft and unmerged; review prototype design, confirm source of truth, and test any real backend against deny-by-default policies before implementation.

## GATES
SOURCE PASS (listed sources); RULES PASS SGP-01; REFERENCES PASS for PostgreSQL/Supabase docs; QA PASS for isolated mock only; VISUAL PASS for inspected captures; LOCATION PASS QS; AUTHORITY HOLD for backend/security changes; RESUME PASS.
