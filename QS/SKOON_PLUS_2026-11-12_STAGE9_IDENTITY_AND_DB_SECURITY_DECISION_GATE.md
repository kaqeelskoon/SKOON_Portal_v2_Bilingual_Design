# SKOON Plus Stage 9 — Identity Decision and Privilege Remediation Gate
Date: 2026-11-12 Asia/Dubai
Status: DECISION PACKAGE — NOT AUTHORIZED FOR DEPLOYMENT.

## SOURCE / GOVERNANCE
- Directly re-read: `QS/governance/SKOON_AI_GOVERNANCE_MASTER_v1.0.md`, SGP-01 v1.0, 2026-10-27, status **Proposed**.
- Directly re-read: `QS/SKOON_PLUS_2026-11-12_STAGE9_LEGACY_AUTH_AND_CI_BOUNDARY_CHECKPOINT.md`.
- Existing historic Drive originals: original SKOON Plus root `https://drive.google.com/drive/folders/1skodQ2uof_k2LpYjfdlPhdQNpnTiTC6U`, historic foundation and 01_DATA_MAPPING_v0.1 (unapproved for production roles).
- Supabase connected project `skoon-apps-main`, ID `eodxkayaukhoohbzkjdv`, PostgreSQL 17, project status ACTIVE_HEALTHY, region ap-south-1.
- Vercel project `skoon.ai`, id `prj_gA3SUM9dacZvevLRnCYsli7ecWHR`; SSO protection enabled for all except custom domain deployments according to get_project.
- Official sources:
  - PostgreSQL 17 row security: https://www.postgresql.org/docs/17/ddl-rowsecurity.html
  - Supabase database security: https://supabase.com/docs/guides/api/securing-your-api
  - Supabase Auth tokens/RLS: https://supabase.com/docs/guides/auth/oauth-server/token-security
- This package is internal SKOON QS, NOT 02_Tender.

## VERIFIED STATUS / REASON FOR HOLD
1. Historic browser mock login at `kaqeelskoon/skoon-ai-portal` and `kaqeelskoon/skoonarchitecture-portal` README and app.js is not authoritative. App code includes hardcoded accounts and localStorage login state; example credentials are intentionally omitted here.
2. Read-only Supabase inspection found no SKOON-specific membership/role relation in public/auth whose relation name contains user, role, member, permission or tenant. This is search-scope limited; external identity and differently named tables are possible.
3. Repeated live read-only SQL on 2026-11-12 confirmed `public.projects`, `public.clients`, `public.contractors`: RLS disabled, 0 policies; `anon` and `authenticated` have TRUNCATE grants. No SQL mutation performed.
4. Earlier read-only FK inventory identified:
   - `public.contractor_offer_import_files.contractor_id -> public.contractors.id`;
   - `public.contractor_offer_import_requests.project_id -> public.projects.id`.
   Those are necessary dependencies to check; there may be other application dependencies.
5. `get_advisors(type=security)` on 2026-11-12 additionally showed 6 tables with RLS enabled and no policies (INFO) and one function with mutable search_path (WARN). No exploit shown.
6. Supabase branches result `branches=[]` in connected account; creating development branch can incur compute charges and is NOT authorized here.
7. Existing PR #3 remains DRAFT. Stage9 test fixtures are not real authentication.

## DECISION D1 — IDENTITY PROVIDER (OWNER TO APPROVE)
- Candidate: use existing Supabase Auth only if designated as official SKOON Plus identity provider after reviewing the existing ERP architecture. This is a **proposal**, not a conclusion or existing approved integration.
- Required source: owning ERP repository/service, identity issuer and audience, session validation API, token revocation/logout policy, MFA requirements, managed account lifecycle, assigned tech owner, current released revision.
- Explicitly prohibit trusting browser localStorage fields, role headers, `user_metadata` claims, URL-selected company IDs, or any `super_admin` label sent by a client.

## DECISION D2 — COMPANY MEMBERSHIP AND ACCESS (OWNER TO APPROVE)
Minimum conceptual contract **only**; not approved table names/permissions:
- authenticated subject ID issued by reviewed identity provider;
- backend-verified company membership with lifecycle status, start/end of validity and role reference;
- resource's actual company/tenant identifier resolved by trusted datastore;
- policy source version + decision log correlated to request;
- denial by default when membership/role/tenant is missing or expired.
- Define who may READ company directory drafts, PREPARE changes, APPROVE, PUBLISH, manage memberships, and roll back. These are distinct *decisions*, not assigned staff roles.
- Require explicit audit trace for all actual writes (actor, company, action, change, approval, time, correlation ID); preserve protected source data and version history.
- Require server-side authorization and database enforcement, with tests for cross-company reads/writes, revoked membership, forged metadata, replay and elevation.

## DECISION D3 — NARROW TRUNCATE REMEDIATION (REQUIRES APPROVAL)
Proposed procedure; **DO NOT EXECUTE** in production until actual ERP service impact checked and approval given.
1. Capture pre-state grants for anon/authenticated and privileged roles, target table counts, permission source/owner; snapshot dependency and migration ownership records. Do not dump customer data unnecessarily.
2. Validate no authorized job relies on anon/authenticated TRUNCATE for those tables; ensure actual insert/import/staging services have least privilege through a separate reviewed role.
3. First owner-approved change (narrow scope) is:
```sql
REVOKE TRUNCATE ON TABLE public.projects, public.clients, public.contractors
FROM anon, authenticated;
```
4. Verify after the change using **read-only** query:
```sql
SELECT c.relname AS table_name,
       has_table_privilege('anon', c.oid, 'TRUNCATE') AS anon_truncate,
       has_table_privilege('authenticated', c.oid, 'TRUNCATE') AS authenticated_truncate
FROM pg_class AS c JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname='public'
  AND c.relname IN ('projects','clients','contractors')
ORDER BY c.relname;
```
Both computed fields should be false; also check inherited privileges and re-run dependent import workflows. Record exact BEFORE/AFTER and service impact.
5. Independently review `REFERENCES` and `TRIGGER` grants and RLS; enabling RLS alone does NOT protect TRUNCATE. Design RLS only after authoritative tenant/owner model and service testing.
6. Rollback (grant reintroduction) is NOT automatic and requires explicit incident/impact authorization. Do not preserve harmful permissions simply to meet a test green status.

## DECISION D4 — STAGING/RELEASE
- Use isolated private staging DB/project only after cost/owner authorization and source schema approval; no synthetic secrets committed.
- Implement official auth provider integration; do NOT reuse the in-memory ephemeral HMAC mock as production auth.
- Write integration tests on staged actual role/member policies and audit changes; prioritize negative cross-company/regression checks and backup/reconciliation.
- Owner approves staged QA and visual results before production migration and publication.
- Keep Vercel preview protection enabled until an approved access path is available.
- Stage6 Eslam UI review and Stage9 platform security remain separated.

## QA / EXECUTION TRACE
- No changes applied to GitHub production main, Vercel production settings, Supabase schema, policy, grants, clients, contractors or projects this phase.
- Read-only project/branch query: `Supabase.list_branches` returned empty array; `Supabase.get_project` ACTIVE_HEALTHY.
- Read-only `Vercel.get_project` showed preview SSO enabled.
- Existing Stage9 exact source test evidence (unchanged): CI run 43177245097, 40 PASS/0 FAIL for isolated prototype only, see prior checkpoint.
- This document is a decision package; it is NOT proof an ERP security model is operational or remediated.

## SOURCE / RULES / REFERENCES / QA / CHANGES / HOLD / CHECKPOINT
SOURCE PASS for listed live sources; RULES SGP-01 proposed (not enforced); REFERENCES official PostgreSQL and Supabase; QA catalog/metadata read-only PASS; CHANGES internal governance decision document only; HOLD D1 official identity provider, D2 membership/access, D3 production privilege remediation, D4 staging cost/release; CHECKPOINT this file.
RESUME: obtain documented D1/D2 approvals, service dependency evidence and separately scoped D3 authorization. Do not repeat the same synthetic login tests in lieu of real source access.
