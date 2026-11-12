'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),evidence=path.join(root,'QS','client-portal-review-evidence');
const mime={'.html':'text/html;charset=utf-8','.js':'application/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
test('SKOON client review dashboard remains interactive, bilingual and isolated',{timeout:180000},async t=>{
 fs.mkdirSync(evidence,{recursive:true});
 const code=fs.readFileSync(path.join(root,'client-portal-demo.js'),'utf8');
 assert.doesNotMatch(code,/\b(fetch|XMLHttpRequest|WebSocket|indexedDB)\b|localStorage|sessionStorage|document\.cookie/i);
 const server=http.createServer((req,res)=>{
  const u=new URL(req.url||'/','http://localhost');
  const target=path.resolve(root,'.'+(u.pathname==='/'?'/build-hub/index.html':u.pathname));
  if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
  try{const data=fs.readFileSync(target);res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream'});res.end(data);}
  catch{res.writeHead(404);res.end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 t.after(async()=>{await browser.close();await new Promise(resolve=>server.close(resolve))});
 const base='http://127.0.0.1:'+server.address().port;
 for(const view of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]){
  await t.test(view.name,async()=>{
   const ctx=await browser.newContext({viewport:{width:view.width,height:view.height}});
   const p=await ctx.newPage(),exceptions=[];p.on('pageerror',e=>exceptions.push(e.message));
   try{
    await p.goto(base+'/client-portal-demo.html?lang=en',{waitUntil:'networkidle'});
    assert.equal(await p.locator('html').getAttribute('dir'),'ltr');
    assert.equal(await p.locator('#tabs [data-tab]').count(),6);
    assert.equal(await p.locator('.stat-card').count(),3);
    assert.match(await p.locator('.demo-warning').innerText(),/fictional/);
    await p.screenshot({path:path.join(evidence,view.name+'-en-home.png'),fullPage:true});
    await p.locator('#tabs [data-tab=documents]').click();
    assert.equal(await p.locator('.doc-item').count(),4);
    await p.locator('[data-doc-type=drawings]').click();
    assert.equal(await p.locator('.doc-item').count(),2);
    await p.locator('[data-doc="D-01"]').click();
    assert.equal(await p.locator('[role=dialog]').count(),1);
    assert.match(await p.locator('[role=dialog]').innerText(),/no download/i);
    await p.locator('[data-close]').first().click();
    assert.equal(await p.locator('[role=dialog]').count(),0);
    await p.locator('#tabs [data-tab=decisions]').click();
    assert.equal(await p.locator('.decision-card').count(),2);
    await p.locator('[data-decide="0:agree"]').click();
    assert.equal(await p.locator('#decision-count').innerText(),'1');
    await p.screenshot({path:path.join(evidence,view.name+'-en-decisions.png'),fullPage:true});
    await p.locator('#tabs [data-tab=messages]').click();
    await p.locator('#message-text').fill('A sample message for tomorrow review.');
    await p.locator('#message-form button[type=submit]').click();
    assert.match(await p.locator('#conversation').innerText(),/A sample message for tomorrow review/);
    await p.locator('#tabs [data-tab=collections]').click();
    assert.equal(await p.locator('.collection-card').count(),4);
    await p.locator('[data-collection="2"]').click();
    assert.equal(await p.locator('[data-collection="2"]').getAttribute('aria-pressed'),'true');
    await p.screenshot({path:path.join(evidence,view.name+'-en-collections.png'),fullPage:true});
    await p.locator('#language').click();
    assert.equal(await p.locator('html').getAttribute('lang'),'ar');
    assert.equal(await p.locator('html').getAttribute('dir'),'rtl');
    assert.match(await p.locator('.demo-warning').innerText(),/افتراضية/);
    assert.match(await p.locator('#projects-link').getAttribute('href'),/lang=ar/);
    await p.screenshot({path:path.join(evidence,view.name+'-ar-collections.png'),fullPage:true});
    await p.locator('#tabs [data-tab=home]').click();
    assert.match(await p.locator('h1').innerText(),/أهلاً/);
    await p.screenshot({path:path.join(evidence,view.name+'-ar-home.png'),fullPage:true});
    await p.locator('#tabs [data-tab=decisions]').click();
    assert.equal(await p.locator('#decision-count').innerText(),'1');
    await p.screenshot({path:path.join(evidence,view.name+'-ar-decisions.png'),fullPage:true});
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1),false,'No horizontal overflow');
    await p.reload({waitUntil:'networkidle'});
    assert.equal(await p.locator('#decision-count').innerText(),'2','Demo decisions not persisted');
    assert.deepEqual(exceptions,[]);
    await p.goto(base+'/?lang=ar',{waitUntil:'networkidle'});
    const link=p.locator('#client-preview-link');
    assert.equal(await link.count(),1);
    assert.equal(await link.isVisible(),true);
    assert.match(await link.getAttribute('href'),/lang=ar/);
    await link.click();
    await p.waitForURL(/client-portal-demo\.html\?lang=ar/);
    assert.equal(await p.locator('html').getAttribute('dir'),'rtl');
    await p.goto(base+'/index.html?office=skip&lang=ar',{waitUntil:'networkidle'});
    assert.equal(await p.locator('#main-nav a[href*="client-portal-demo.html"]').count(),1);
    await p.goto(base+'/client-login.html?lang=ar',{waitUntil:'networkidle'});
    assert.equal(await p.locator('.login-card a[href*="client-portal-demo.html"]').count(),1);
   }finally{await ctx.close();}
  });
 }
});
