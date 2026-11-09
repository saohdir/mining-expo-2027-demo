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
const categories=[{"title":"采矿设备与技术","short":"矿山机械、钻探、运输与地下开采解决方案","detail":"露天及地下开采全流程设备，包括挖掘机、矿用卡车、装载机、掘进机、钻机及物料运输系统。"},{"title":"矿物加工与选矿","short":"破碎、磨矿、筛分与分选技术","detail":"用于破碎、磨矿、分级、筛分、浮选、过滤及物料搬运作业的加工与选矿设备。"},{"title":"冶金与深加工","short":"冶炼、精炼、铸造与高附加值加工","detail":"熔炉、转炉、窑炉、精炼与冶炼系统、冶金解决方案、铸造、轧制、热处理及先进制造。"},{"title":"下游材料与应用","short":"镍、铜、电池与工业应用","detail":"镍、铜、锡、铝、电池材料、不锈钢、合金、工业零部件及下游合作机会。"},{"title":"数字智能与自动化","short":"智能矿山、工业数据与自动化","detail":"数字智能、工业物联网、监测、互联系统与自动化。具体内容以主办方确认为准。"},{"title":"安全、环保与绿色矿山","short":"更安全、更清洁、更可持续的运营","detail":"安全设备、环境保护、绿色矿山管理及负责任运营。具体内容以主办方确认为准。"},{"title":"配套设备与耗材","short":"零部件、备件与关键支持系统","detail":"用于矿山及下游工业设施的配套设备、备件、耗材与技术。"},{"title":"勘探、工程与投资","short":"检测、服务、融资与合作","detail":"面向矿业价值链的勘探、检测、项目工程、服务以及投资或融资支持。"}];
window.IMDX_exhibitorsApplyZhFallback=()=>{
 document.querySelectorAll("[data-industry]").forEach(card=>{
  const i=Number(card.dataset.industry),tr=categories[i];if(!tr)return;
  const title=card.querySelector(".industry-card-copy strong"),summary=card.querySelector(".industry-card-copy small"),detail=card.querySelector(".industry-card-detail");
  if(title&&!/[\\u3400-\\u9fff]/u.test(title.textContent||""))title.textContent=tr.title;
  if(summary&&!/[\\u3400-\\u9fff]/u.test(summary.textContent||""))summary.textContent=tr.short;
  if(detail&&!/[\\u3400-\\u9fff]/u.test(detail.textContent||""))detail.textContent=tr.detail;
  card.setAttribute("aria-label","了解展区："+(title?.textContent||tr.title));
  const more=card.querySelector(".industry-card-more");if(more)more.replaceChildren(document.createTextNode("探索展区 "),Object.assign(document.createElement("span"),{textContent:"↗"}));
 });
};
window.IMDX_exhibitorsApplyZhFallback();
})();
