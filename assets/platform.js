/* IMDX 2027 public site ↔ platform integration (PRD v1.4 FR-003/005/009/010/024/030).
   Works only on the same-domain UAT/production deployment; on static previews it degrades to
   the existing static content. No payment or admission logic runs in the browser. */
(()=>{"use strict";
 const onPreview=location.hostname.endsWith("github.io")||location.protocol==="file:";
 const api=(window.IMDX_UAT_BASE_URL&&/^https:\/\//.test(window.IMDX_UAT_BASE_URL)?window.IMDX_UAT_BASE_URL.replace(/\/$/,""):"")+"/api/public";
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 // FR-001/NFR-09 + CR-LANG-01: English and Simplified Chinese. /zh/... is the Chinese URL of every page (nginx serves the same
 // static file); ?lang=zh|en and a remembered preference are also honoured. CMS serves zh layouts with English fallback.
 const zhPath=/^\/zh(\/|$)/.test(location.pathname);
 const langParam=new URLSearchParams(location.search).get("lang");
 try{if(langParam==="zh"||langParam==="en")localStorage.setItem("imdx-lang",langParam)}catch{}
 let stored=null;try{stored=localStorage.getItem("imdx-lang")}catch{}
 const lang=zhPath||langParam==="zh"||(!langParam&&stored==="zh")?"zh":"en";
 const L=(en,zh)=>lang==="zh"?zh:en;
 document.documentElement.lang=lang==="zh"?"zh-Hans":"en";
 const enPath=p=>p.replace(/^\/zh(?=\/|$)/,"")||"/";
 if(lang==="zh"){const c=document.querySelector('link[rel="canonical"]');if(c&&zhPath)c.href=c.href.replace(/^(https?:\/\/[^/]+)(?!\/zh\/)/,"$1/zh");
  // Keep visitors in Chinese when following absolute site links (app routes /account, /admin, /api stay as they are).
  if(zhPath)document.querySelectorAll('a[href^="/"]').forEach(a=>{const h=a.getAttribute("href");if(!/^\/(zh|api|account|admin|floorplan|conferences|assets)(\/|$)/.test(h))a.setAttribute("href","/zh"+h)})}
 (()=>{const nav=document.getElementById("navLinks");if(!nav||document.querySelector(".lang-switch"))return;const w=document.createElement("div");w.className="lang-switch";w.setAttribute("role","group");w.setAttribute("aria-label",L("Language","语言"));
  [["en","EN","English"],["zh","中文","简体中文"]].forEach(([code,label,title])=>{const b=document.createElement("button");b.type="button";b.textContent=label;b.setAttribute("aria-pressed",String(code===lang));b.lang=code==="zh"?"zh-Hans":"en";b.title=title;
   b.addEventListener("click",()=>{try{localStorage.setItem("imdx-lang",code)}catch{}const u=new URL(location.href);u.searchParams.delete("lang");const base=enPath(u.pathname);u.pathname=code==="zh"?"/zh"+(base==="/"?"/":base):base;location.assign(u.toString())});w.append(b)});nav.append(w)})();

 // FR-001: breadcrumb on inner pages (Home › Page).
 const main=document.querySelector("main");
 if(main&&location.pathname.replace(/\/$/,"")&&!document.querySelector("nav.breadcrumb")){const h=document.querySelector("main h1");if(h){const nav=document.createElement("nav");nav.className="breadcrumb container";nav.setAttribute("aria-label","Breadcrumb");
  nav.innerHTML=`<ol><li><a href="${lang==="zh"?"/zh/":"/"}">${lang==="zh"?"首页":"Home"}</a></li><li aria-current="page">${esc(h.textContent.trim().slice(0,80))}</li></ol>`;main.prepend(nav)}}

 // FR-030: keep UTM attribution for the session (non-sensitive).
 try{const q=new URLSearchParams(location.search);const utm={};["utm_source","utm_medium","utm_campaign"].forEach(k=>{const v=q.get(k);if(v)utm[k]=v.slice(0,100)});if(Object.keys(utm).length)sessionStorage.setItem("imdx-utm",JSON.stringify(utm))}catch{}
 const utm=()=>{try{return JSON.parse(sessionStorage.getItem("imdx-utm")||"{}")}catch{return {}}};

 // FR-003: countdown to 26 May 2027 09:00 WIB; honest states once started/ended.
 const START=Date.parse("2027-05-26T09:00:00+07:00"),END=Date.parse("2027-05-28T18:00:00+07:00");
 document.querySelectorAll("[data-countdown]").forEach(el=>{
  el.setAttribute("aria-live","off");
  const tick=()=>{const now=Date.now();
   if(now>=END){el.textContent=lang==="zh"?"展会已结束":"The event has ended";return false}
   if(now>=START){el.textContent=lang==="zh"?"展会正在进行中":"The event is ongoing";return false}
   const s=Math.floor((START-now)/1000),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);
   el.textContent=(lang==="zh"?`距开幕还有 ${d} 天 ${h} 小时 ${m} 分钟`:`${d} days ${h} hrs ${m} min to go`);return true};
  if(tick()){const t=setInterval(()=>{if(!tick())clearInterval(t)},30000)}
 });

 // FR-005/009/035: published CMS items replace static fallbacks; drafts never reach the browser.
 // FR-017: partnership CTA preselects the enquiry topic on the contact page.
 const topic=new URLSearchParams(location.search).get("topic");
 const safeDownload=u=>typeof u==="string"&&(/^https:\/\/[^\s<>"']+$/i.test(u)||/^\/(?!\/)[A-Za-z0-9/_\-.#?=&%]+$/.test(u))?u:"";
 const downloadIcon=pdf=>'<span class="cms-download-icon'+(pdf?' cms-download-icon-pdf':'')+'" aria-hidden="true"><svg viewBox="0 0 24 28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 1.5h10l6 6V26H4z"/><path d="M14 1.5v6h6"/></svg>'+(pdf?'<b>PDF</b>':'')+'</span>';
 const downloadItem=i=>{const url=safeDownload(i.url);if(!url)return "";const pdf=/pdf/i.test(i.fileType||"")||/\.pdf(?:[?#]|$)/i.test(url);
  const details=[i.fileType||(pdf?"PDF":L("File","文件")),i.fileSizeBytes?Math.max(1,Math.round(i.fileSizeBytes/1024))+" KB":null,
   L("Updated","更新于")+" "+new Date(i.updatedAt).toLocaleDateString(lang==="zh"?"zh-CN":"en-GB",{timeZone:"Asia/Jakarta"})].filter(Boolean).join(" · ");
  return '<li class="cms-download"><a href="'+esc(url)+'" download aria-label="'+esc(L("Download ","下载 ")+i.title+(pdf?" (PDF)":""))+'">'+downloadIcon(pdf)+'<span>'+esc(i.title)+'</span></a><span>'+esc(details)+'</span></li>';
 };
 const renderList=async box=>{
  if(onPreview)return;
  try{const r=await fetch(`${api}/content?kind=${encodeURIComponent(box.dataset.cmsKind)}&locale=${lang}`);if(!r.ok)return;const {items}=await r.json();if(!items?.length)return;
   const kind=box.dataset.cmsKind;
   box.innerHTML=items.map(i=>kind==="DOWNLOAD"
    ?downloadItem(i)
    :kind==="GALLERY"?`<li class="cms-gallery"><a href="${esc(i.imageUrl)}" target="_blank" rel="noopener"><img src="${esc(i.imageUrl)}" alt="${esc(i.altText||i.title)}" loading="lazy"></a><span>${esc(i.title)}${i.role?" · "+esc(i.role):""}</span></li>`
    :`<li class="cms-partner">${i.imageUrl?`<img src="${esc(i.imageUrl)}" alt="${esc(i.altText||i.title)}" loading="lazy">`:""}<strong>${esc(i.title)}</strong>${i.role?`<span>${esc(i.role)}</span>`:""}${i.summary?`<p>${esc(i.summary)}</p>`:""}</li>`).join("");
   box.hidden=false;box.closest("[data-cms-section]")?.removeAttribute("hidden");
  }catch{}
 };
 document.querySelectorAll("[data-cms-kind]").forEach(renderList);

 // FR-010/024/026/027: contact & partnership form → lead inbox (consent required, honeypot, server validation).
 const host=document.getElementById("imdx-contact-form");
 if(host){
  host.innerHTML=`<h2>${lang==="zh"?"发送留言":"Send us a message"}</h2>
  <form novalidate class="imdx-lead-form">
   <label>${lang==="zh"?"咨询类型":"Topic"}<select name="leadType"><option value="CONTACT">${L("General enquiry","一般咨询")}</option><option value="EXHIBITOR">${L("Exhibiting","参展咨询")}</option><option value="PARTNER">${L("Partnership","合作伙伴")}</option><option value="SPONSOR">${L("Sponsorship","赞助")}</option></select></label>
   <label>${lang==="zh"?"姓名":"Full name"} *<input name="name" required minlength="2" maxlength="120" autocomplete="name"></label>
   <label>Email *<input name="email" type="email" required autocomplete="email"></label>
   <label>${lang==="zh"?"公司":"Company"}<input name="company" maxlength="180" autocomplete="organization"></label>
   <label>${lang==="zh"?"电话":"Phone"}<input name="phone" maxlength="40" autocomplete="tel"></label>
   <label>${lang==="zh"?"留言内容":"Message"} *<textarea name="message" required minlength="10" maxlength="3000" rows="5"></textarea></label>
   <label class="hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
   <label class="consent"><input type="checkbox" name="consent" required> ${lang==="zh"?"我同意按照":"I agree to the processing of my data under the"} <a href="${lang==="zh"?"/zh/privacy/":"/privacy/"}" target="_blank" rel="noopener">${lang==="zh"?"隐私声明处理我的数据":"privacy notice"}</a>. *</label>
   <p class="form-status" role="status" aria-live="polite"></p>
   <button type="submit" class="btn btn-orange">${lang==="zh"?"发送":"Send message"} <span>↗</span></button>
  </form>`;
  const form=host.querySelector("form"),status=host.querySelector(".form-status");
  if(topic&&["CONTACT","EXHIBITOR","PARTNER","SPONSOR"].includes(topic))form.elements.namedItem("leadType").value=topic;
  form.addEventListener("submit",async e=>{e.preventDefault();
   form.querySelectorAll("[aria-invalid]").forEach(el=>el.removeAttribute("aria-invalid"));
   if(onPreview){status.textContent=L("This static preview cannot send messages. Please use the official event domain.","此静态预览无法发送留言，请使用官方活动网站。");return}
   const fd=new FormData(form),u=utm();
   const body={leadType:fd.get("leadType"),name:fd.get("name"),email:fd.get("email"),message:fd.get("message"),consent:fd.get("consent")==="on",
    ...(fd.get("company")?{company:fd.get("company")}:{}),...(fd.get("phone")?{phone:fd.get("phone")}:{}),...(fd.get("website")?{website:fd.get("website")}:{}),
    ...(u.utm_source?{utmSource:u.utm_source}:{}),...(u.utm_medium?{utmMedium:u.utm_medium}:{}),...(u.utm_campaign?{utmCampaign:u.utm_campaign}:{})};
   if(!body.consent){body.consent=undefined}
   const btn=form.querySelector("button");btn.disabled=true;status.textContent=lang==="zh"?"正在发送…":"Sending…";
   try{const r=await fetch(`${api}/leads`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));
    if(r.ok){form.reset();status.textContent=`${j.message} Reference: ${j.reference}`;}
    else if(j.issues){j.issues.forEach(i=>form.elements.namedItem(i.field)?.setAttribute("aria-invalid","true"));status.textContent=j.issues.map(i=>i.message).join(" · ");}
    else status.textContent=j.message||L("Sorry, the message could not be sent.","抱歉，留言发送失败。");
   }catch{status.textContent=L("Network error — please try again.","网络错误，请重试。")}finally{btn.disabled=false}
  });
 }

 // FR-013: published news with date and simple pagination.
 const news=document.querySelector("[data-news-list]");
 if(news&&!onPreview){(async()=>{try{const r=await fetch(`${api}/content?kind=NEWS&locale=${lang}`);if(!r.ok)return;const {items}=await r.json();if(!items.length)return;
  let page=0;const per=6,ul=news.querySelector("ul"),more=news.querySelector("button");
  const show=()=>{ul.innerHTML+=items.slice(page*per,(page+1)*per).map(i=>`<li class="cms-news"><time datetime="${esc(i.publishedAt)}">${new Date(i.publishedAt).toLocaleDateString(lang==="zh"?"zh-CN":"en-GB",{timeZone:"Asia/Jakarta",dateStyle:"long"})}</time><h3>${i.url?`<a href="${esc(i.url)}">${esc(i.title)}</a>`:esc(i.title)}</h3>${i.summary?`<p>${esc(i.summary)}</p>`:""}</li>`).join("");page++;more.hidden=page*per>=items.length};
  more.addEventListener("click",show);show();news.hidden=false}catch{}})()}

 // FR-018: confirmed programme schedule only (no invented times), filter by date.
 const sched=document.querySelector("[data-schedule]");
 if(sched&&!onPreview){(async()=>{try{const r=await fetch(`${api}/events`);if(!r.ok)return;const {events}=await r.json();
  const items=events.flatMap(e=>e.conferences.filter(c=>c.startsAt).map(c=>({title:c.title,startsAt:c.startsAt,state:c.registrationState})));
  if(!items.length)return;const sel=sched.querySelector("select"),ul=sched.querySelector("ul");
  const day=d=>new Date(d).toLocaleDateString("en-CA",{timeZone:"Asia/Jakarta"});
  [...new Set(items.map(i=>day(i.startsAt)))].sort().forEach(d=>sel.add(new Option(new Date(d+"T00:00:00+07:00").toLocaleDateString(lang==="zh"?"zh-CN":"en-GB",{dateStyle:"full",timeZone:"Asia/Jakarta"}),d)));
  const render=()=>{ul.innerHTML=items.filter(i=>!sel.value||day(i.startsAt)===sel.value).sort((a,b)=>a.startsAt.localeCompare(b.startsAt)).map(i=>`<li><time>${new Date(i.startsAt).toLocaleTimeString("en-GB",{timeZone:"Asia/Jakarta",hour:"2-digit",minute:"2-digit"})} WIB</time> <strong>${esc(i.title)}</strong></li>`).join("")};
  sel.addEventListener("change",render);render();sched.hidden=false}catch{}})()}

 // CMS editable fields: text/links/images inside designed sections and the shared header/footer carry data-cms-f keys
 // (stamped in the HTML). Overrides are applied as TEXT nodes only; "rich" fields understand new line, *em*, **strong**.
 const cmsSafe=u=>typeof u==="string"&&(/^\/[A-Za-z0-9/_\-.#?=&%]*$/.test(u)||/^https:\/\//.test(u)||/^mailto:/.test(u))?u:"";
 const cmsRich=v=>{const f=document.createDocumentFragment();String(v).split("\n").forEach((line,i)=>{if(i)f.append(document.createElement("br"));
  line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).forEach(part=>{if(!part)return;const m=part.match(/^(\*\*?)([^*]+)\1$/);if(m){const e=document.createElement(m[1].length===2?"strong":"em");e.textContent=m[2];f.append(e)}else f.append(part)})});return f};
 const applyFields=(fields,manifest)=>{if(!fields||typeof fields!=="object")return;
  document.querySelectorAll("[data-cms-f]").forEach(node=>{const v=fields[node.dataset.cmsF];if(!v)return;
   if(node.tagName==="IMG"){if(cmsSafe(v.src)){node.src=cmsSafe(v.src);node.removeAttribute("srcset")}if(typeof v.alt==="string")node.alt=v.alt;return}
   if(typeof v.text==="string"){const mode=v.mode||"plain";
    if(mode==="rich"){if(node.classList.contains("industry-card-copy")){
      const parts=v.text.match(/^\*\*([^*]+)\*\*(.*)$/s);
      if(parts){const strong=document.createElement("strong"),small=document.createElement("small");strong.textContent=parts[1];small.textContent=parts[2].trim();node.replaceChildren(strong,small)}
      else node.replaceChildren(cmsRich(v.text));
     }else node.replaceChildren(cmsRich(v.text));}
    else if(mode==="own"){const ts=[...node.childNodes].filter(n=>n.nodeType===3&&/[\p{L}\p{N}]/u.test(n.nodeValue));if(ts.length){const lead=ts[0].nodeValue.match(/^\s*/)[0],trail=ts[0].nodeValue.match(/\s*$/)[0];ts[0].nodeValue=lead+v.text+trail;ts.slice(1).forEach(n=>n.nodeValue=" ")}}
    else node.textContent=v.text}
   if(node.tagName==="A"&&cmsSafe(v.href))node.setAttribute("href",cmsSafe(v.href))})};
 window.IMDX_applyCmsFields=applyFields;
 // Site-wide header/footer fields (page key "site"), independent of the page layout.
 (async()=>{if(onPreview)return;const preview=new URLSearchParams(location.search).get("cmsPreview")==="1";try{
  const r=preview?await fetch(`${api.replace(/\/public$/,"/admin")}/pages/site?locale=${lang}`,{credentials:"same-origin",cache:"no-store"}):await fetch(`${api}/pages/site?locale=${lang}`);
  if(r.ok){const j=await r.json();applyFields((preview?j.draft:j.layout)?.fields)}}catch{}})();

 // CMS pages & layout: published layout (or staff draft preview) reorders/hides designed sections and adds blocks.
 // Content is inserted as TEXT only (no HTML from the CMS), links limited to site paths/https/mailto.
 (async()=>{
  const key=document.body.dataset.cmsPage;if(!key||onPreview)return;
  const preview=new URLSearchParams(location.search).get("cmsPreview")==="1";
  let layout=null;
  try{
   if(preview){const r=await fetch(`${api.replace(/\/public$/,"/admin")}/pages/${key}?locale=${lang}`,{credentials:"same-origin",cache:"no-store"});if(r.ok)layout=(await r.json()).draft;
    const bar=document.createElement("div");bar.className="cms-preview-bar";bar.setAttribute("role","status");bar.textContent=r.ok?"PREVIEW — unpublished draft (only visible to signed-in CMS staff)":"Preview needs a CMS sign-in.";document.body.prepend(bar)}
   else{const r=await fetch(`${api}/pages/${key}?locale=${lang}`);if(r.ok)layout=(await r.json()).layout}
  }catch{}
  if(!layout||!Array.isArray(layout.blocks))return;
  applyFields(layout.fields);
  // Retain translated scope copy when the CMS falls back to English fields on a Chinese URL.
  if(lang==="zh"&&key==="exhibitors")window.IMDX_exhibitorsApplyZhFallback?.();
  if(layout.seo?.title)document.title=layout.seo.title;
  if(layout.seo?.description){let m=document.querySelector('meta[name="description"]');if(!m){m=document.createElement("meta");m.name="description";document.head.append(m)}m.content=layout.seo.description}
  const safe=u=>typeof u==="string"&&(/^\/[A-Za-z0-9/_\-.#?=&%]*$/.test(u)||/^https:\/\//.test(u)||/^mailto:/.test(u))?u:"";
  const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt)e.textContent=txt;return e};
  const para=(body)=>{const f=document.createDocumentFragment();String(body||"").split(/\n\s*\n/).forEach(chunk=>{const lines=chunk.split("\n");if(lines.every(l=>/^\s*-\s+/.test(l))){const ul=el("ul");lines.forEach(l=>ul.append(el("li","",l.replace(/^\s*-\s+/,""))));f.append(ul)}else if(chunk.trim())f.append(el("p","",chunk.trim()))});return f};
  const link=(href,label,cls)=>{const a=el("a",cls||"btn btn-orange",label);a.href=safe(href)||"#";return a};
  const img=(u,alt)=>{if(!safe(u))return null;const i=el("img");i.src=safe(u);i.alt=alt||"";i.loading="lazy";return i};
  const render=b=>{const d=b.data||{},sec=el("section","container section cms-block cms-block-"+b.type);sec.dataset.cmsCustom=b.id;
   if(b.type==="hero"){if(d.eyebrow)sec.append(el("span","eyebrow",d.eyebrow));if(d.title)sec.append(el("h2","",d.title));if(d.subtitle)sec.append(el("p","",d.subtitle));const i=img(d.imageUrl,d.imageAlt);if(i)sec.append(i);if(d.ctaLabel)sec.append(link(d.ctaHref,d.ctaLabel))}
   else if(b.type==="text"){if(d.eyebrow)sec.append(el("span","eyebrow",d.eyebrow));if(d.heading)sec.append(el("h2","",d.heading));sec.append(para(d.body))}
   else if(b.type==="cards"){if(d.heading)sec.append(el("h2","",d.heading));const ul=el("ul","cms-list");(d.items||[]).forEach(it=>{const li=el("li","cms-partner");const i=img(it.imageUrl,it.imageAlt);if(i)li.append(i);const t=el("strong","",it.title);if(safe(it.href)){const a=el("a");a.href=safe(it.href);a.append(t);li.append(a)}else li.append(t);if(it.text)li.append(el("p","",it.text));ul.append(li)});sec.append(ul)}
   else if(b.type==="cta"){if(d.heading)sec.append(el("h2","",d.heading));if(d.text)sec.append(el("p","",d.text));if(d.buttonLabel)sec.append(link(d.buttonHref,d.buttonLabel))}
   else if(b.type==="image"){const fig=el("figure");const i=img(d.imageUrl,d.imageAlt);if(i)fig.append(i);if(d.caption)fig.append(el("figcaption","",d.caption));sec.append(fig)}
   else if(b.type==="stats"){if(d.heading)sec.append(el("h2","",d.heading));const dl=el("dl","cms-stats");(d.items||[]).forEach(it=>{const w=el("div");w.append(el("dt","",it.label),el("dd","",it.value));dl.append(w)});sec.append(dl)}
   else if(b.type==="faq"){if(d.heading)sec.append(el("h2","",d.heading));(d.items||[]).forEach(it=>{const det=el("details");det.append(el("summary","",it.q),el("p","",it.a));sec.append(det)})}
   else if(b.type==="list"){if(d.heading)sec.append(el("h2","",d.heading));const ul=el("ul","cms-list");ul.dataset.cmsKind=d.kind;ul.hidden=true;sec.append(ul);renderList(ul)}
   return sec};
  const container=document.querySelector("main")||document.body;
  const listed=new Set();
  for(const b of layout.blocks){
   if(b.type==="static"){const node=document.querySelector(`[data-cms-block="${CSS.escape(b.ref)}"]`);if(!node)continue;listed.add(node);node.hidden=!!b.hidden;
    if(node.hidden)node.style.display="none";else node.style.removeProperty("display");
    if(node.parentElement===container||container.contains(node))container.append(node)}
   else if(!b.hidden)container.append(render(b));
  }
  document.querySelectorAll("[data-cms-block]").forEach(n=>{if(!listed.has(n)){n.hidden=true;n.style.display="none"}});
  const footerNodes=[...container.querySelectorAll(":scope > footer")];footerNodes.forEach(f=>container.append(f));
  document.documentElement.dataset.cmsLayout=preview?"draft":"published";
 })();
})();
