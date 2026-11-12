'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {review}=require('../stage9-admin-prototype/access-boundary-review.js');
const request=()=>({actor:{id:'synthetic-actor-A'},action:'directory.edit',membership:{actorId:'synthetic-actor-A',companyId:'synthetic-company-A'},resource:{companyId:'synthetic-company-A'}});
test('all synthetic requests deny execution even when identifiers match',()=>{
 const r=review(request());
 assert.equal(r.decision,'DENY');assert.equal(r.canExecute,false);
 assert.equal(r.policyApproved,false);assert.ok(r.reasons.includes('SERVER_PROOF_UNAVAILABLE'));
});
test('missing identity and membership are denied',()=>{
 const r=review({action:'directory.edit',resource:{companyId:'company-A'}});
 assert.ok(r.reasons.includes('UNVERIFIED_IDENTITY'));
 assert.ok(r.reasons.includes('UNVERIFIED_MEMBERSHIP'));assert.equal(r.canExecute,false);
});
test('cross-company resource isolation is identified and denied',()=>{
 const q=request();q.resource.companyId='synthetic-company-B';
 const r=review(q);assert.ok(r.reasons.includes('CROSS_COMPANY'));assert.equal(r.decision,'DENY');
});
test('spoofed actor mismatch is identified and denied',()=>{
 const q=request();q.membership.actorId='different';
 const r=review(q);assert.ok(r.reasons.includes('ACTOR_MISMATCH'));assert.equal(r.canExecute,false);
});
test('client-provided authority booleans and role names cannot grant access',()=>{
 const q=request();q.role='super_admin';q.approved=true;q.authenticated=true;q.policyApproved=true;q.execution_allowed=true;
 const r=review(q);assert.equal(r.canExecute,false);assert.equal(r.policyApproved,false);
});
test('malformed, empty and no-actor inputs fail closed',()=>{
 for(const value of [null,undefined,[],{},'ok',42]){
  const r=review(value);assert.equal(r.decision,'DENY');assert.equal(r.canExecute,false);
 }
});
