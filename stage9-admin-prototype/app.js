'use strict';
// Stage 9 isolated VISUAL PROTOTYPE. No network, storage, auth or mutations.
const fixture=[
 {id:'skoon',type:'consultants',en:'SKOON Architecture',ar:'سكون للاستشارات الهندسية',url:'https://skoonaiv2.vercel.app/',state:'sample'},
 {id:'demo-contractor',type:'contractors',en:'Contractor illustration',ar:'مقاول توضيحي',url:'',state:'sample'},
 {id:'demo-supplier',type:'suppliers',en:'Supplier illustration',ar:'مورد توضيحي',url:'',state:'sample'}
];
const copy={
 en:{
  brandSub:'BUILDING COLLECTIVE',eyebrow:'STAGE 09 · INTERNAL CONCEPT',headline:'Directory administration, designed for control.',
  intro:'A bilingual, read-only interface concept for reviewing company directory data, future access decisions and migration safeguards.',
  notice:'DESIGN PROTOTYPE ONLY — Illustrative entries. No sign-in, database connection, real permissions, changes, import or publishing. All access roles are proposals awaiting approval.',
  tabs:['Overview','Directory','Access model','Data migration'],labels:['Sample entries','Approved roles','Connected databases'],values:['3','0','0'],
  overviewTitle:'A controlled path from browser storage to shared records',overviewPanels:[
   {title:'What this concept shows',items:['Bilingual management layout','Directory searching and category labels','Role and approval decisions under review']},
   {title:'Not implemented',items:['Authentication or server authorization','Company data import or centralized writes','Audit ledger, approvals or database access']}
  ],
  directoryTitle:'Directory entries (illustrative only)',search:'Search companies or categories',columns:['Company','Category','Website','Status'],
  categories:{consultants:'Consultants',contractors:'Contractors',suppliers:'Suppliers'},
  noLink:'Not provided',sample:'Illustrative',count:'matching sample entries',empty:'No matching sample entries',
  accessTitle:'Access decision worksheet — not an approved permission matrix',
  accessDesc:'These are proposed audience categories, not authorized ERP roles. All production write permissions remain blocked.',
  accessColumns:['Proposed audience','Suggested scope','Decision'],roles:[
   ['Public visitor','Read published company directory only','Awaiting approval'],
   ['Directory editor','Prepare changes for review; no direct publishing','Awaiting approval'],
   ['Authorized publisher','Publish after an auditable approval gate','Awaiting approval'],
   ['Platform administrator','Manage memberships under verified server policy','Awaiting approval']
  ],
  migrationTitle:'Non-destructive migration gates',migrationDesc:'All steps are future requirements, not live operations.',
  steps:[
   ['1 · Export','Owner-controlled export of browser-local directory data.'],
   ['2 · Validate','Schema, URLs, duplicates and bilingual fields checked without rewriting originals.'],
   ['3 · Review','Conflicts and provenance presented to an authorized reviewer.'],
   ['4 · Approve','Explicit approval before any centralized write.'],
   ['5 · Reconcile','Versioned import, audit trace and rollback plan verified.']
  ],
  footer:'Internal design preview — no user data accessed. Stage 8 production remains separate.'
 },
 ar:{
  brandSub:'منظومة شركاء البناء',eyebrow:'المرحلة ٠٩ · تصور داخلي',headline:'إدارة دليل الشركات، بصلاحيات واضحة.',
  intro:'تصور ثنائي اللغة للوحة عرض بيانات الشركات وقرارات الصلاحيات المقترحة وضوابط ترحيل البيانات، دون ربط تشغيلي.',
  notice:'نموذج تصميم فقط — بيانات توضيحية. لا تسجيل دخول، ولا اتصال بقاعدة بيانات، ولا صلاحيات حقيقية، ولا تعديل أو استيراد أو نشر. جميع الأدوار مقترحات تنتظر الاعتماد.',
  tabs:['نظرة عامة','دليل الشركات','نموذج الصلاحيات','ترحيل البيانات'],labels:['سجلات توضيحية','أدوار معتمدة','قواعد بيانات مرتبطة'],values:['3','0','0'],
  overviewTitle:'مسار مضبوط من تخزين المتصفح إلى البيانات المشتركة',overviewPanels:[
   {title:'ما يعرضه النموذج',items:['واجهة إدارة عربية وإنجليزية','بحث وفئات لدليل الشركات','قرارات الصلاحيات والاعتماد المعلّقة']},
   {title:'ما لم يُنفذ',items:['تسجيل الدخول والتحقق من الصلاحيات بالخادم','استيراد الشركات أو حفظ مركزي','سجل تدقيق أو موافقات أو اتصال بقاعدة بيانات']}
  ],
  directoryTitle:'سجلات دليل الشركات (للتوضيح فقط)',search:'ابحث باسم شركة أو فئة',columns:['الشركة','الفئة','الموقع','الحالة'],
  categories:{consultants:'الاستشاريون',contractors:'المقاولون',suppliers:'الموردون'},
  noLink:'غير مضاف',sample:'توضيحي',count:'سجل مطابق',empty:'لا توجد سجلات توضيحية مطابقة',
  accessTitle:'مصفوفة قرارات الصلاحيات — غير معتمدة',
  accessDesc:'هذه فئات استخدام مقترحة وليست أدواراً معتمدة من ERP. جميع صلاحيات التعديل الإنتاجية معلّقة.',
  accessColumns:['فئة الاستخدام المقترحة','نطاق مقترح','الحالة'],roles:[
   ['الزائر العام','قراءة دليل الشركات المنشور فقط','بانتظار الاعتماد'],
   ['محرر الدليل','اقتراح التعديلات للمراجعة، دون نشر مباشر','بانتظار الاعتماد'],
   ['مخوّل النشر','النشر بعد موافقة موثقة','بانتظار الاعتماد'],
   ['مسؤول المنصة','إدارة العضويات وفق سياسة خادم موثوقة','بانتظار الاعتماد']
  ],
  migrationTitle:'بوابات الترحيل الآمن دون إتلاف البيانات',migrationDesc:'جميع الخطوات متطلبات مستقبلية وليست عمليات مفعّلة.',
  steps:[
   ['١ · التصدير','تصدير بيانات المتصفح بمبادرة صاحب البيانات.'],
   ['٢ · التحقق','فحص البنية والروابط والتكرارات واللغتين دون تعديل الأصول.'],
   ['٣ · المراجعة','عرض التعارضات والمصدر على المراجع المخوّل.'],
   ['٤ · الموافقة','موافقة صريحة قبل أي كتابة مركزية.'],
   ['٥ · المطابقة','استيراد قابل للتتبع مع إدارة الإصدارات وخطة تراجع.']
  ],
  footer:'معاينة تصميم داخلية — دون الوصول إلى بيانات مستخدمين. إنتاج Stage 8 مستقل.'
 }
};
const $=id=>document.getElementById(id);
let language='en',tab='overview';
const h=(tag,text,className)=>{const node=document.createElement(tag);node.textContent=String(text);if(className)node.className=className;return node};
function render(){
 const t=copy[language];document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';
 document.title=(language==='ar'?'إدارة دليل الشركات':'Directory management')+' | SKOON Stage 9 Concept';
 $('language').textContent=language==='ar'?'English':'العربية';$('brand-sub').textContent=t.brandSub;
 for(const key of ['eyebrow','headline','intro','notice','footer'])$(key).textContent=t[key];
 document.querySelectorAll('[data-tab]').forEach((el,i)=>{el.textContent=t.tabs[i];const selected=el.dataset.tab===tab;el.setAttribute('aria-selected',String(selected));$(el.dataset.tab).hidden=!selected});
 $('metrics').replaceChildren(...t.labels.map((label,i)=>{const d=h('div','','metric');d.append(h('strong',t.values[i]),h('span',label));return d}));
 $('overview-title').textContent=t.overviewTitle;
 $('overview-panels').replaceChildren(...t.overviewPanels.map(panel=>{const box=h('div','','panel');box.append(h('h3',panel.title));const list=document.createElement('ul');for(const x of panel.items)list.append(h('li',x));box.append(list);return box}));
 $('directory-title').textContent=t.directoryTitle;$('search').placeholder=t.search;$('search').setAttribute('aria-label',t.search);
 $('columns').replaceChildren(...t.columns.map(v=>h('th',v)));
 $('access-title').textContent=t.accessTitle;$('access-desc').textContent=t.accessDesc;$('access-columns').replaceChildren(...t.accessColumns.map(v=>h('th',v)));
 $('access-entries').replaceChildren(...t.roles.map(row=>{const tr=h('tr','');for(const v of row)tr.append(h('td',v));return tr}));
 $('migration-title').textContent=t.migrationTitle;$('migration-desc').textContent=t.migrationDesc;
 $('migration-steps').replaceChildren(...t.steps.map(([title,desc])=>{const d=h('div','','step');d.append(h('b',title),h('span',desc));return d}));renderRows()
}
function renderRows(){
 const t=copy[language],query=$('search').value.trim().toLocaleLowerCase();
 const items=fixture.filter(x=>(x.en+' '+x.ar+' '+x.type+' '+t.categories[x.type]).toLocaleLowerCase().includes(query));
 $('result-count').textContent=items.length+' '+t.count;
 if(!items.length){const tr=h('tr','');const td=h('td',t.empty);td.colSpan=4;tr.append(td);$('entries').replaceChildren(tr);return}
 $('entries').replaceChildren(...items.map(item=>{
 const tr=h('tr','');
 const name=h('td',item[language]),category=h('td',t.categories[item.type]);
 const link=h('td',item.url||t.noLink);
 if(item.url){link.textContent='';const a=h('a',item.url);a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';link.append(a)}
 const status=h('td','');status.append(h('span',t.sample,'pill gray'));tr.append(name,category,link,status);return tr
 }))
}
document.querySelectorAll('[data-tab]').forEach(el=>el.addEventListener('click',()=>{tab=el.dataset.tab;render()}));
$('language').addEventListener('click',()=>{language=language==='en'?'ar':'en';render()});
$('search').addEventListener('input',renderRows);
render();
