'use strict';
/**
 * SKOON Plus Stage 7 — isolated local-browser QA.
 * Runs on checked-out repository files with a local HTTP server.
 * External portal response is stubbed ONLY for reliable popup/link testing.
 * Screenshot outputs are uploaded as workflow artifacts, not deployed.
 */
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const evidence = path.join(root, 'QS', 'stage7-browser-evidence');
const types = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
const server = http.createServer((req,res)=>{
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const normalized = pathname==='/'?'/build-hub/index.html':pathname.endsWith('/')?pathname+'index.html':pathname;
    const target = path.resolve(root, '.'+normalized);
    if (!target.startsWith(root+path.sep)) {res.writeHead(403);res.end();return;}
    const ext=path.extname(target).toLowerCase();
    res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-store'});
    fs.createReadStream(target).on('error',()=>{res.destroy();}).pipe(res);
  } catch(e) {res.writeHead(400);res.end();}
});

test('Stage 7 browser: real popup, bilingual RTL, and responsive viewport/screenshots', {timeout:180000}, async t=>{
  fs.mkdirSync(evidence,{recursive:true});
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  await new Promise((resolve,reject)=>server.listen(0,'127.0.0.1',err=>err?reject(err):resolve()));
  const origin='http://127.0.0.1:'+server.address().port;
  t.after(async()=>{await browser.close();await new Promise(resolve=>server.close(resolve));});
  for(const config of [
    {lang:'en',width:1440,height:900,label:'desktop-en'},
    {lang:'ar',width:1440,height:900,label:'desktop-ar'},
    {lang:'en',width:390,height:844,label:'mobile-en'},
    {lang:'ar',width:390,height:844,label:'mobile-ar'}
  ]){
    await t.test(config.label, async()=>{
      const ctx=await browser.newContext({viewport:{width:config.width,height:config.height},deviceScaleFactor:1,acceptDownloads:false});
      try {
        await ctx.route('https://skoonaiv2.vercel.app/**',route=>route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:'<!doctype html><html><head><title>QA outbound fixture</title></head><body><h1>Outbound popup fixture</h1></body></html>'}));
        const page=await ctx.newPage();
        const errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        await page.goto(origin+'/build-hub/',{waitUntil:'load'});
        await page.waitForSelector('.category-card');
        if(config.lang==='ar')await page.locator('#lang').click();
        assert.equal(await page.locator('html').getAttribute('lang'),config.lang);
        assert.equal(await page.locator('html').getAttribute('dir'),config.lang==='ar'?'rtl':'ltr');
        assert.equal(await page.locator('.category-card').count(),6);
        await page.screenshot({path:path.join(evidence,config.label+'-home.png'),fullPage:true});
        const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:window.innerWidth}));
        assert.ok(overflow.scroll<=overflow.viewport+2,'Horizontal overflow: '+JSON.stringify(overflow));
        await page.locator('[data-category="consultants"]').click();
        const link=page.locator('a.card.company.featured');
        assert.equal(await link.count(),1,'SKOON must render as a real link');
        assert.equal(await link.getAttribute('target'),'_blank');
        const href=await link.getAttribute('href');
        assert.equal(href,'https://skoonaiv2.vercel.app/index.html?lang='+config.lang);
        const popupPromise=page.waitForEvent('popup',{timeout:10000});
        await link.click();
        const popup=await popupPromise;
        await popup.waitForLoadState('domcontentloaded');
        assert.equal(new URL(popup.url()).searchParams.get('lang'),config.lang);
        assert.equal(await popup.locator('h1').textContent(),'Outbound popup fixture');
        await popup.close();
        await page.screenshot({path:path.join(evidence,config.label+'-companies.png'),fullPage:true});
        await page.locator('#manage').click();
        assert.equal(await page.locator('#editor').evaluate(el=>el.open),true);
        await page.screenshot({path:path.join(evidence,config.label+'-editor.png'),fullPage:true});
        assert.equal(await page.locator('#close-editor').isVisible(),true);
        assert.ok(await page.locator('#close-editor').isEnabled());
        await page.locator('#close-editor').click();
        assert.equal(await page.locator('#editor').evaluate(el=>el.open),false);
        assert.deepEqual(errors,[],'Uncaught browser errors');
      } finally {await ctx.close();}
    });
  }
});
