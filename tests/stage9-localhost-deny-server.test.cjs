'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {startLocalFixture}=require('./fixtures/stage9-localhost-deny-server.cjs');

const route='/api/stage9/directory';
const syntheticToken='NOT_A_REAL_TOKEN';
let service;
test('isolated Stage9 server negative controls', {timeout:30000}, async t=>{
  service=await startLocalFixture();
  t.after(async()=>{await service.close()});
  const send=async(path,opts={})=>{
    const response=await fetch(service.url+path,opts);
    const text=await response.text();
    return {response,body:JSON.parse(text)};
  };

  await t.test('unauthenticated GET cannot read directory',async()=>{
    const {response,body}=await send(route);
    assert.equal(response.status,403);
    assert.equal(body.error,'DENIED');
    assert.equal(body.canExecute,false);
    assert.equal(response.headers.get('cache-control'),'no-store, private');
  });

  await t.test('client-supplied approval and admin role cannot write',async()=>{
    for(const method of ['POST','PUT','PATCH','DELETE']){
      const {response,body}=await send(route+'/illustrative-company-A',{
        method,headers:{'Content-Type':'application/json','X-Role':'super_admin','X-Approval':'true','Authorization':'Bearer '+syntheticToken},
        body:JSON.stringify({role:'super_admin',approved:true,policyApproved:true,companyId:'illustrative-company-A',action:'publish'})
      });
      assert.equal(response.status,403,method);
      assert.equal(body.policyApproved,false,method);
    }
  });

  await t.test('a cross-company caller supplied tenant header never grants read',async()=>{
    const {response,body}=await send(route+'/illustrative-company-B',{
      headers:{'X-Company-ID':'illustrative-company-A','X-Membership-Verified':'true','X-Actor-ID':'actor-A'}
    });
    assert.equal(response.status,403);
    assert.equal(body.canExecute,false);
  });

  await t.test('fake user session cookies do not authenticate',async()=>{
    const {response,body}=await send(route,{
      headers:{Cookie:'session=FAKE_NOT_A_REAL_SESSION','X-User-ID':'synthetic-user'}
    });
    assert.equal(response.status,403);
    assert.equal(body.error,'DENIED');
  });

  await t.test('CORS remains closed to arbitrary origins, including preflight',async()=>{
    const {response}=await send(route,{
      method:'OPTIONS',
      headers:{Origin:'https://evil.example','Access-Control-Request-Method':'POST'}
    });
    assert.equal(response.status,403);
    assert.equal(response.headers.get('access-control-allow-origin'),null);
    assert.equal(response.headers.get('access-control-allow-credentials'),null);
  });

  await t.test('unknown paths are not exposed by test server',async()=>{
    const {response,body}=await send('/admin/secrets');
    assert.equal(response.status,404);
    assert.equal(body.error,'NOT_FOUND');
  });

  await t.test('the fixture binds loopback only and does not retain data',async()=>{
    assert.match(service.url,/^http:\/\/127\.0\.0\.1:\d+$/);
    const before=await send(route);
    await send(route,{method:'POST',headers:{'Content-Type':'application/json'},body:'{"id":"fixture"}'});
    const after=await send(route);
    assert.deepEqual(before.body,after.body);
    assert.equal(before.response.status,403);
    assert.equal(after.response.status,403);
  });
});
