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
 if(location.hostname.endsWith("github.io")){unavailable();return}
 if(action==="exhibitor"){location.assign("/floorplan");return}
 openAccount(control)});
 // Sign-in / registration popup (owner request): the account form opens over the page instead of a separate page.
 // Signed-in customers go straight to their account. The form itself is /account?embed=1 (same site), which reports back when done.
 async function openAccount(trigger){
  try{if((await fetch("/api/customer/me",{credentials:"same-origin",cache:"no-store"})).ok){location.assign("/account");return}}catch{}
  const zh=/^\/zh(\/|$)/.test(location.pathname)||/^zh/i.test(document.documentElement.lang);
  const shade=document.createElement("div");shade.className="auth-popup";shade.innerHTML=`<div class="auth-popup-panel" role="dialog" aria-modal="true" aria-label="${zh?"登录或注册":"Sign in or register"}"><button type="button" class="auth-popup-close" aria-label="${zh?"关闭":"Close"}">×</button><div class="auth-popup-loading" role="status">${zh?"加载中…":"Loading…"}</div><iframe title="${zh?"IMDX 账户登录与注册":"IMDX account sign-in and registration"}" src="/account?embed=1"></iframe></div>`;
  const frame=shade.querySelector("iframe"),panel=shade.querySelector(".auth-popup-panel");
  const close=()=>{removeEventListener("message",onMsg);removeEventListener("keydown",onKey);shade.remove();document.body.classList.remove("auth-popup-open");trigger&&trigger.focus&&trigger.focus()};
  const onMsg=e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow||!e.data||e.data.source!=="imdx-account")return;
   if(e.data.type==="size"&&e.data.height){frame.style.height=Math.min(e.data.height+4,innerHeight-80)+"px";shade.classList.add("is-ready")}
   if(e.data.type==="close"){close();return}
   if(e.data.type==="signed-in"){const next=typeof e.data.next==="string"&&/^\/account(\?tab=[a-z]+)?$/.test(e.data.next)?e.data.next:"/account";location.assign(next)}};
  const onKey=e=>{if(e.key==="Escape")close()};
  shade.addEventListener("click",e=>{if(e.target===shade||e.target.closest(".auth-popup-close"))close()});
  addEventListener("message",onMsg);addEventListener("keydown",onKey);
  frame.addEventListener("load",()=>{shade.classList.add("is-ready");frame.focus()});
  document.body.appendChild(shade);document.body.classList.add("auth-popup-open");panel.querySelector(".auth-popup-close").focus();
 }
 document.querySelectorAll("a[href^='#']").forEach(a=>a.addEventListener("click",()=>{menu?.classList.remove("open");toggle?.setAttribute("aria-expanded","false")}));
})();
