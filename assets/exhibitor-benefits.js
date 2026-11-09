/* IMDX Exhibitors | editorial benefit translations and local section navigation.
   Works for /zh/exhibitors/ and ?lang=zh without overriding separately approved CMS copy. */
(()=>{"use strict";
 const dictionary={
  eyebrow:["THE EXHIBITOR ADVANTAGE / 05","参展商的五大优势 / 05"],
  head1:["Five reasons to","五大理由，助您"],
  head2:["make your mark.","脱颖而出。"],
  intro:["Exhibiting is about more than space on the show floor. It's a chance to spark conversations that move your business forward.","参展不仅是展示企业形象，更是与行业伙伴展开深度交流、发掘商机、推动业务发展的契机。"],
  title0:["Generate qualified opportunities","发掘高质量商机"],
  body0:["Meet potential buyers, partners and project stakeholders looking for technologies and solutions across mining, energy and downstream industries.","与正在寻找矿业、能源及下游产业技术与解决方案的潜在买家、合作伙伴和项目相关方建立联系。"],
  title1:["Strengthen brand visibility","提升品牌影响力"],
  body1:["Put your expertise in the spotlight and present the products, capabilities and ideas that set your business apart.","向行业专业人士展示企业的产品、实力和创新理念，让您的品牌脱颖而出。"],
  title2:["Expand your industry network","拓展行业合作网络"],
  body2:["Start valuable conversations with industry associations, business leaders, suppliers and trade communities across Indonesia and China.","与来自印度尼西亚和中国的行业协会、企业领导者、供应商及商贸机构展开有价值的交流。"],
  title3:["Deepen customer relationships","深化客户关系"],
  body3:["Reconnect with existing clients, introduce your latest innovations and create the personal conversations that build confidence.","与现有客户保持联系，展示最新创新成果，通过面对面沟通建立更稳固的信任与合作。"],
  title4:["Understand market demand","洞察市场需求"],
  body4:["Discover emerging priorities, hear real buyer feedback and explore opportunities to refine your solutions for the market.","了解行业新趋势，倾听买家的真实反馈，发现改进产品与解决方案的新机会。"],
  jump0:["Why exhibit","为何参展"],
  jump1:["Business benefits","商业价值"],
  jump2:["Strategic partnerships","战略合作"],
  jump3:["Industry sectors","行业领域"]
 };
 const nav=document.querySelector(".imdx-exhibitor-page-nav");
 const translate=()=>{if(!document.documentElement.lang.toLowerCase().startsWith("zh"))return;
  document.querySelectorAll("[data-exhibitor-i18n]").forEach(node=>{
   const pair=dictionary[node.dataset.exhibitorI18n];if(!pair)return;
   // Preserve organizer edits and published Chinese copy; replace only the original default English.
   if(node.textContent.trim()===pair[0])node.textContent=pair[1];
  });
  const list=document.querySelector(".imdx-benefit-grid");
  if(list)list.setAttribute("aria-label","参加IMDX 2027的五大优势");
  if(nav)nav.setAttribute("aria-label","浏览本页内容");
 };
 window.IMDX_translateExhibitorBenefits=translate;
 translate();
 if(nav){
  const links=[...nav.querySelectorAll('a[href^="#"]')];
  const reflect=()=>{const hash=decodeURIComponent(location.hash||"#exhibitors");const target=links.some(a=>a.hash===hash)?hash:"#exhibitors";
   links.forEach(a=>{if(a.hash===target)a.setAttribute("aria-current","location");else a.removeAttribute("aria-current")});
  };
  nav.addEventListener("click",e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;
   links.forEach(link=>link.removeAttribute("aria-current"));a.setAttribute("aria-current","location");
  });
  addEventListener("hashchange",reflect);reflect();
 }
})();
