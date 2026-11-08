/* IMDX 2027 public site ↔ platform integration (PRD v1.4 FR-003/005/009/010/024/030).
   Works only on the same-domain UAT/production deployment; on static previews it degrades to
   the existing static content. No payment or admission logic runs in the browser. */
(()=>{"use strict";
 const onPreview=location.hostname.endsWith("github.io")||location.protocol==="file:";
 const api=(window.IMDX_UAT_BASE_URL&&/^https:\/\//.test(window.IMDX_UAT_BASE_URL)?window.IMDX_UAT_BASE_URL.replace(/\/$/,""):"")+"/api/public";
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const lang=(document.documentElement.lang||"en").startsWith("id")?"id":"en";

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
 document.querySelectorAll("[data-cms-kind]").forEach(async box=>{
  if(onPreview)return;
  try{const r=await fetch(`${api}/content?kind=${encodeURIComponent(box.dataset.cmsKind)}&locale=${lang}`);if(!r.ok)return;const {items}=await r.json();if(!items?.length)return;
   const kind=box.dataset.cmsKind;
   box.innerHTML=items.map(i=>kind==="DOWNLOAD"
    ?`<li class="cms-download"><a href="${esc(i.url)}" download>${esc(i.title)}</a> <span>${esc(i.fileType||"")}${i.fileSizeBytes?" · "+Math.max(1,Math.round(i.fileSizeBytes/1024))+" KB":""} · ${lang==="id"?"Diperbarui":"Updated"} ${new Date(i.updatedAt).toLocaleDateString(lang==="id"?"id-ID":"en-GB",{timeZone:"Asia/Jakarta"})}</span></li>`
    :kind==="GALLERY"?`<li class="cms-gallery"><a href="${esc(i.imageUrl)}" target="_blank" rel="noopener"><img src="${esc(i.imageUrl)}" alt="${esc(i.altText||i.title)}" loading="lazy"></a><span>${esc(i.title)}${i.role?" · "+esc(i.role):""}</span></li>`
    :`<li class="cms-partner">${i.imageUrl?`<img src="${esc(i.imageUrl)}" alt="${esc(i.altText||i.title)}" loading="lazy">`:""}<strong>${esc(i.title)}</strong>${i.role?`<span>${esc(i.role)}</span>`:""}${i.summary?`<p>${esc(i.summary)}</p>`:""}</li>`).join("");
   box.hidden=false;box.closest("[data-cms-section]")?.removeAttribute("hidden");
  }catch{}
 });

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
})();
