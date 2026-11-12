'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');const root=path.resolve(__dirname,'..');const evidence=path.join(root,'QS','stage9-prototype-evidence');
const html=fs.readFileSync(path.join(root,'stage9-admin-prototype','index.html'),'utf8'),js=fs.readFileSync(path.join(root,'stage9-admin-prototype','app.js'),'utf8');
test('Stage9 sources explicitly non-operational',()=>{
 assert.match(html,/DESIGN PROTOTYPE ONLY|prototype/i);
 assert.match(js,/No network, storage, auth or mutations/);
 for(const pattern of [/\bfetch\s*\(/,/\bXMLHttpRequest\b/,/\blocalStorage\b/,/\bsessionStorage\b/,/\bindexedDB\b/,/\bdocument\.cookie\b/,/\bWebSocket\s*\(/]){
  assert.doesNotMatch(js,pattern,'Unexpected operational browser integration: '+pattern);
 }
});
test('Stage9 independent bilingual browser preview', {timeout:150000},async t=>{
 fs.mkdirSync(evidence,{recursive:true});
 const srv=http.createServer((req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname;const target=path.resolve(root,'.'+p);if(!target.startsWith(path.resolve(root,'stage9-admin-prototype')+path.sep)){res.writeHead(403);res.end();return}const data=fs.readFileSync(target);res.writeHead(200,{'Content-Type':target.endsWith('.js')?'application/javascript; charset=utf-8':'text/html; charset=utf-8'});res.end(data)}catch{res.writeHead(404);res.end()}});
 await new Promise(resolve=>srv.listen(0,'127.0.0.1',resolve));const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 t.after(async()=>{await browser.close();await new Promise(resolve=>srv.close(resolve))});
 for(const view of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]){
  await t.test(view.name,async()=>{
   const context=await browser.newContext({viewport:{width:view.width,height:view.height}});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   try{
    await page.goto('http://127.0.0.1:'+srv.address().port+'/stage9-admin-prototype/index.html',{waitUntil:'load'});
    assert.equal(await page.locator('html').getAttribute('lang'),'en');
    assert.equal(await page.locator('html').getAttribute('dir'),'ltr');
    assert.match(await page.locator('#notice').textContent(),/DESIGN PROTOTYPE ONLY/);
    assert.equal(await page.locator('.metric').count(),3);
    await page.screenshot({path:path.join(evidence,view.name+'-en-overview.png'),fullPage:true});
    await page.locator('#language').click();
    assert.equal(await page.locator('html').getAttribute('lang'),'ar');
    assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
    assert.equal(await page.locator('.tab').count(),4);
    await page.screenshot({path:path.join(evidence,view.name+'-ar-overview.png'),fullPage:true});
    await page.locator('[data-tab="directory"]').click();
    assert.equal(await page.locator('#entries tr').count(),3);
    await page.locator('#search').fill('سكون');
    assert.equal(await page.locator('#entries tr').count(),1);
    assert.match(await page.locator('#entries').innerText(),/سكون/);
    await page.screenshot({path:path.join(evidence,view.name+'-ar-directory.png'),fullPage:true});
    await page.locator('#search').fill('no-match-abc');
    assert.match(await page.locator('#entries').innerText(),/لا توجد سجلات/);
    await page.locator('[data-tab="access"]').click();
    assert.equal(await page.locator('#access-entries tr').count(),4);
    const roleFields=await page.locator('#access-entries tr').first().locator('td').evaluateAll(cells=>cells.map(c=>({label:c.getAttribute('data-label'),display:getComputedStyle(c).display})));
    assert.equal(roleFields.length,3);
    assert.ok(roleFields.every(f=>f.label),'Role fields must have localized labels');
    if(view.name==='mobile')assert.ok(roleFields.every(f=>f.display==='grid'),'Mobile role table must display labeled cards');

    assert.match(await page.locator('#boundary-status').textContent(),/مرفوض/);
    assert.match(await page.locator('#boundary-reasons').innerText(),/سياسة ERP غير معتمدة/);
    await page.locator('[data-boundary="cross"]').click();
    assert.equal(await page.locator('[data-boundary="cross"]').getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('#boundary-reasons li[data-code="CROSS_COMPANY"]').count(),1);
    await page.screenshot({path:path.join(evidence,view.name+'-ar-access.png'),fullPage:true});
    await page.screenshot({path:path.join(evidence,view.name+'-ar-boundary-cross-company.png'),fullPage:true});
    await page.locator('[data-boundary="spoof"]').click();
    assert.equal(await page.locator('#boundary-reasons li[data-code="ACTOR_MISMATCH"]').count(),1);
    await page.locator('[data-boundary="unknown"]').click();
    assert.equal(await page.locator('#boundary-reasons li[data-code="UNVERIFIED_IDENTITY"]').count(),1);
    await page.locator('#language').click();
    assert.match(await page.locator('#boundary-status').textContent(),/DENIED/);
    await page.screenshot({path:path.join(evidence,view.name+'-en-boundary-missing-identity.png'),fullPage:true});
    await page.locator('#language').click();

    await page.locator('[data-tab="migration"]').click();
    assert.equal(await page.locator('.step').count(),5);
    assert.match(await page.locator('#dryrun-status').textContent(),/يحتاج مراجعة/);
    assert.equal(await page.locator('#dryrun-findings tr').count(),3);
    assert.match(await page.locator('#dryrun-findings').innerText(),/EXISTING_COMPANY_ID/);
    assert.match(await page.locator('#dryrun-findings').innerText(),/EXISTING_CATEGORY_ID/);
    assert.match(await page.locator('#dryrun-lock').textContent(),/الاستيراد مقفل/);
    await page.screenshot({path:path.join(evidence,view.name+'-ar-migration.png'),fullPage:true});
    await page.locator('[data-scenario="blocked"]').click();
    assert.match(await page.locator('#dryrun-status').textContent(),/مرفوض/);
    assert.equal(await page.locator('#dryrun-findings tr').count(),2);
    assert.match(await page.locator('#dryrun-findings').innerText(),/URL_PROTOCOL/);
    const fields=await page.locator('#dryrun-findings tr').first().locator('td').evaluateAll(cells=>cells.map(cell=>({
      label:cell.getAttribute('data-label'),
      display:getComputedStyle(cell).display
    })));
    assert.equal(fields.length,4);
    assert.ok(fields.every(field=>field.label&&field.label.trim().length>0),'All fields should be labeled for accessibility');
    if(view.name==='mobile')assert.ok(fields.every(field=>field.display==='grid'),'Mobile findings must be stacked fields');

    assert.equal(await page.locator('[data-scenario="blocked"]').getAttribute('aria-pressed'),'true');
    await page.screenshot({path:path.join(evidence,view.name+'-ar-dry-run-blocked.png'),fullPage:true});
    await page.locator('#language').click();
    assert.equal(await page.locator('html').getAttribute('lang'),'en');
    assert.equal(await page.locator('html').getAttribute('dir'),'ltr');
    assert.match(await page.locator('#dryrun-status').textContent(),/BLOCKED/);
    assert.match(await page.locator('#dryrun-lock').textContent(),/Import is locked/);
    await page.screenshot({path:path.join(evidence,view.name+'-en-dry-run-blocked.png'),fullPage:true});
    await page.locator('[data-scenario="conflict"]').click();
    assert.match(await page.locator('#dryrun-status').textContent(),/REVIEW REQUIRED/);
    assert.match(await page.locator('#dryrun-findings').innerText(),/EXISTING_COMPANY_ID/);
    await page.screenshot({path:path.join(evidence,view.name+'-en-dry-run-review.png'),fullPage:true});
    const dimensions=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);
    assert.ok(dimensions[0]<=dimensions[1]+2,'Horizontal overflow: '+dimensions);
    assert.deepEqual(errors,[]);
   }finally{await context.close()}
  });
 }
});
