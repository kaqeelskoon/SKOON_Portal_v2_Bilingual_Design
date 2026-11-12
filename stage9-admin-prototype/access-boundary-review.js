'use strict';
/*
  Stage9 — synthetic permission-boundary REVIEW ONLY.
  Not a server policy, token verifier, authenticated API or authority source.
  All examples must be denied until ERP policy, identity, tenancy and
  approval proof are independently established outside this browser.
*/
(function(root,factory){
 const api=factory();
 if(typeof module==='object' && module.exports) module.exports=api;
 else root.SkoonAccessReview=api;
}(typeof globalThis!=='undefined'?globalThis:this,function(){
 const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
 const validText=s=>typeof s==='string'&&s.length>0&&s.length<=160;
 function review(request){
  const reasons=[];
  if(!record(request)){return Object.freeze({decision:'DENY',canExecute:false,policyApproved:false,reasons:Object.freeze(['INVALID_REQUEST'])})}
  if(!validText(request.action)) reasons.push('MISSING_ACTION');
  if(!record(request.actor)||!validText(request.actor.id)) reasons.push('UNVERIFIED_IDENTITY');
  if(!record(request.resource)||!validText(request.resource.companyId)) reasons.push('UNVERIFIED_RESOURCE');
  if(!record(request.membership)||!validText(request.membership.companyId)) reasons.push('UNVERIFIED_MEMBERSHIP');
  if(record(request.actor)&&record(request.membership)&&validText(request.actor.id)&&request.actor.id!==request.membership.actorId) reasons.push('ACTOR_MISMATCH');
  if(record(request.resource)&&record(request.membership)&&validText(request.resource.companyId)&&validText(request.membership.companyId)&&request.resource.companyId!==request.membership.companyId) reasons.push('CROSS_COMPANY');
  // Even a syntactically well-formed sample request never proves authority.
  reasons.push('ERP_POLICY_NOT_APPROVED');
  reasons.push('SERVER_PROOF_UNAVAILABLE');
  return Object.freeze({decision:'DENY',canExecute:false,policyApproved:false,reasons:Object.freeze(reasons)});
 }
 return Object.freeze({review});
}));
