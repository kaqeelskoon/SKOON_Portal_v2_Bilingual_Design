'use strict';
/**
 * Stage9 source boundary regression gate (test only).
 * Prevents Stage9 mock UI drifting into an undocumented authentication,
 * remote data access, hardcoded account or deployed test server.
 * These static checks do not replace security review or production pen-testing.
 */
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'stage9-admin-prototype/app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'stage9-admin-prototype/index.html'),'utf8');
const preflight=fs.readFileSync(path.join(root,'stage9-admin-prototype/directory-dry-run.js'),'utf8');
const boundary=fs.readFileSync(path.join(root,'stage9-admin-prototype/access-boundary-review.js'),'utf8');
const workflow=fs.readFileSync(path.join(root,'.github/workflows/skoon-plus-stage9-prototype-qa.yml'),'utf8');

test('browser UI has no remote request APIs or client-side authentication/session persistence',()=>{
 for(const [filename,src] of [['app.js',app],['directory-dry-run.js',preflight],['access-boundary-review.js',boundary]]){
  for(const forbidden of [/\bfetch\s*\(/,/\bXMLHttpRequest\b/,/\bWebSocket\b/,/\blocalStorage\s*[.\[]/,/\bsessionStorage\s*[.\[]/,/\bdocument\.cookie\b/,/\bindexedDB\b/,/\b(?:eval|Function)\s*\(/]){
   assert.doesNotMatch(src,forbidden,filename+' introduced restricted browser facility '+forbidden);
  }
 }
});

test('prototype webpage loads only same-directory static app modules; no test server bundle',()=>{
 const scripts=[...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(scripts,['./directory-dry-run.js','./access-boundary-review.js','./app.js']);
 for(const script of scripts){
  assert.ok(fs.existsSync(path.resolve(root,'stage9-admin-prototype',script)),script);
 }
 assert.doesNotMatch(html,/<form\b|<input\b[^>]*type="password"/i);
 assert.match(html,/id="notice"/);
});

test('source never adds a hardcoded browser password field or demo login',()=>{
 for(const [filename,src] of [['html',html],['app',app]]){
  assert.doesNotMatch(src,/(?:password|passwd|pwd)\s*[:=]\s*['"`][^'"`]+['"`]/i,filename);
  assert.doesNotMatch(src,/employeeAccounts\s*=|clientAccounts\s*=|authService\.login\s*\(/i,filename);
 }
});

test('dry-run and client boundary remain non-authorizing',()=>{
 assert.match(preflight,/canExecuteImport:\s*false/);
 assert.match(preflight,/writesPerformed:\s*false/);
 assert.match(preflight,/approvalVerified:\s*false/);
 assert.match(boundary,/canExecute:\s*false/);
 assert.match(boundary,/policyApproved:\s*false/);
});

test('CI stage9 remains branch scoped and localhost-only, no production deployment step',()=>{
 assert.match(workflow,/skoon-plus\/stage9-directory-admin-prototype-20261112/);
 assert.match(workflow,/node --test tests\/stage9-verified-identity-readonly\.test\.cjs/);
 assert.doesNotMatch(workflow,/vercel\s+(?:deploy|--prod)|supabase\s+(?:db|functions)|curl\s+https?:\/\//i);
 assert.doesNotMatch(workflow,/permissions:\s*\n\s*contents:\s*write/);
});
