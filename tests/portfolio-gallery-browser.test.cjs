'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const evidence=path.join(root,'QS','portfolio-gallery-evidence');
const contentTypes={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png'};
test('SKOON portfolio bilingual navigation and categories desktop/mobile',{timeout:150000},async t=>{
 fs.mkdirSync(evidence,{recursive:true});
 const source=fs.readFileSync(path.join(root,'projects.js'),'utf8');
 const vm=require('node:vm');
 const tourContext={window:{}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'office-tour-config.js'),'utf8'),tourContext);
 const tourModel=require('../office-tour-model.js');
 for(const language of ['ar','en']){
  const u=tourModel.destinationUrl(tourContext.window.SKOON_OFFICE_CONFIG,'projects',language,'https://skoon.example/office-tour.html');
  assert.ok(u && u.includes('/projects.html?lang='+language),'Office tour projects link must open gallery in '+language);
 }

 assert.doesNotMatch(source,/Jaiedco|tower\.jpg|P338/i,'Portfolio must not reintroduce incorrect attribution');
 const server=http.createServer((req,res)=>{
  const raw=new URL(req.url||'/', 'http://localhost').pathname;
  const requested=raw==='/'?'/build-hub/index.html':raw;
  const file=path.resolve(root,'.'+requested);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
  try{const buf=fs.readFileSync(file);res.writeHead(200,{'Content-Type':contentTypes[path.extname(file)]||'application/octet-stream'});res.end(buf)}
  catch{res.writeHead(404);res.end()}
 });
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 t.after(async()=>{await browser.close();await new Promise(ok=>server.close(ok))});
 const base='http://127.0.0.1:'+server.address().port;
 for(const viewport of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]){
  await t.test(viewport.name,async()=>{
   const ctx=await browser.newContext({viewport:{width:viewport.width,height:viewport.height}});
   const page=await ctx.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
   try{
    await page.goto(base+'/projects.html?lang=en',{waitUntil:'networkidle'});
    assert.equal(await page.locator('html').getAttribute('dir'),'ltr');
    assert.equal(await page.locator('h1').innerText(),'Architecture that tells a story.');
    assert.equal(await page.locator('#project-list .project-card').count(),1);
    const img=page.locator('.project-photo img');
    await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());
    assert.ok(await img.evaluate(el=>el.naturalWidth>1000));
    await page.locator('#filters [data-filter=villas]').click();
    assert.equal(await page.locator('#project-list').isVisible(),false);
    assert.equal(await page.locator('#empty-state').isVisible(),true);
    await page.screenshot({path:path.join(evidence,viewport.name+'-en-villas-empty.png'),fullPage:true});
    await page.locator('#filters [data-filter=hotels]').click();
    assert.equal(await page.locator('#project-list').isVisible(),true);
    assert.equal(await page.locator('[data-i=aurumTitle]').innerText(),'Aurum Hotel');
    await page.screenshot({path:path.join(evidence,viewport.name+'-en-hotel.png'),fullPage:true});
    await page.locator('#language').click();
    assert.equal(await page.locator('html').getAttribute('lang'),'ar');
    assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
    assert.equal(await page.locator('[data-i=aurumTitle]').innerText(),'فندق أوروم');
    assert.equal(await page.locator('#filters [data-filter=hotels]').getAttribute('aria-pressed'),'true');
    assert.match(page.url(),/lang=ar/);
    assert.match(await page.locator('#projects-link').getAttribute('href'),/lang=ar/);
    await page.locator('#projects-link').click();
    await page.waitForURL(/projects\.html\?lang=ar/);
    assert.equal(await page.locator('html').getAttribute('lang'),'ar');

    await page.screenshot({path:path.join(evidence,viewport.name+'-ar-hotel.png'),fullPage:true});
    await page.locator('#filters [data-filter=commercial]').click();
    assert.equal(await page.locator('#empty-state').isVisible(),true);
    await page.screenshot({path:path.join(evidence,viewport.name+'-ar-commercial-empty.png'),fullPage:true});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);
    assert.equal(overflow,false,'Page should not overflow mobile width');
    assert.match(await page.locator('#directory-link').getAttribute('href'),/lang=ar/);
    await page.goto(base+'/index.html?office=skip&lang=ar',{waitUntil:'networkidle'});
    const introNav=page.locator('#main-nav a[href*="projects.html"]');
    assert.equal(await introNav.count(),1);assert.match(await introNav.innerText(),/المشاريع/);
    await page.goto(base+'/website/index.html?lang=ar',{waitUntil:'networkidle'});
    assert.equal(await page.locator('#main-nav a[href*="../projects.html"]').count(),1);
    await page.goto(base+'/',{waitUntil:'networkidle'});
    await page.evaluate(()=>localStorage.setItem('skoon-hub-lang','en'));
    await page.goto(base+'/?lang=ar',{waitUntil:'networkidle'});
    assert.equal(await page.locator('html').getAttribute('lang'),'ar');
    assert.match(await page.locator('#portfolio-link').getAttribute('href'),/lang=ar/);
    await page.locator('#lang').click();
    assert.equal(await page.locator('html').getAttribute('lang'),'en');
    assert.match(page.url(),/lang=en/);
    const hubLink=page.locator('#portfolio-link');
    assert.equal(await hubLink.count(),1);
    await page.locator('#lang').click();
    assert.equal(await page.locator('html').getAttribute('lang'),'ar');
    assert.match(page.url(),/lang=ar/);
    assert.match(await hubLink.innerText(),/مشاريع/);
    assert.match(await hubLink.getAttribute('href'),/lang=ar/);
    await hubLink.click();
    await page.waitForURL(/projects\.html\?lang=ar/);
    assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
    assert.deepEqual(errors,[]);
   }finally{await ctx.close()}
  });
 }
});
