# SKOON Plus Stage 9 — Production Database Access-Risk Checkpoint (READ ONLY)
Date: 2026-11-12 (Asia/Dubai)
Status: SECURITY HOLD — DECISION REQUIRED. No schema or grant changes performed.

## SOURCE
- Original governance `QS/governance/SKOON_AI_GOVERNANCE_MASTER_v1.0.md`, SGP-01 v1.0 (proposed) directly reviewed.
- Prior Stage9 QA/security checkpoint: `QS/SKOON_PLUS_2026-11-12_STAGE9_PROTOTYPE_QA_AND_SUPABASE_SECURITY.md`, reviewed.
- Direct Supabase live project via connected app: `skoon-apps-main`, id `eodxkayaukhoohbzkjdv`, PostgreSQL 17.
- PostgreSQL documentation: https://www.postgresql.org/docs/17/ddl-rowsecurity.html (RLS does not apply to TRUNCATE or REFERENCES).
- Supabase RLS documentation: https://supabase.com/docs/guides/database/postgres/row-level-security .

## RULES
SGP-01 §§2,6,7,8; no destructive edits to active database or customer/project data without approval. No invented scope, owner assignment or permission matrix.

## EXECUTION TRACE — Read-only queries only
1. `list_tables` previously returned `public.projects`, `public.clients`, `public.contractors`, each `rls_enabled=false`, `rows=0`.
2. `pg_class` + `pg_policy` checked `relrowsecurity=false`, `relforcerowsecurity=false`, policy_count=0 for all three. Each is an ordinary table (`relkind=r`).
3. `information_schema.role_table_grants` and `has_table_privilege` checked both `anon` and `authenticated`:
   - `SELECT=false, INSERT=false, UPDATE=false, DELETE=false`.
   - `TRUNCATE=true, REFERENCES=true, TRIGGER=true`.
   - grantor for listed privileges `postgres`, not grantable onward.
4. `has_schema_privilege` for both roles: `public` USAGE=true, CREATE=false.
5. `has_table_privilege` for `service_role`: SELECT, TRUNCATE, REFERENCES, TRIGGER all true (reported; not proposed for automatic revocation).
6. Referential constraints returned two relevant dependent mappings:
   - `public.contractor_offer_import_files.contractor_id` -> `public.contractors.id`, ON DELETE RESTRICT, ON UPDATE CASCADE.
   - `public.contractor_offer_import_requests.project_id` -> `public.projects.id`, ON DELETE RESTRICT, ON UPDATE CASCADE.
   Note this is a scoped foreign-key query, not proof of complete application dependencies.
7. `information_schema.triggers` on target three tables returned 0 active user-visible trigger rows.
8. `pg_attribute` exposed target column catalog. NO row values, credentials, or personal data retrieved.
9. No DDL, DML, migration or RLS changes applied. Before and after database permissions stayed unchanged by this work.

## RISK CLASSIFICATION
- Confirmed grants: `anon` and `authenticated` have TRUNCATE table privilege on three public-schema tables with schema USAGE. PostgreSQL RLS does not protect TRUNCATE.
- Do NOT claim a proven direct anonymous Data API exploit: REST endpoint behavior, Data API exposure and use of the credentials were not tested. The absence of SELECT/INSERT/UPDATE/DELETE grants already limits data operations.
- The three tables were reported 0 rows by connector; not a guarantee of their continued emptiness after inspection.
- Foreign keys and dependent import registers mandate impact review before changing privileges or replacing tables.

## PROPOSED CHANGE PLAN — NOT EXECUTED
First obtain explicit owner approval to remove the excessive grants after checking actual authenticated ERP workflow and application privileges. Proposed minimum-scope SQL, for review only:
```sql
REVOKE TRUNCATE ON TABLE public.projects, public.clients, public.contractors FROM anon, authenticated;
```
Separate review needed for `REFERENCES` and `TRIGGER`; do not revoke blindly. RLS enablement and row policies must derive from verified ERP authority model and are a different gate.

## REQUIRED POST-CHANGE QA (future, not performed)
- Before change: snapshot `has_table_privilege` for each target/table; identify dependent services.
- After authorized change: verify `TRUNCATE=false` for both roles (plus inherited memberships); recheck SELECT/INSERT/UPDATE/DELETE and existing `service_role` behavior, and confirm no regression in contractor offer import staging.
- Record exact SQL, timestamp, approver, before/after result and rollback strategy before release.

## STAGE9 CODE STATUS
Stage9 independent feature branch `skoon-plus/stage9-directory-admin-prototype-20261112`, QA exact head `b66b16a1fb4e0dffbfd99cde3faa8c7453a0dea0`.
PR #3 remains DRAFT and unmerged at https://github.com/kaqeelskoon/SKOON_Portal_v2_Bilingual_Design/pull/3 . The prototype has NO backend calls and no persistent local storage. Chromium QA run 43102992672 four PASS, ten images inspected.
Current production baseline remains 577803de82f8452dbd63c263048881ccffe3d8d8 from prior verified Vercel deployment.

## SOURCE / RULES / REFERENCES / QA / CHANGES / HOLD / CHECKPOINT
SOURCE PASS for listed sources and direct catalog queries; RULES PASS SGP-01; REFERENCES PASS official PostgreSQL17/Supabase; QA PASS for catalog verification, HOLD for real policy enforcement; CHANGES only internal QS checkpoint; AUTHORITY HOLD for privilege remediation, ERP roles, central write API and PR merge; CHECKPOINT saved here.
Resume: owner security approval after impact review, then live before/after verification. Do not re-run previously completed Stage9 prototype tests absent source changes.
