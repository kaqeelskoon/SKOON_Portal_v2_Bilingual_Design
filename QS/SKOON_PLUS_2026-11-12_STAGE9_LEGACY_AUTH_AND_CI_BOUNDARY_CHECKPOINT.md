# SKOON Plus Stage 9 — Legacy Login Exposure Triage and Source Boundary CI
Date: 2026-11-12 Asia/Dubai
Status: SOURCE BOUNDARY QA PASS; REAL IDENTITY/AUTHORITY + DATABASE SECURITY HOLD; NO PRODUCTION MODIFICATION.

## SOURCE
1. SGP-01 v1.0 proposed governance `QS/governance/SKOON_AI_GOVERNANCE_MASTER_v1.0.md` and prior `QS/SKOON_PLUS_2026-11-12_STAGE9_IDENTITY_SOURCE_AND_SIGNED_SESSION_QA.md`, directly read in this phase.
2. Original Google Drive SKOON Plus root `https://drive.google.com/drive/folders/1skodQ2uof_k2LpYjfdlPhdQNpnTiTC6U`; previously reviewed original source/data mapping and exploratory ERP module spec remain historical, not approved role matrix.
3. GitHub historical public repos `kaqeelskoon/skoon-ai-portal`, `kaqeelskoon/skoonarchitecture-portal`, `main/README.md` and `main/app.js`. Both have source SHA `ad1b4efe1abffe2b98022970b696f4219ede5d8d` for app.js. Verified location: `app.js` lines 207 (employeeAccounts), 216 (clientAccounts), 410–476 (authService/account selection/browser localStorage). Both README files describe the login as MOCK and include example credential values; intentionally not repeated in this checkpoint. This constitutes a **source-code risk**, not proof the same mock credentials are active for a public service or that exploitation occurred.
4. Vercel connected-account `list_projects` returned two projects: `skoon.ai` id `prj_gA3SUM9dacZvevLRnCYsli7ecWHR` and `skoon-plus-stage6-review` id `prj_C7LbjapkaRrgR9WTvrSA2oUBB43v`. No independently named legacy portal project was found **in this account's returned project list**; this is NOT proof of no external hosting.
5. Supabase production `skoon-apps-main` project id `eodxkayaukhoohbzkjdv`. Direct read-only SQL confirmed AGAIN on 2026-11-12: public.projects, public.clients, public.contractors remain rls_enabled=false, policy_count=0, anon_truncate=true, authenticated_truncate=true. No SQL mutation performed. `get_advisors(type=security)` separately flagged 6 RLS-enabled tables without policies (INFO) and 1 public function with mutable search_path (WARN); those are additional catalogue warnings, not demonstrated exploits. Details provided by Supabase at time of query.
6. Supabase product skill directly reviewed. `search_docs` returned `Token Security and Row Level Security`: https://supabase.com/docs/guides/auth/oauth-server/token-security . The official guide distinguishes token scopes from actual database table rights; client claims alone are not authorization.

## RULES
SGP-01 §§1,2,6,7,8; preserve originals, keep QA in QS, no authentication invented from role names or browser-set flags. No release without real identity provider and approved tenant policy; no Supabase changes before owner approval.

## CHANGES / BEFORE-AFTER TRACE
Previous Stage9 tested branch HEAD `847da6364416c874caf71dafff2658349866bfaf` had 35 passing test records and existing non-operational visual mock.
- Added `tests/stage9-source-boundary.test.cjs` — static regression gate checks browser-facing Stage9 source: no fetch/XHR/WebSocket/persistent session/cookie APIs, no legacy hardcoded accounts/login/password form, scripts only local static modules, no authorization success claims, CI remains branch-specific without production deployment.
- Updated `.github/workflows/skoon-plus-stage9-prototype-qa.yml` to execute static source gate before browser suite.
- New exact head `4e3d25c0a7c9fe9229dddaf6113d4892e82263aa`. No change to Stage9 UI or underlying production Build Hub source; no user/tenant data accessed.

## EXECUTED QA
- GitHub Actions run https://github.com/kaqeelskoon/SKOON_Portal_v2_Bilingual_Design/actions/runs/43177245097 for exact SHA `4e3d25c0a7c9fe9229dddaf6113d4892e82263aa`; job ID 131044367538 conclusion success.
- Direct logs: offline dry-run 9 PASS, synthetic boundary 6 PASS, all-deny localhost HTTP 8 PASS, synthetic signed-session read-only 8 PASS, new source boundary 5 PASS, Chromium bilingual browser 4 PASS. **40 Node test records, 0 fail** (includes parent records in HTTP test suites; not 40 independent attack scenarios).
- Existing browser interface files are unchanged, therefore screenshot review from earlier QA checkpoint remains applicable to that same source. New GitHub artifact ID 13924158984 reports 20 PNGs, digest `sha256:bdee516bb73c9db42305b8fa1c9ec795d756886ca201ba733e4108d959cd4a83`. Do not claim fresh 20-screenshot visual inspection this phase.
- No programmatic test of historic portal's actual online deployment status; Vercel inventory only.

## LIMITS AND REQUIRED DECISIONS
1. Legacy public repository mock login needs hosting inventory and security decision. Do NOT copy old demo username/password values or assume they grant live access. If credentials were reused in live services, owner should rotate/revoke after validation; this is not yet confirmed.
2. Actual SKOON ERP role/tenant membership and identity provider still not verified/approved; never substitute historic mock account list.
3. Supabase three-table excess TRUNCATE grants and disabled RLS unchanged: separate dependency-checked remediation approval HOLD. Other 6+1 linter advisories require review but not unreviewed production mutation.
4. PR #3 stays Draft unmerged; production unchanged. Eslam Stage6 independent work unchanged.

## SOURCE / RULES / REFERENCES / QA / CHANGES / HOLDS / CHECKPOINT
SOURCE: listed Github, Drive, Supabase, Vercel originals; RULES: SGP-01 v1.0 proposed; REFERENCES: named GitHub paths/lines, Supabase direct queries/doc; QA: exact 40 PASS/0 FAIL for isolated mock and branch-only CI; CHANGES: only Stage9 source boundary test+workflow and internal QS; HOLDS: live identity, credential exposure verification, DB grants/RLS, authorized release; CHECKPOINT: this document.
RESUME: obtain approved ERP identity/tenant source and security authorization, inventory other hosting if account access provided. Do not add more duplicate mock authentication frameworks or repeat passed tests without changed source.
