/* UAT public frontend bridge: no simulated payment or QR admission. */
(()=>{"use strict";
 const menu=document.getElementById("navLinks"),toggle=document.getElementById("navToggle");
 toggle?.addEventListener("click",()=>{const open=menu?.classList.toggle("open");toggle.setAttribute("aria-expanded",String(Boolean(open)))});
 document.querySelectorAll(".scope-row").forEach(row=>row.addEventListener("click",()=>{
 const expanded=row.getAttribute("aria-expanded")!=="true";
 document.querySelectorAll(".scope-row").forEach(el=>{const isActive=el===row&&expanded;el.setAttribute("aria-expanded",String(isActive));const icon=el.querySelector(".scope-sign");if(icon)icon.textContent=isActive?"−":"+"})
 }));
 function unavailable(){document.querySelector(".uat-unavailable")?.remove();const notice=document.createElement("div");notice.className="uat-unavailable";notice.setAttribute("role","alert");notice.textContent="The secure registration portal is not connected to this static GitHub Pages preview. Please use the organizer's configured UAT staging domain for registration, manual invoices, booth requests and QR passes.";document.body.appendChild(notice);setTimeout(()=>notice.remove(),9000)}
 document.addEventListener("click",event=>{const control=event.target.closest("[data-action]");if(!control)return;const action=control.getAttribute("data-action");if(!["register","exhibitor","dashboard","scanner"].includes(action||""))return;event.preventDefault();if(action==="scanner"){unavailable();return;}
 const target=window.IMDX_UAT_BASE_URL;if(typeof target==="string"&&/^https:\/\//.test(target)){location.assign(target.replace(/\/$/,"")+"/account");return}
 if(location.hostname.endsWith("github.io")){unavailable();return}location.assign("/account")});
 document.querySelectorAll("a[href^='#']").forEach(a=>a.addEventListener("click",()=>{menu?.classList.remove("open");toggle?.setAttribute("aria-expanded","false")}));
})();
