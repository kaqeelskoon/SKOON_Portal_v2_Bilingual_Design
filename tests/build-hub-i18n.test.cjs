'use strict';
/**
 * SKOON Plus Stage 7 — dependency-free bilingual/static contract regression.
 * Run: node --test tests/build-hub-i18n.test.cjs
 * This is source-level QA ONLY. It does not replace browser, mobile or visual QA.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'build-hub', 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'build-hub', 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'build-hub', 'style.css'), 'utf8');
function dictionaryKeys() {
  const afterEn = js.split('const copy={en:{')[1];
  assert.ok(afterEn, 'EN dictionary must exist');
  const en = afterEn.split('},ar:{')[0];
  const afterAr = afterEn.split('},ar:{')[1];
  assert.ok(afterAr, 'AR dictionary must exist');
  const ar = afterAr.split('}};')[0];
  const extract = block => [...block.matchAll(/([a-zA-Z][a-zA-Z0-9_]*):'/g)].map(x => x[1]);
  return {en: extract(en), ar: extract(ar)};
}
test('bilingual dictionary has identical keys with no duplicates', () => {
  const {en, ar} = dictionaryKeys();
  assert.ok(en.length > 0);
  assert.equal(new Set(en).size, en.length, 'duplicate EN keys');
  assert.equal(new Set(ar).size, ar.length, 'duplicate AR keys');
  assert.deepEqual([...new Set(en)].sort(), [...new Set(ar)].sort());
});
test('HTML data-i labels have EN and AR translations', () => {
  const {en, ar} = dictionaryKeys();
  const keys = new Set([...html.matchAll(/data-i="([^"]+)"/g)].map(x => x[1]));
  assert.ok(keys.size > 0);
  for (const key of keys) {
    assert.ok(en.includes(key), 'EN missing: ' + key);
    assert.ok(ar.includes(key), 'AR missing: ' + key);
  }
});
test('explicit translator keys are bilingual', () => {
  const {en, ar} = dictionaryKeys();
  const keys = new Set([...js.matchAll(/(?<![\w.])t\('([A-Za-z]\w*)'\)/g)].map(x => x[1]));
  for (const key of keys) {
    assert.ok(en.includes(key), 'EN missing: ' + key);
    assert.ok(ar.includes(key), 'AR missing: ' + key);
  }
});
test('language selection updates document direction and metadata', () => {
  for (const expr of [
    "document.documentElement.lang=lang",
    "document.documentElement.dir=lang==='ar'?'rtl':'ltr'",
    "document.title=t('pageTitle')",
    "heroImg.alt=t('heroImageAlt')",
    "setAttribute('aria-label',t('closeEditor'))",
    "localStorage.setItem('skoon-hub-lang',lang)",
  ]) assert.ok(js.includes(expr), 'missing behavior: ' + expr);
  assert.ok(css.includes('html[dir=rtl]') || css.includes('html[dir="rtl"]') || css.includes('html[dir=\'rtl\']'), 'RTL style required');
});
test('HTML editor and directory selectors used by application exist', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(x => x[1]);
  assert.equal(new Set(ids).size, ids.length, 'duplicate static element IDs');
  for (const id of ['cards','search','lang','editor','close-editor','tab-category','tab-company','edit-form','editor-status','toast','count','back','directory']) {
    assert.ok(ids.includes(id), 'missing element: ' + id);
  }
});
test('editor explicitly discloses local-only persistence', () => {
  const {en,ar}=dictionaryKeys();
  assert.ok(en.includes('localNotice') && ar.includes('localNotice'));
  assert.match(js, /localStorage\.setItem\(key,JSON\.stringify\(data\)\)/);
  assert.match(js, /storageError/);
});

test('SKOON portal link preserves selected language without rewriting external links', () => {
  assert.match(js, /function companyHref\(c\)/);
  assert.match(js, /c\.id!=='skoon'/);
  assert.match(js, /c\.url!=='https:\/\/skoonaiv2\.vercel\.app\/index\.html'/);
  assert.match(js, /u\.searchParams\.set\('lang',lang\)/);
  assert.match(js, /safe\(companyHref\(c\)\)/);
});

test('execute real companyHref for both languages without modifying external URLs', () => {
  const vm = require('node:vm');
  const {URL} = require('node:url');
  const match = js.match(/function companyHref\(c\)\{[^\n]+\}/);
  assert.ok(match, 'companyHref must be found in app.js');
  for (const lang of ['ar', 'en']) {
    const context = vm.createContext({URL, lang});
    const href = vm.runInContext(match[0] + '; companyHref', context);
    const skoon = {id:'skoon', url:'https://skoonaiv2.vercel.app/index.html'};
    assert.equal(href(skoon), 'https://skoonaiv2.vercel.app/index.html?lang=' + lang);
    const external = {id:'external-vendor', url:'https://example.org/supplier?existing=1'};
    assert.equal(href(external), external.url);
    const otherSkoon = {id:'skoon', url:'https://example.org/unexpected'};
    assert.equal(href(otherSkoon), otherSkoon.url);
  }
});

test('execute real renderCards: URL company must render anchor and pending card must render button', () => {
  const vm = require('node:vm');
  const source = js.match(/function renderCards\(\)\{[^\n]+\}/);
  assert.ok(source, 'renderCards source not found');
  for (const lang of ['en','ar']) {
    const cards = {innerHTML:''};
    const count = {textContent:''};
    const empty = {hidden:true};
    const search = {value:''};
    const nodes = {'#search':search,'#count':count,'#empty':empty,'#cards':cards};
    const data = {companies:[
      {id:'skoon',en:'SKOON Architecture',ar:'سكون للاستشارات الهندسية',category:'consultants',url:'https://skoonaiv2.vercel.app/index.html'},
      {id:'slot-consultants-2',en:'Consultant 2',ar:'استشاري رقم 2',category:'consultants',url:'',demo:true,slotNumber:2}
    ],categories:[]};
    const context = vm.createContext({
      lang, selected:'consultants',data,URL:require('node:url').URL,
      $: key => nodes[key],
      t: key => ({companyCount:'companies',demo:'Demo',demoInfo:'Demo card',companyInfo:'Company details',visit:'Visit website',pending:'Website coming soon',addCompany:'Add company',addCompanySub:'Add listing'})[key]||key,
      safe: value => String(value??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
      companyArtwork:()=>'<svg></svg>',
      companyHref: company => company.id==='skoon'?company.url+'?lang='+lang:company.url,
      svg:()=>'<svg></svg>'
    });
    vm.runInContext(source[0]+'; renderCards()',context);
    assert.match(cards.innerHTML, new RegExp('<a class="card company featured" href="https://skoonaiv2\\.vercel\\.app/index\\.html\\?lang='+lang+'" target="_blank"'));
    assert.match(cards.innerHTML, /<button class="card company [^"]*" data-pending="1">/);
    assert.equal((cards.innerHTML.match(/data-pending="1"/g)||[]).length,1);
  }
});
