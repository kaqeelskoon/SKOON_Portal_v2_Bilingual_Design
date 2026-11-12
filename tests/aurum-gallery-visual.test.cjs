'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const evidence=path.join(root,'QS','aurum-gallery-evidence');
test('Aurum image replaces gallery tower throughout bilingual site', {timeout:120000},async t=>{
 const js=fs.readFileSync(path.join(root,'app.js'),'utf8');
 const image=fs.readFileSync(path.join(root,'assets','aurum-p256-cover.jpg'));
 assert.ok(image.length>100000,'Original Aurum visual should be present');
 assert.equal(image[0],0xff);assert.equal(image[1],0xd8);
 assert.match(js,/assets\/aurum-p256-cover\.jpg/);
 assert.doesNotMatch(js,/assets\/tower\.jpg|\?'tower':'hero'/);
 assert.match(js,/aurumVisual:\['Aurum Hotel · SD-P256','فندق أوروم · SD-P256'\]/);
 fs.mkdirSync(evidence,{recursive:true});
 const server=http.createServer((req,res)=>{
  const raw=new URL(req.url||'/','http://127.0.0.1').pathname;
  const target=path.resolve(root,'.'+(raw==='/'?'/index.html':raw));
  if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
  try{
   const data=fs.readFileSync(target);
   const type=target.endsWith('.jpg')?'image/jpeg':target.endsWith('.css')?'text/css':target.endsWith('.js')?'application/javascript':'text/html';
   res.writeHead(200,{'Content-Type':type});res.end(data);
  }catch{res.writeHead(404);res.end()}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 t.after(async()=>{await browser.close();await new Promise(resolve=>server.close(resolve))});
 for(const layout of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]){
  await t.test(layout.name,async()=>{
   const context=await browser.newContext({viewport:{width:layout.width,height:layout.height}});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   try{
    for(const lang of ['en','ar']){
     await page.goto('http://127.0.0.1:'+server.address().port+'/?lang='+lang,{waitUntil:'networkidle'});
     assert.equal(await page.locator('html').getAttribute('lang'),lang);
     assert.equal(await page.locator('html').getAttribute('dir'),lang==='ar'?'rtl':'ltr');
     const photo=page.locator('.gallery img[src="assets/aurum-p256-cover.jpg"]');
     assert.equal(await photo.count(),1);
     assert.equal(await photo.evaluate(x=>x.complete && x.naturalWidth>1000),true);
     assert.equal(await page.locator('.gallery img[src="assets/tower.jpg"]').count(),0);
     assert.match(await photo.getAttribute('alt'),lang==='ar'?/أوروم/:/Aurum/);
     await photo.scrollIntoViewIfNeeded();
     await page.screenshot({path:path.join(evidence,layout.name+'-'+lang+'-gallery.png'),fullPage:true});
     await page.goto('http://127.0.0.1:'+server.address().port+'/employee-login.html?lang='+lang,{waitUntil:'networkidle'});
     const login=page.locator('img.login-image');
     assert.match(await login.getAttribute('src'),/aurum-p256-cover\.jpg/);
     assert.equal(await login.evaluate(x=>x.complete&&x.naturalWidth>1000),true);
     await page.screenshot({path:path.join(evidence,layout.name+'-'+lang+'-employee.png'),fullPage:true});
    }
    assert.deepEqual(errors,[]);
   }finally{await context.close()}
  });
 }
});
