/* IMDX 2027 public site ↔ platform integration (PRD v1.4 FR-003/005/009/010/024/030).
   Works only on the same-domain UAT/production deployment; on static previews it degrades to
   the existing static content. No payment or admission logic runs in the browser. */
(()=>{"use strict";
 const onPreview=location.hostname.endsWith("github.io")||location.protocol==="file:";
 const api=(window.IMDX_UAT_BASE_URL&&/^https:\/\//.test(window.IMDX_UAT_BASE_URL)?window.IMDX_UAT_BASE_URL.replace(/\/$/,""):"")+"/api/public";
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 // FR-001/NFR-09 language preference: ?lang=id|en, remembered per browser; CMS serves ID layouts with EN fallback.
 const langParam=new URLSearchParams(location.search).get("lang");
 try{if(langParam==="id"||langParam==="en")localStorage.setItem("imdx-lang",langParam)}catch{}
 let stored=null;try{stored=localStorage.getItem("imdx-lang")}catch{}
 const lang=(stored||document.documentElement.lang||"en").startsWith("id")?"id":"en";
 document.documentElement.lang=lang;
 (()=>{const nav=document.getElementById("navLinks");if(!nav||document.querySelector(".lang-switch"))return;const w=document.createElement("div");w.className="lang-switch";w.setAttribute("role","group");w.setAttribute("aria-label","Language");
  ["en","id"].forEach(code=>{const b=document.createElement("button");b.type="button";b.textContent=code.toUpperCase();b.setAttribute("aria-pressed",String(code===lang));b.lang=code;b.title=code==="en"?"English":"Bahasa Indonesia";
   b.addEventListener("click",()=>{try{localStorage.setItem("imdx-lang",code)}catch{}const u=new URL(location.href);u.searchParams.delete("lang");location.assign(u.toString())});w.append(b)});nav.append(w)})();

 // FR-001: breadcrumb on inner pages (Home › Page).
 const main=document.querySelector("main");
 if(main&&location.pathname.replace(/\/$/,"")&&!document.querySelector("nav.breadcrumb")){const h=document.querySelector("main h1");if(h){const nav=document.createElement("nav");nav.className="breadcrumb container";nav.setAttribute("aria-label","Breadcrumb");
  nav.innerHTML=`<ol><li><a href="/">${lang==="id"?"Beranda":"Home"}</a></li><li aria-current="page">${esc(h.textContent.trim().slice(0,80))}</li></ol>`;main.prepend(nav)}}

 // FR-030: keep UTM attribution for the session (non-sensitive).
 try{const q=new URLSearchParams(location.search);const utm={};["utm_source","utm_medium","utm_campaign"].forEach(k=>{const v=q.get(k);if(v)utm[k]=v.slice(0,100)});if(Object.keys(utm).length)sessionStorage.setItem("imdx-utm",JSON.stringify(utm))}catch{}
 const utm=()=>{try{return JSON.parse(sessionStorage.getItem("imdx-utm")||"{}")}catch{return {}}};

 // FR-003: countdown to 26 May 2027 09:00 WIB; honest states once started/ended.
 const START=Date.parse("2027-05-26T09:00:00+07:00"),END=Date.parse("2027-05-28T18:00:00+07:00");
 document.querySelectorAll("[data-countdown]").forEach(el=>{
  el.setAttribute("aria-live","off");
  const tick=()=>{const now=Date.now();
   if(now>=END){el.textContent=lang==="id"?"Acara telah berakhir":"The event has ended";return false}
   if(now>=START){el.textContent=lang==="id"?"Acara sedang berlangsung":"The event is ongoing";return false}
   const s=Math.floor((START-now)/1000),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);
   el.textContent=(lang==="id"?`${d} hari ${h} jam ${m} menit lagi`:`${d} days ${h} hrs ${m} min to go`);return true};
  if(tick()){const t=setInterval(()=>{if(!tick())clearInterval(t)},30000)}
 });

 // FR-005/009/035: published CMS items replace static fallbacks; drafts never reach the browser.
 // FR-017: partnership CTA preselects the enquiry topic on the contact page.
 const topic=new URLSearchParams(location.search).get("topic");
 const renderList=async box=>{
  if(onPreview)return;
  try{const r=await fetch(`${api}/content?kind=${encodeURIComponent(box.dataset.cmsKind)}&locale=${lang}`);if(!r.ok)return;const {items}=await r.json();if(!items?.length)return;
   const kind=box.dataset.cmsKind;
   box.innerHTML=items.map(i=>kind==="DOWNLOAD"
    ?`<li class="cms-download"><a href="${esc(i.url)}" download>${esc(i.title)}</a> <span>${esc(i.fileType||"")}${i.fileSizeBytes?" · "+Math.max(1,Math.round(i.fileSizeBytes/1024))+" KB":""} · ${lang==="id"?"Diperbarui":"Updated"} ${new Date(i.updatedAt).toLocaleDateString(lang==="id"?"id-ID":"en-GB",{timeZone:"Asia/Jakarta"})}</span></li>`
    :kind==="GALLERY"?`<li class="cms-gallery"><a href="${esc(i.imageUrl)}" target="_blank" rel="noopener"><img src="${esc(i.imageUrl)}" alt="${esc(i.altText||i.title)}" loading="lazy"></a><span>${esc(i.title)}${i.role?" · "+esc(i.role):""}</span></li>`
    :`<li class="cms-partner">${i.imageUrl?`<img src="${esc(i.imageUrl)}" alt="${esc(i.altText||i.title)}" loading="lazy">`:""}<strong>${esc(i.title)}</strong>${i.role?`<span>${esc(i.role)}</span>`:""}${i.summary?`<p>${esc(i.summary)}</p>`:""}</li>`).join("");
   box.hidden=false;box.closest("[data-cms-section]")?.removeAttribute("hidden");
  }catch{}
 };
 document.querySelectorAll("[data-cms-kind]").forEach(renderList);

 // FR-010/024/026/027: contact & partnership form → lead inbox (consent required, honeypot, server validation).
 const host=document.getElementById("imdx-contact-form");
 if(host){
  host.innerHTML=`<h2>${lang==="id"?"Kirim pesan":"Send us a message"}</h2>
  <form novalidate class="imdx-lead-form">
   <label>${lang==="id"?"Jenis":"Topic"}<select name="leadType"><option value="CONTACT">General enquiry</option><option value="EXHIBITOR">Exhibiting</option><option value="PARTNER">Partnership</option><option value="SPONSOR">Sponsorship</option></select></label>
   <label>${lang==="id"?"Nama lengkap":"Full name"} *<input name="name" required minlength="2" maxlength="120" autocomplete="name"></label>
   <label>Email *<input name="email" type="email" required autocomplete="email"></label>
   <label>${lang==="id"?"Perusahaan":"Company"}<input name="company" maxlength="180" autocomplete="organization"></label>
   <label>${lang==="id"?"Telepon":"Phone"}<input name="phone" maxlength="40" autocomplete="tel"></label>
   <label>${lang==="id"?"Pesan":"Message"} *<textarea name="message" required minlength="10" maxlength="3000" rows="5"></textarea></label>
   <label class="hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
   <label class="consent"><input type="checkbox" name="consent" required> ${lang==="id"?"Saya menyetujui pemrosesan data sesuai":"I agree to the processing of my data under the"} <a href="/privacy/" target="_blank" rel="noopener">${lang==="id"?"kebijakan privasi":"privacy notice"}</a>. *</label>
   <p class="form-status" role="status" aria-live="polite"></p>
   <button type="submit" class="btn btn-orange">${lang==="id"?"Kirim":"Send message"} <span>↗</span></button>
  </form>`;
  const form=host.querySelector("form"),status=host.querySelector(".form-status");
  if(topic&&["CONTACT","EXHIBITOR","PARTNER","SPONSOR"].includes(topic))form.elements.namedItem("leadType").value=topic;
  form.addEventListener("submit",async e=>{e.preventDefault();
   form.querySelectorAll("[aria-invalid]").forEach(el=>el.removeAttribute("aria-invalid"));
   if(onPreview){status.textContent="This static preview cannot send messages. Please use the official event domain.";return}
   const fd=new FormData(form),u=utm();
   const body={leadType:fd.get("leadType"),name:fd.get("name"),email:fd.get("email"),message:fd.get("message"),consent:fd.get("consent")==="on",
    ...(fd.get("company")?{company:fd.get("company")}:{}),...(fd.get("phone")?{phone:fd.get("phone")}:{}),...(fd.get("website")?{website:fd.get("website")}:{}),
    ...(u.utm_source?{utmSource:u.utm_source}:{}),...(u.utm_medium?{utmMedium:u.utm_medium}:{}),...(u.utm_campaign?{utmCampaign:u.utm_campaign}:{})};
   if(!body.consent){body.consent=undefined}
   const btn=form.querySelector("button");btn.disabled=true;status.textContent=lang==="id"?"Mengirim…":"Sending…";
   try{const r=await fetch(`${api}/leads`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));
    if(r.ok){form.reset();status.textContent=`${j.message} Reference: ${j.reference}`;}
    else if(j.issues){j.issues.forEach(i=>form.elements.namedItem(i.field)?.setAttribute("aria-invalid","true"));status.textContent=j.issues.map(i=>i.message).join(" · ");}
    else status.textContent=j.message||"Sorry, the message could not be sent.";
   }catch{status.textContent="Network error — please try again."}finally{btn.disabled=false}
  });
 }

 // FR-014/FR-110: exhibitor directory (approved names only, booth numbers from assignments).
 const dir=document.querySelector("[data-exhibitor-directory]");
 if(dir&&!onPreview){const list=dir.querySelector("ul"),search=dir.querySelector("input"),cat=dir.querySelector("select"),empty=dir.querySelector("[data-empty]");
  const load=async()=>{try{const q=new URLSearchParams({q:search.value,category:cat.value});const r=await fetch(`${api}/exhibitors?${q}`);if(!r.ok)return;const j=await r.json();
   if(cat.options.length<=1)j.categories.forEach(c=>cat.add(new Option(c,c)));
   list.innerHTML=j.exhibitors.map(e=>`<li class="cms-partner"><strong>${esc(e.name)}</strong><span>Booth ${esc(e.boothNo)}${e.halls.length?" · Hall "+esc(e.halls.join(", ")):""}</span></li>`).join("");
   empty.hidden=j.exhibitors.length>0;dir.hidden=false}catch{}};
  let t;search.addEventListener("input",()=>{clearTimeout(t);t=setTimeout(load,250)});cat.addEventListener("change",load);load()}

 // FR-013: published news with date and simple pagination.
 const news=document.querySelector("[data-news-list]");
 if(news&&!onPreview){(async()=>{try{const r=await fetch(`${api}/content?kind=NEWS&locale=${lang}`);if(!r.ok)return;const {items}=await r.json();if(!items.length)return;
  let page=0;const per=6,ul=news.querySelector("ul"),more=news.querySelector("button");
  const show=()=>{ul.innerHTML+=items.slice(page*per,(page+1)*per).map(i=>`<li class="cms-news"><time datetime="${esc(i.publishedAt)}">${new Date(i.publishedAt).toLocaleDateString(lang==="id"?"id-ID":"en-GB",{timeZone:"Asia/Jakarta",dateStyle:"long"})}</time><h3>${i.url?`<a href="${esc(i.url)}">${esc(i.title)}</a>`:esc(i.title)}</h3>${i.summary?`<p>${esc(i.summary)}</p>`:""}</li>`).join("");page++;more.hidden=page*per>=items.length};
  more.addEventListener("click",show);show();news.hidden=false}catch{}})()}

 // FR-018: confirmed programme schedule only (no invented times), filter by date.
 const sched=document.querySelector("[data-schedule]");
 if(sched&&!onPreview){(async()=>{try{const r=await fetch(`${api}/events`);if(!r.ok)return;const {events}=await r.json();
  const items=events.flatMap(e=>e.conferences.filter(c=>c.startsAt).map(c=>({title:c.title,startsAt:c.startsAt,state:c.registrationState})));
  if(!items.length)return;const sel=sched.querySelector("select"),ul=sched.querySelector("ul");
  const day=d=>new Date(d).toLocaleDateString("en-CA",{timeZone:"Asia/Jakarta"});
  [...new Set(items.map(i=>day(i.startsAt)))].sort().forEach(d=>sel.add(new Option(new Date(d+"T00:00:00+07:00").toLocaleDateString(lang==="id"?"id-ID":"en-GB",{dateStyle:"full",timeZone:"Asia/Jakarta"}),d)));
  const render=()=>{ul.innerHTML=items.filter(i=>!sel.value||day(i.startsAt)===sel.value).sort((a,b)=>a.startsAt.localeCompare(b.startsAt)).map(i=>`<li><time>${new Date(i.startsAt).toLocaleTimeString("en-GB",{timeZone:"Asia/Jakarta",hour:"2-digit",minute:"2-digit"})} WIB</time> <strong>${esc(i.title)}</strong></li>`).join("")};
  sel.addEventListener("change",render);render();sched.hidden=false}catch{}})()}

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
