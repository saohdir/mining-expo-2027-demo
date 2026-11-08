/* Organizer list data: names are brochure references; roles intentionally unassigned. */
(()=>{"use strict";
 const organizers=[{"name":"Shixin International Exhibition Group","logo":"shixin-international-exhibition-group.webp","kind":"extra-wide","width":640,"height":144,"role":"","sortOrder":1},{"name":"PT Seesion Exhibition Indonesia","logo":"pt-seesion-exhibition-indonesia.webp","kind":"wide","width":640,"height":241,"role":"","sortOrder":2},{"name":"Indonesian Mining Services Association","logo":"aspindo-indonesian-mining-services-association.webp","kind":"compact","width":640,"height":438,"role":"","sortOrder":3},{"name":"Indonesia China Business Council","logo":"indonesia-china-business-council.webp","kind":"square","width":640,"height":510,"role":"","sortOrder":4},{"name":"Indonesian Coal Mining Association (APBI-ICMA)","logo":"apbi-icma-indonesian-coal-mining-association.webp","kind":"extra-wide","width":640,"height":193,"role":"","sortOrder":5}];
 const ordered=organizers.slice().sort((a,b)=>a.sortOrder-b.sortOrder);
 const initials=s=>s.replace(/\([^)]*\)/g,"").split(/\s+/).filter(Boolean).slice(0,3).map(w=>w[0]).join("").toUpperCase();
 document.querySelectorAll("[data-organizer-list]").forEach(list=>{
   const base=list.getAttribute("data-logo-base")||"";
   const fragment=document.createDocumentFragment();
   ordered.forEach(org=>{
     const card=document.createElement("li");card.className="org-card";
     const media=document.createElement("div");media.className="org-card__logo";
     if(org.logo){
       const img=document.createElement("img");
       img.src=base+org.logo;
       img.alt="Logo of "+org.name;
       img.width=org.width;img.height=org.height;
       img.loading="lazy";img.decoding="async";
       img.dataset.logoKind=org.kind;
       media.appendChild(img);
     } else {
       const fallback=document.createElement("span");
       fallback.className="org-card__monogram";fallback.textContent=initials(org.name);
       fallback.setAttribute("aria-hidden","true");media.appendChild(fallback);
     }
     const heading=document.createElement("h3");heading.className="org-card__name";heading.textContent=org.name;
     card.append(media,heading);
     // Role is intentionally empty/unrendered until confirmed by the organizer.
     fragment.appendChild(card);
   });
   list.replaceChildren(fragment);
 });
})();