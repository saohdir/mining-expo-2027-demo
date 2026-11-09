/* IMDX Exhibitors — standalone Chinese fallback for editorial benefits and industry cards.
 * The published CMS may override card copy with approved translations; these defaults
 * ensure the page also works when the locale's CMS layout is unpublished/unavailable. */
(()=>{"use strict";
const zh=location.pathname.startsWith("/zh/")||new URLSearchParams(location.search).get("lang")==="zh"||
  (new URLSearchParams(location.search).get("lang")!=="en"&&(()=>{try{return localStorage.getItem("imdx-lang")==="zh"}catch{return false}})());
if(!zh)return;
const reasons=[
"汇聚中印尼能源合作的关键力量。与两国政府机构、行业协会、重点能源企业、贸易与投资机构，以及煤炭技术装备、地质勘探和工程承包领域的专业人士交流，拓展高价值合作网络。",
"让共同目标转化为务实项目。聚焦双边能源政策、煤炭贸易、清洁低碳技术、选煤与煤化工、先进装备、煤炭与新能源融合发展，以及覆盖全产业链的重点项目对接。",
"以实践经验开启长期合作。分享中印尼煤炭与能源合作的真实案例与经验，深化产业联系，在更多领域探索持续、互利的合作机遇。"
];
document.querySelectorAll("[data-benefit]").forEach(el=>{const i=Number(el.dataset.benefit);if(reasons[i])el.textContent=reasons[i]});
const list=document.querySelector(".exhibit-benefits");if(list)list.setAttribute("aria-label","参加IMDX 2027的三大理由");
const kicker=document.querySelector(".detail-intro .detail-kicker");if(kicker)kicker.textContent="参展商信息";
const heading=document.querySelector(".detail-intro h1");if(heading)heading.textContent="为何参展";
const crumb=document.querySelector(".detail-intro .breadcrumb");if(crumb){const nodes=[...crumb.childNodes].filter(n=>n.nodeType===3);if(nodes.length)nodes[nodes.length-1].textContent="为何参展"}
const cta=document.querySelector(".industry-modal-cta");if(cta)cta.textContent="了解参展机会 ↗";
document.querySelectorAll("[data-industry]").forEach(card=>{
 const label=card.querySelector(".industry-card-copy strong")?.textContent||"";
 card.setAttribute("aria-label","了解展区："+label);
 const more=card.querySelector(".industry-card-more");if(more)more.replaceChildren(document.createTextNode("探索展区 "),Object.assign(document.createElement("span"),{textContent:"↗"}));
});
})();
