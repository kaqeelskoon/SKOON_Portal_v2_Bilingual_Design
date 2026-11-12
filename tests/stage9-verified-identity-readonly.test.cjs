'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createIsolatedGateway}=require('./fixtures/stage9-verified-identity-readonly-gateway.cjs');
test('Stage 9 localhost verified identity read-only contract (mock only)',{timeout:30000},async t=>{
 const svc=await createIsolatedGateway().start();
 t.after(()=>svc.close());
 const path='/api/stage9/demo-company/';
 const request=async(company,token,options={})=>{
  const headers={...(options.headers||{})};
  if(token)headers.Authorization='Bearer '+token;
  const res=await fetch(svc.url+path+company,{method:options.method||'GET',headers,body:options.body});
  return {status:res.status,data:await res.json(),headers:res.headers};
 };
 await t.test('only a test-signed unexpired fixture user may read own synthetic company',async()=>{
  const token=svc.signForTest('fixture-user-A');
  const r=await request('fixture-company-A',token);
  assert.equal(r.status,200);assert.equal(r.data.company.id,'fixture-company-A');
  assert.equal(r.data.source,'SYNTHETIC_TEST_ONLY');
 });
 await t.test('identical verified session cannot read another company',async()=>{
  const r=await request('fixture-company-B',svc.signForTest('fixture-user-A'));
  assert.equal(r.status,403);assert.equal(r.data.error,'MEMBERSHIP_DENIED');
 });
 await t.test('missing, forged, altered and expired bearer proof denied',async()=>{
  const genuine=svc.signForTest('fixture-user-A');
  for(const token of [undefined,'fake.token',genuine.slice(0,-1)+'x',svc.signForTest('fixture-user-A',1)]) {
   const r=await request('fixture-company-A',token);
   assert.equal(r.status,401);
  }
 });
 await t.test('unmapped but correctly signed identity cannot access',async()=>{
  const r=await request('fixture-company-A',svc.signForTest('fixture-unknown'));
  assert.equal(r.status,403);
 });
 await t.test('client forged role, company and approval headers do not change membership',async()=>{
  const r=await request('fixture-company-B',svc.signForTest('fixture-user-A'),{headers:{
   'X-Role':'super_admin','X-Company-ID':'fixture-company-B','X-Approval':'true','X-Membership-Verified':'true'
  }});
  assert.equal(r.status,403);
 });
 await t.test('even verified member cannot write to synthetic fixture',async()=>{
  for(const method of ['POST','PUT','PATCH','DELETE']){
   const r=await request('fixture-company-A',svc.signForTest('fixture-user-A'),{
    method,headers:{'Content-Type':'application/json'},body:'{"name":"changed"}'});
   assert.equal(r.status,403);assert.equal(r.data.error,'WRITE_DISABLED');
  }
  const still=await request('fixture-company-A',svc.signForTest('fixture-user-A'));
  assert.equal(still.status,200);assert.equal(still.data.company.name,'Illustrative A');
 });
 await t.test('arbitrary CORS preflight does not open cross-site access',async()=>{
  const res=await fetch(svc.url+path+'fixture-company-A',{method:'OPTIONS',headers:{
    'Origin':'https://attacker.invalid','Access-Control-Request-Method':'POST'}});
  assert.equal(res.status,403);assert.equal(res.headers.get('access-control-allow-origin'),null);
 });
});
