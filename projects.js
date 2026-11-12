'use strict';
(function(){
const strings={
 en:{directory:'Directory',website:'SKOON website',projects:'Our projects',contact:'Contact',eyebrow:'SKOON ARCHITECTURE · PROJECT GALLERY',headline:'Architecture that tells a story.',intro:'Explore our architectural work, grouped by project type. Only projects supported by SKOON source material are published here.',explore:'Explore projects',heroNote:'SKOON · Dubai',filterEyebrow:'EXPLORE BY DISCIPLINE',sectionTitle:'Selected projects & design categories',sectionDesc:'Categories remain visible as the verified portfolio grows. Unverified projects are never presented as completed SKOON designs.',projectType:'HOTELS & HOSPITALITY',aurumTitle:'Aurum Hotel',aurumDesc:'Aurum Estates architectural visualization from SKOON’s SD-P256 project files, Dubai Islands.',reference:'Documented project visual · SKOON source file',emptyTitle:'This collection is growing.',emptyDesc:'Projects in this category will appear after their images and design attribution have been checked.',ctaEyebrow:'HAVE A PROJECT IN MIND?',ctaTitle:'Let’s discuss your vision.',ctaDesc:'Tell us about your project and the design services you need.',ctaLink:'Request a consultation',footer:'Designed by Eng. Khalid Aqeel / All rights reserved',categories:{all:'All projects',villas:'Villas',residential:'Residential buildings',hotels:'Hotels & hospitality',commercial:'Commercial',interiors:'Interiors'},photoAlt:'Aurum Estates building · SD-P256'},
 ar:{directory:'دليل الشركات',website:'موقع سكون',projects:'مشاريع وتصاميم سكون',contact:'تواصل معنا',eyebrow:'سكون للاستشارات الهندسية · معرض المشاريع',headline:'عمارة تروي قصة المكان.',intro:'استكشف أعمالنا المعمارية حسب نوع المشروع. لا ننشر هنا إلا المشاريع المدعومة بملفات ومراجع من سكون.',explore:'استكشف المشاريع',heroNote:'سكون · دبي',filterEyebrow:'تصفّح حسب نوع المشروع',sectionTitle:'مشاريع مختارة وتصنيفات التصميم',sectionDesc:'تبقى التصنيفات متاحة مع توسّع المعرض بالمشاريع الموثقة. لا تُنسب إلى سكون مشاريع لم يتم التحقق من مصادرها.',projectType:'الفنادق والضيافة',aurumTitle:'فندق أوروم',aurumDesc:'تصور معماري لمشروع Aurum Estates من ملفات سكون للمشروع SD-P256 في جزر دبي.',reference:'تصور مشروع موثق · ملف مصدر لدى سكون',emptyTitle:'نعمل على توثيق هذه المجموعة.',emptyDesc:'ستظهر مشاريع هذا التصنيف بعد التحقق من الصور ونسبة أعمال التصميم إلى سكون.',ctaEyebrow:'هل لديك مشروع جديد؟',ctaTitle:'دعنا نناقش رؤيتك.',ctaDesc:'أخبرنا عن مشروعك والخدمات التصميمية التي تحتاجها.',ctaLink:'اطلب استشارة',footer:'كافة حقوق الطبع محفوظة · تصميم المهندس خالد عقيل',categories:{all:'جميع المشاريع',villas:'الفلل',residential:'المباني السكنية',hotels:'الفنادق والضيافة',commercial:'المشاريع التجارية',interiors:'التصميم الداخلي'},photoAlt:'المشروع المعماري أوروم · SD-P256'}
};
const params=new URLSearchParams(location.search);
let lang=params.get('lang')==='ar'?'ar':'en';
let selected=['all','villas','residential','hotels','commercial','interiors'].includes(params.get('type'))?params.get('type'):'all';
const $=q=>document.querySelector(q);
function update(){
 const words=strings[lang];document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
 document.title=words.projects+' | SKOON Architecture';
 document.querySelector('meta[name=description]').content=words.intro;
 document.querySelectorAll('[data-i]').forEach(node=>{const value=words[node.dataset.i];if(typeof value==='string')node.textContent=value});
 $('#language').textContent=lang==='en'?'العربية':'English';
 $('#language').setAttribute('lang',lang==='en'?'ar':'en');
 document.querySelectorAll('[data-filter]').forEach(btn=>{btn.textContent=words.categories[btn.dataset.filter];btn.setAttribute('aria-pressed',String(btn.dataset.filter===selected))});
 $('#project-list').hidden=!['all','hotels'].includes(selected);
 $('#empty-state').hidden=['all','hotels'].includes(selected);
 $('.project-photo img').alt=words.photoAlt;
 const pairs=[['brand-link','/index.html?office=skip'],['directory-link','/'],['site-link','/index.html?office=skip'],['contact-link','/quotation.html'],['cta-link','/quotation.html'],['footer-link','/index.html?office=skip']];
 pairs.forEach(([id,url])=>{const parsed=new URL(url,location.origin);parsed.searchParams.set('lang',lang);$('#'+id).href=parsed.pathname+parsed.search});
 const u=new URL(location.href);u.searchParams.set('lang',lang);if(selected==='all')u.searchParams.delete('type');else u.searchParams.set('type',selected);history.replaceState(null,'',u);
}
$('#language').addEventListener('click',()=>{lang=lang==='en'?'ar':'en';update()});
document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{selected=btn.dataset.filter;update()}));
update();
})();