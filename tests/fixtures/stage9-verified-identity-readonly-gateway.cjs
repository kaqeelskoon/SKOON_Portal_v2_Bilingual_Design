'use strict';
/*
 * Stage 9 test fixture ONLY.
 * Proof of concept for server-verifiable identity + independently held membership.
 * NOT production JWT, auth provider integration, ERP policy, or a published endpoint.
 * The ephemeral HMAC key and all data are generated only inside a localhost test.
 */
const {createHmac,randomBytes,timingSafeEqual}=require('node:crypto');
const http=require('node:http');
const b64=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
const parse=x=>JSON.parse(Buffer.from(x,'base64url').toString('utf8'));
const constantEq=(a,b)=>{
 const ab=Buffer.from(a),bb=Buffer.from(b);
 return ab.length===bb.length&&timingSafeEqual(ab,bb);
};
function createIsolatedGateway(){
 const key=randomBytes(32), issuer='stage9-test-only', audience='stage9-local-test';
 const membership=new Map([['fixture-user-A',new Set(['fixture-company-A'])],['fixture-user-B',new Set(['fixture-company-B'])]]);
 const companies=new Map([['fixture-company-A',{id:'fixture-company-A',name:'Illustrative A'}],['fixture-company-B',{id:'fixture-company-B',name:'Illustrative B'}]]);
 function signForTest(subject,exp=Math.floor(Date.now()/1000)+90){
  const payload=b64({sub:subject,iss:issuer,aud:audience,exp});
  return payload+'.'+createHmac('sha256',key).update(payload).digest('base64url');
 }
 function verify(token){
  if(typeof token!=='string'||token.length>3000||token.split('.').length!==2)return null;
  const [part,sig]=token.split('.');
  const expected=createHmac('sha256',key).update(part).digest('base64url');
  if(!constantEq(sig,expected))return null;
  try{
   const x=parse(part);
   if(!x||typeof x.sub!=='string'||x.iss!==issuer||x.aud!==audience||!Number.isFinite(x.exp)||x.exp<=Date.now()/1000)return null;
   return x.sub;
  }catch{return null}
 }
 const handler=(req,res)=>{
  const route=new URL(req.url||'/','http://localhost').pathname;
  res.setHeader('Cache-Control','private, no-store');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options','nosniff');
  const match=/^\/api\/stage9\/demo-company\/([a-zA-Z0-9-]+)$/.exec(route);
  const reply=(status,obj)=>{res.writeHead(status);res.end(JSON.stringify(obj))};
  if(!match)return reply(404,{error:'NOT_FOUND'});
  if(req.method!=='GET')return reply(403,{error:'WRITE_DISABLED'});
  const auth=req.headers.authorization||'';
  const user=auth.startsWith('Bearer ')?verify(auth.slice(7)):null;
  if(!user)return reply(401,{error:'UNVERIFIED_IDENTITY'});
  const company=match[1];
  if(!membership.get(user)?.has(company))return reply(403,{error:'MEMBERSHIP_DENIED'});
  const entry=companies.get(company);
  if(!entry)return reply(404,{error:'NOT_FOUND'});
  return reply(200,{company:entry,source:'SYNTHETIC_TEST_ONLY'});
 };
 async function start(){
  const server=http.createServer(handler);
  await new Promise((ok,bad)=>{server.once('error',bad);server.listen(0,'127.0.0.1',ok)});
  return {url:'http://127.0.0.1:'+server.address().port,close:()=>new Promise(ok=>server.close(ok)),signForTest};
 }
 return Object.freeze({start});
}
module.exports=Object.freeze({createIsolatedGateway});
