'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {examine}=require('../stage9-admin-prototype/directory-dry-run.js');
const sample=(options={})=>({
 schemaVersion:2,
 categories:[{id:'consultants',en:'Consultants',ar:'الاستشاريون'}],
 companies:[{id:'studio',category:'consultants',en:'Sample Studio',ar:'مكتب تجريبي',url:'https://example.test/'}],
 ...options
});
function has(result,code){return result.findings.some(f=>f.code===code)}
test('Stage9 dry run never performs writes or claims authorization',()=>{
 const data=JSON.stringify(sample());const r=examine(data);
 assert.equal(r.canExecuteImport,false);assert.equal(r.writesPerformed,false);
 assert.equal(r.approvalVerified,false);assert.equal(r.status,'REVIEW_REQUIRED');
 assert.equal(r.counts.companies,1);assert.equal(has(r,'TARGET_NOT_VERIFIED'),true);
 assert.equal(has(r,'AUTHORIZATION_NOT_VERIFIED'),true);
});
test('Stage9 migration of legacy v1 stays review-only',()=>{
 const r=examine(JSON.stringify(sample({schemaVersion:1})),{categories:[],companies:[]});
 assert.equal(r.status,'REVIEW_REQUIRED');assert.equal(has(r,'LEGACY_SCHEMA'),true);
});
test('Stage9 unsafe URL is rejected',()=>{
 for(const url of ['javascript:alert(1)','data:text/html,test','https://user:pass@example.test/','invalid-url']) {
  const d=sample();d.companies[0].url=url;const r=examine(JSON.stringify(d));
  assert.equal(r.status,'BLOCKED',url);assert.equal(r.canExecuteImport,false);
 }
});
test('Stage9 corrupted, future and oversized inputs fail closed',()=>{
 for(const source of ['{bad json','null','[]',JSON.stringify(sample({schemaVersion:3})),
  ' '.repeat(1024*1024+1)]) {
  const r=examine(source);assert.equal(r.status,'BLOCKED');
 }
});
test('Stage9 duplicate ids, unknown company category and invalid company fields are blocked',()=>{
 const x=sample();x.companies.push({...x.companies[0]});
 assert.equal(has(examine(JSON.stringify(x)),'COMPANY_DUPLICATE_ID'),true);
 x.companies[1].id='other';x.companies[1].category='missing';
 assert.equal(has(examine(JSON.stringify(x)),'COMPANY_INVALID'),true);
 const y=sample();y.categories.push({...y.categories[0]});
 assert.equal(has(examine(JSON.stringify(y)),'CATEGORY_DUPLICATE_ID'),true);
});
test('Stage9 target ID conflicts require human review without mutation',()=>{
 const source=sample(),target=sample();
 const sourceBefore=JSON.stringify(source),targetBefore=JSON.stringify(target);
 const result=examine(sourceBefore,target);
 assert.equal(has(result,'EXISTING_COMPANY_ID'),true);
 assert.equal(has(result,'EXISTING_CATEGORY_ID'),true);
 assert.equal(result.canExecuteImport,false);
 assert.equal(JSON.stringify(source),sourceBefore);
 assert.equal(JSON.stringify(target),targetBefore);
});
test('Stage9 no target or invalid target cannot accidentally grant approval',()=>{
 const noTarget=examine(JSON.stringify(sample()));
 const badTarget=examine(JSON.stringify(sample()),{categories:null,companies:[]});
 assert.equal(noTarget.approvalVerified,false);assert.equal(noTarget.canExecuteImport,false);
 assert.equal(badTarget.status,'BLOCKED');assert.equal(has(badTarget,'TARGET_SHAPE'),true);
});
test('Stage9 possible duplicate names and URLs are flagged without hard deletion',()=>{
 const x=sample();x.companies.push({id:'other',category:'consultants',en:'  SAMPLE   STUDIO ',ar:'مكتب آخر',url:'https://example.test/'});
 const result=examine(JSON.stringify(x),{categories:[],companies:[]});
 assert.equal(has(result,'POSSIBLE_DUPLICATE_NAME'),true);
 assert.equal(has(result,'POSSIBLE_DUPLICATE_URL'),true);
 assert.equal(result.canExecuteImport,false);
});
test('Stage9 rejects prototype-like ids and allows blank URL only for review',()=>{
 const p=sample();p.companies[0].id='__proto__';
 assert.equal(examine(JSON.stringify(p)).status,'BLOCKED');
 p.companies[0].id='studio';p.companies[0].url='';
 assert.equal(examine(JSON.stringify(p)).status,'REVIEW_REQUIRED');
});
