-- SKOON Plus Stage9 — READ-ONLY security verification worksheet
-- SOURCE: live Supabase PostgreSQL catalog; 2026-11-12.
-- STATUS: INTERNAL QS / REFERENCE ONLY / NOT A MIGRATION.
-- This file does not change grants, RLS, schema, users or data.
-- Keep under QS, NOT 02_Tender.
-- 01: targeted ACL inventory and RLS status (no row data)
SELECT n.nspname AS schema_name, c.relname AS table_name,
       pg_get_userbyid(c.relowner) AS table_owner,
       c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS force_rls,
       (SELECT count(*) FROM pg_policy p WHERE p.polrelid = c.oid) AS policy_count,
       COALESCE(c.relacl::text,'DEFAULT_PRIVILEGES') AS explicit_acl
FROM pg_class c
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public'
  AND c.relname IN ('projects','clients','contractors')
  AND c.relkind IN ('r','p')
ORDER BY c.relname;

-- 02: effective rights for public API roles and service_role
SELECT c.relname AS table_name, r.rolname AS role,
       has_table_privilege(r.oid,c.oid,'SELECT') AS can_select,
       has_table_privilege(r.oid,c.oid,'INSERT') AS can_insert,
       has_table_privilege(r.oid,c.oid,'UPDATE') AS can_update,
       has_table_privilege(r.oid,c.oid,'DELETE') AS can_delete,
       has_table_privilege(r.oid,c.oid,'TRUNCATE') AS can_truncate,
       has_table_privilege(r.oid,c.oid,'REFERENCES') AS can_references,
       has_table_privilege(r.oid,c.oid,'TRIGGER') AS can_trigger
FROM pg_class c
JOIN pg_namespace n ON n.oid=c.relnamespace
CROSS JOIN pg_roles r
WHERE n.nspname='public'
  AND c.relname IN ('projects','clients','contractors')
  AND r.rolname IN ('anon','authenticated','service_role')
ORDER BY c.relname,r.rolname;

-- 03: relevant FK, PK and unique constraints
SELECT n.nspname AS schema_name,c.relname AS table_name,
       con.conname AS constraint_name,
       con.contype AS constraint_type,
       CASE WHEN con.contype='f' THEN con.confrelid::regclass::text ELSE NULL END AS referenced_table
FROM pg_constraint con
JOIN pg_class c ON c.oid=con.conrelid
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE con.conrelid IN ('public.projects'::regclass,
                        'public.clients'::regclass,
                        'public.contractors'::regclass)
   OR con.confrelid IN ('public.projects'::regclass,
                        'public.clients'::regclass,
                        'public.contractors'::regclass)
ORDER BY n.nspname,c.relname,con.conname;

-- 04: separate linter follow-up; not itself a claim of exploit
SELECT n.nspname AS schema_name, p.proname AS function_name,
       p.prosecdef AS security_definer,
       COALESCE(array_to_string(p.proconfig,','),'UNSET') AS function_settings,
       pg_get_function_identity_arguments(p.oid) AS signature
FROM pg_proc p
JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public'
  AND p.proname='set_platform_development_tasks_updated_at';

-- DO NOT ADD REVOKE, GRANT, ALTER TABLE or migration commands to this worksheet.
