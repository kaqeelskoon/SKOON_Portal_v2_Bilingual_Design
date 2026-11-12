# SKOON Plus Stage 9 — Scoped Security Change Handoff and Stop-Go Gate
Date: 2026-11-12 Asia/Dubai
Classification: INTERNAL QS / PROPOSAL ONLY / NO PRODUCTION CHANGE
Status: TECHNICAL EVIDENCE COLLECTED; AUTHORIZATION & INTEGRATION TEST HOLD.

## 1 SOURCE
- Canonical governance: `QS/governance/SKOON_AI_GOVERNANCE_MASTER_v1.0.md`, SGP-01 v1.0 proposed, 2026-10-27, directly consulted.
- Previous decision document: `QS/SKOON_PLUS_2026-11-12_STAGE9_IDENTITY_AND_DB_SECURITY_DECISION_GATE.md`, directly consulted.
- Live `skoon-apps-main` Supabase production PostgreSQL: project id `eodxkayaukhoohbzkjdv`. Queries were READ ONLY; no customer records accessed.
- Exact reproducible read-only inventory file: `QS/security/SKOON_PLUS_STAGE9_READ_ONLY_PRIVILEGE_CHECKS.sql` (this branch).
- Official applicable source: PostgreSQL 17 Row Security Policies https://www.postgresql.org/docs/17/ddl-rowsecurity.html (TRUNCATE and REFERENCES not subject to RLS). Supabase DB security https://supabase.com/docs/guides/api/securing-your-api (table grants separate from RLS).
- Current production `skoon.ai` Vercel main SHA prior verified `577803de82f8452dbd63c263048881ccffe3d8d8`; current Stage9 mock PR #3 remains unmerged.

## 2 VERIFIED DATABASE CATALOG — ON THIS TURN
`pg_class` + `pg_namespace` + `relacl` returns:
- `public.clients`: owner postgres, RLS=false, FORCE RLS=false; explicit ACL `{postgres=arwdDxtm/postgres,anon=Dxtm/postgres,authenticated=Dxtm/postgres,service_role=arwdDxtm/postgres}`
- `public.contractors`: same observed ACL & RLS state.
- `public.projects`: same observed ACL & RLS state.
- For BOTH `anon` and `authenticated` on all three: SELECT=false, INSERT=false, UPDATE=false, DELETE=false, TRUNCATE=true, REFERENCES=true, TRIGGER=true.
- `service_role` effective SELECT/INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER=true. **Do not expose service_role to browser.**
- Constraint catalog: `public.contractor_offer_import_files_contractor_id_fkey` references `public.contractors`; `public.contractor_offer_import_requests_project_id_fkey` references `public.projects`. Primary keys on all three and `projects_project_code_key` unique constraint. This inventory is DATABASE-FK ONLY; it cannot prove absence of application-level consumers.
- `public.set_platform_development_tasks_updated_at()`: `security_definer=false`, `proconfig=(unset)`. Supabase linter's mutable search_path warning requires separate source review, not an automatic change.
- No SQL DDL/DML executed; before/after database grants remain untouched.

## 3 PRIORITY / RISK INTERPRETATION
- **Confirmed excess privileges:** anon/authenticated have direct TRUNCATE / TRIGGER / REFERENCES grants on target tables. PostgreSQL RLS does not limit TRUNCATE. This is a legitimate privilege review finding, not a proven anonymous REST endpoint exploit; a Data API or other SQL-capable execution path would be necessary to assess external exploitability.
- **Separate RLS HOLD:** RLS disabled on the 3 tables. SELECT/INSERT/UPDATE/DELETE are currently denied to anon/authenticated, reducing immediate direct data exposure through those roles. Do not open them before membership policy exists.
- **Identity HOLD:** existing legacy browser mock login is not a trusted ERP identity provider; the official tenant/membership and permission source remains unverified.
- **Schema dependency HOLD:** contractor import service behavior and other consumers must be independently verified before privilege changes.

## 4 PROPOSED CHANGE REQUEST CR-01 — NOT EXECUTED
**Scope:** remove only excess TRUNCATE from anon/authenticated on precisely the three target tables.
**Preconditions:** named authorized owner, maintenance/change window, owner-approved affected services list, repeatable baseline query, impact test/rollback decision, and explicit permission to execute. Existing request to “continue” has not authorized a production security change.
**Proposed statement (for approval ONLY):**
```sql
REVOKE TRUNCATE ON TABLE public.projects, public.clients, public.contractors
  FROM anon, authenticated;
```
**Not included:** RLS activation, row policies, removal of TRIGGER or REFERENCES, any service_role modification, schema changes or data edits.
**Expected narrow post-condition:** has_table_privilege('anon', each target, 'TRUNCATE') = false AND same for authenticated. Query after change; if inherited grants still provide access, hold/escalate rather than claim success.
**Regression:** authorized contractor import flows and protected service_role operations unchanged in isolated tests; no blanket grant of SELECT or table authorization.
**Rollback:** requires owner to decide independently based on monitored operational impact; NOT auto-grant broad privileges.
**Release gate:** without actual before/after permission query and service regression evidence, status remains HOLD.

## 5 PROPOSED STAGING AUTH MODEL — NOT IMPLEMENTED
**D1:** choose approved ERP identity provider; verify issuer/audience, token signature, session state/revocation, expiry, MFA/access provisioning. Current localhost HMAC fixture is only testing.
**D2:** source-of-truth membership linking authenticated subject to company, expiry/status and role; resource tenant resolved on server; default deny; distinguish read draft, prepare, approve, publish, manage membership.
**D3:** create private staging after cost/owner approval; test real policies and cross-company denied operations plus authorized paths; audit trail, backups and rollback.
**D4:** after owner signoff only, separate release from Eslam's Stage6 UI feedback.

## 6 QA / EXECUTION / COVERAGE
- Scope checked: 3 named tables and relevant catalog constraints, and 1 linter-flagged function. Tested schema privilege metadata only; no actual PostgREST call, real user session, or client data read.
- Read-only worksheet committed: `QS/security/SKOON_PLUS_STAGE9_READ_ONLY_PRIVILEGE_CHECKS.sql`. Query forms match executed catalog queries; worksheet is NOT a migration.
- Existing Stage9 test-only CI earlier passed 40 test records on HEAD `4e3d25c0a7c9fe9229dddaf6113d4892e82263aa`, https://github.com/kaqeelskoon/SKOON_Portal_v2_Bilingual_Design/actions/runs/43177245097 ; no new code changes or new CI claim this phase.
- Evidence of browser/visual unchanged; no new visual defect asserted and no unauthorized deployment.

## 7 SOURCE / RULES / REFERENCES / QA / CHANGES / REMAINING HOLD / CHECKPOINT
SOURCE PASS in specified scope. RULES SGP-01 proposed. REFERENCES exact Postgres docs, actual ACL, constraints and source SQL. QA scoped read-only catalog verification PASS; real permission remediation QA HOLD. CHANGES two internal QS files only. HOLDS production security approval, ERP role provider, staging environment/cost, full dependency test and PR #3 merge. CHECKPOINT this file, resume from sections 4–5 without repeating previous QA.
