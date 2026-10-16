'use strict';
const {createHash}=require('node:crypto');
const FROM='SKOON Architecture <website@updates.skoon-automation.com>';
const counters=new Map();
function gate(req,res){res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');if(req.method!=='POST'){res.status(405).json({error:'method_not_allowed'});return false;}try{if(!req.headers.origin||new URL(req.headers.origin).host!==req.headers.host)throw Error();}catch{res.status(403).json({error:'origin_not_allowed'});return false;}const ip=String(req.headers['x-forwarded-for']||'unknown').split(',')[0];const now=Date.now();for(const[k,v]of counters)if(now-v.time>60000)counters.delete(k);const c=counters.get(ip)||{time:now,count:0};if(++c.count>8){res.status(429).json({error:'rate_limit'});return false;}counters.set(ip,c);return true;}
function parse(req){try{return typeof req.body==='string'?JSON.parse(req.body):req.body;}catch{return null;}}
function visitor(v,emailRequired=false){return v&&typeof v.name==='string'&&v.name.trim().length>=2&&v.name.length<=100&&typeof v.phone==='string'&&/^\+?[\d ()-]{7,25}$/.test(v.phone)&&v.phone.replace(/\D/g,'').length>=7&&(!emailRequired||typeof v.email==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)&&v.email.length<=200)&&v.consent===true;}
function configured(){return !!process.env.RESEND_API_KEY&&!!process.env.CONTACT_TO;}
function key(prefix,value){return prefix+'-'+createHash('sha256').update(JSON.stringify(value)).digest('hex');}
async function send(payload,id){const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':id},body:JSON.stringify({from:FROM,...payload}),signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('mail_delivery_failed');const result=await r.json();if(!result.id)throw Error('mail_response_invalid');return result.id;}
const details=v=>'Name: '+v.name.trim()+'\nMobile: '+v.phone+'\nEmail: '+(v.email||'Not provided');
module.exports={gate,parse,visitor,configured,key,send,details};
