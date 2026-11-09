/* Organizer & Partners / Media Partners cards. Content: CMS → Website Content → Organizers (kind ORGANIZER) and Media partners
   (kind PARTNER), published items in the page language, ordered by "Order". The built-in organizer list is only a fallback when
   the CMS has none (or is unreachable). Names are inserted as text; logos must be site paths or https URLs. */
(()=>{"use strict";
 const fallback=[{"title":"Shixin International Exhibition Group","imageUrl":"shixin-international-exhibition-group.webp"},{"title":"PT Seesion Exhibition Indonesia","imageUrl":"pt-seesion-exhibition-indonesia.webp"},{"title":"Indonesian Mining Services Association","imageUrl":"aspindo-indonesian-mining-services-association.webp"},{"title":"China Council for the Promotion of International Trade","imageUrl":"indonesia-china-business-council.webp"},{"title":"Indonesian Coal Mining Association (APBI-ICMA)","imageUrl":"apbi-icma-indonesian-coal-mining-association.webp"}];
 const zh=/^\/zh(\/|$)/.test(location.pathname)||/^zh/i.test(document.documentElement.lang);
 const api=(window.IMDX_UAT_BASE_URL&&/^https:\/\//.test(window.IMDX_UAT_BASE_URL)?window.IMDX_UAT_BASE_URL.replace(/\/$/,""):"")+"/api/public";
 const offline=location.protocol==="file:"||location.hostname.endsWith("github.io");
 const safe=u=>typeof u==="string"&&(/^\/[A-Za-z0-9/_\-.%]+$/.test(u)||/^https:\/\/[^\s"'<>]+$/.test(u))?u:"";
 const initials=s=>s.replace(/\([^)]*\)/g,"").split(/\s+/).filter(Boolean).slice(0,3).map(w=>w[0]).join("").toUpperCase();
 // Logo box fitted to the logo's shape (wide word marks vs. square emblems).
 const kind=img=>{const r=img.naturalWidth/(img.naturalHeight||1);img.dataset.logoKind=r>3.4?"extra-wide":r>2?"wide":r>1.15?"compact":"square"};
 const render=(list,items,base)=>{
   const fragment=document.createDocumentFragment();
   items.forEach(org=>{
     const card=document.createElement("li");card.className="org-card";
     const media=document.createElement("div");media.className="org-card__logo";
     const src=org.imageUrl&&(/^[a-z0-9-]+\.(webp|png|svg|jpe?g)$/i.test(org.imageUrl)?base+org.imageUrl:safe(org.imageUrl));
     if(src){const img=document.createElement("img");img.src=src;img.alt=org.altText||(zh?"标志：":"Logo of ")+org.title;img.loading="lazy";img.decoding="async";
       img.addEventListener("load",()=>kind(img),{once:true});if(img.complete&&img.naturalWidth)kind(img);media.appendChild(img)}
     else{const m=document.createElement("span");m.className="org-card__monogram";m.textContent=initials(org.title);m.setAttribute("aria-hidden","true");media.appendChild(m)}
     const h=document.createElement("h3");h.className="org-card__name";h.textContent=org.title;
     card.append(media,h);
     if(org.role){const r=document.createElement("p");r.className="org-card__role";r.textContent=org.role;card.appendChild(r)}
     fragment.appendChild(card);
   });
   list.replaceChildren(fragment);
 };
 document.querySelectorAll("[data-organizer-list]").forEach(async list=>{
   const kindName=list.dataset.kind||"ORGANIZER",base=list.getAttribute("data-logo-base")||"/assets/logos/";
   const section=list.closest("section");
   if(kindName==="ORGANIZER")render(list,fallback,base); // immediate, then replaced by CMS content
   if(offline)return;
   try{const r=await fetch(`${api}/content?kind=${kindName}&locale=${zh?"zh":"en"}`,{cache:"no-cache"});if(!r.ok)return;const {items}=await r.json();
     if(items&&items.length){render(list,items,base);list.hidden=false;if(section){section.hidden=false;section.removeAttribute("hidden")}}
   }catch{/* keep fallback / hidden */}
 });
})();
