'use strict';
(function(){
 const messages={
  en:{directory:'Directory',website:'SKOON website',projects:'Our projects',contact:'Contact',back:'Back to all projects',eyebrow:'SKOON · DESIGN PORTFOLIO',title:'Aurum Hotel',intro:'An architectural project visual sourced from SKOON\'s original SD-P256 project files.',category:'Project category',categoryValue:'Hotels & hospitality',source:'Source',sourceValue:'SKOON original project image · SD-P256',note:'Concept visualization. This page does not represent a claim of completed construction or an approved project status.',inquire:'Discuss a similar project',caption:'Aurum · SD-P256 / architectural visual',footer:'Designed by Eng. Khalid Aqeel / All rights reserved',photoAlt:'Aurum Estates architectural visualization · SD-P256'},
  ar:{directory:'دليل الشركات',website:'موقع سكون',projects:'مشاريع وتصاميم سكون',contact:'تواصل معنا',back:'العودة إلى جميع المشاريع',eyebrow:'سكون · معرض التصاميم',title:'فندق أوروم',intro:'تصور معماري موثّق من ملفات مشروع سكون الأصلي SD-P256.',category:'نوع المشروع',categoryValue:'الفنادق والضيافة',source:'المرجع',sourceValue:'صورة من ملفات مشروع سكون الأصلية · SD-P256',note:'الصورة تصور معماري ولا تعني أن المشروع منفذ أو أن حالة اعتماده مؤكدة.',inquire:'ناقش مشروعاً مماثلاً',caption:'أوروم · SD-P256 / تصور معماري',footer:'كافة حقوق الطبع محفوظة · تصميم المهندس خالد عقيل',photoAlt:'تصور معماري لمشروع أوروم · SD-P256'}
 };
 let lang=new URLSearchParams(location.search).get('lang')==='ar'?'ar':'en';
 const $=q=>document.querySelector(q);
 function render(){
  const t=messages[lang];document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
  document.title=t.title+' | SKOON Architecture';
  document.querySelector('meta[name=description]').content=t.intro;
  document.querySelectorAll('[data-i]').forEach(el=>el.textContent=t[el.dataset.i]);
  $('#detail-image').alt=t.photoAlt;
  $('#language').textContent=lang==='ar'?'English':'العربية';
  $('#language').setAttribute('lang',lang==='ar'?'en':'ar');
  const routes=[['brand-link','/index.html?office=skip'],['directory-link','/'],['site-link','/index.html?office=skip'],['projects-link','/projects.html'],['contact-link','/quotation.html'],['back-to-projects','/projects.html'],['inquiry-link','/quotation.html'],['footer-link','/index.html?office=skip']];
  routes.forEach(([id,path])=>{const u=new URL(path,location.origin);u.searchParams.set('lang',lang);$('#'+id).href=u.pathname+u.search});
  const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);
 }
 $('#language').addEventListener('click',()=>{lang=lang==='en'?'ar':'en';render()});
 render();
})();