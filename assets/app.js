/**
 * IMDX27 concept prototype
 * No API calls, payments, accounts, persistence or actual ticket validation.
 * All form entries are held in browser memory only until refresh.
 */
(() => {
  "use strict";
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
  const modal = $("#modal");
  const body = $("#modalBody");
  const title = $("#modalTitle");
  const toastNode = $("#toast");
  const eventDates = "26–28 May 2027";
  const sizes = [9,18,36,72,90,108,144,180,240];
  const programs = [
    "Exhibition Visitor Pass",
    "Mining Downstream Industry & Green Mining Conference",
    "China–Indonesia Coal & Energy Conference",
    "Indonesia Mining Industry Networking Reception"
  ];
  const demo = {
    attendee: null, program: programs[0], booth: null,
    passCode: "IMDX27-DEMO-0001",
    passIndex: 1, checkedIn: false, payment: "QRIS"
  };
  const escapeHTML = x => String(x??"").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let toastTimer;
  const note = "CONCEPT DEMO — no real registration, booking, payment, admission or data submission takes place.";
  const banner = `<div class="demo-notice"><strong>Presentation prototype.</strong> ${note} All information entered stays temporarily in this browser tab.</div>`;
  const btn = (txt,action,klass="btn btn-orange")=>`<button type="button" class="${klass}" data-action="${action}">${txt} <span>↗</span></button>`;
  const field = (id,label,type="text",placeholder="",required=true)=>`<div class="form-field"><label for="${id}">${label}</label><input id="${id}" name="${id}" type="${type}" placeholder="${placeholder}" ${required?"required":""} autocomplete="off"></div>`;
  function showToast(message){
    toastNode.textContent=message;
    toastNode.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>toastNode.classList.remove("show"),3500);
  }
  function openModal(heading, html){
    title.textContent=heading;
    body.innerHTML=html;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";
    $(".modal-close")?.focus();
  }
  function closeModal(){
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden","true");
    document.body.style.overflow="";
    stopCamera();
  }
  function errorBox(msg){ return `<div class="scan-result no" role="alert">${escapeHTML(msg)}</div>` }
  function exhibitor(){
    openModal("Exhibitor booth request", `${banner}
      <div class="progress-steps"><span class="active">01 / COMPANY DETAILS</span><span>02 / REQUEST SUMMARY</span></div>
      <form id="exhibitForm">
        <p class="step-heading">Tell us about your company</p>
        <div class="form-grid">
          ${field("company","Company name","text","e.g. Nusantara Mining Technologies")}
          ${field("contact","Contact person","text","Your full name")}
          ${field("email","Business email","email","name@company.com")}
          ${field("phone","Contact number","tel","+62 ...")}
          <div class="form-field full"><label for="boothArea">Preferred booth area</label>
            <select id="boothArea" required>${sizes.map(s=>`<option value="${s}" ${s===18?"selected":""}>${s} m²</option>`).join("")}</select>
          </div>
          <div class="form-field full"><label for="companyInfo">What would you like to showcase? (optional)</label>
            <textarea id="companyInfo" placeholder="Mining machinery, mineral processing, automation..."></textarea>
          </div>
        </div>
        <div class="form-actions"><button class="btn btn-neutral" type="button" data-action="close">Cancel</button><button class="btn btn-orange" type="submit">Preview Booth Request ↗</button></div>
      </form>`);
    $("#exhibitForm").addEventListener("submit", e=>{
      e.preventDefault();
      const f=e.currentTarget;
      if(!f.reportValidity())return;
      demo.booth={company:$("#company").value.trim(),name:$("#contact").value.trim(),email:$("#email").value.trim(),phone:$("#phone").value.trim(),size:$("#boothArea").value,info:$("#companyInfo").value.trim()};
      exhibitSummary();
    });
  }
  function exhibitSummary(){
    const b=demo.booth;
    openModal("Booth request preview", `${banner}
      <div class="progress-steps"><span>01 / COMPANY DETAILS</span><span class="active">02 / REQUEST SUMMARY</span></div>
      <h3 class="step-heading">Your proposed exhibition space</h3>
      <div class="summary-box">
        <div class="summary-line"><span>Company</span><strong>${escapeHTML(b.company)}</strong></div>
        <div class="summary-line"><span>Contact</span><strong>${escapeHTML(b.name)}</strong></div>
        <div class="summary-line"><span>Booth area</span><strong>${escapeHTML(b.size)} m²</strong></div>
        <div class="summary-line"><span>Exhibition</span><strong>IMDX 2027, JIEXPO Jakarta</strong></div>
        <div class="summary-line"><span>Pricing / availability</span><strong>Subject to organizer quotation</strong></div>
      </div><p class="modal-footnote">In the production system, booth requests would enter an approval/quotation workflow. This demo does not send them to any organizer.</p>
      <div class="form-actions"><button class="btn btn-neutral" data-action="exhibitor">Edit Request</button>${btn("Finish demo","finish-exhibitor")}</div>`);
  }
  function register(program){
    demo.program=program&&programs.includes(program)?program:demo.program;
    const options=programs.map((p,i)=>`<option value="${i}" ${p===demo.program?"selected":""}>${escapeHTML(p)}</option>`).join("");
    openModal("Create your event pass", `${banner}
      <div class="progress-steps"><span class="active">01 / PROFILE</span><span>02 / CHECKOUT DEMO</span><span>03 / QR PASS</span></div>
      <form id="registrationForm">
        <h3 class="step-heading">Your event experience starts here.</h3>
        <div class="form-grid">
          ${field("fullName","Full name","text","e.g. Alex Pratama")}
          ${field("participantEmail","Email address","email","alex@example.com")}
          ${field("participantCompany","Company / organization","text","e.g. PT Example Indonesia",false)}
          ${field("participantRole","Job title (optional)","text","e.g. Procurement Manager",false)}
          <div class="form-field full"><label for="program">Choose event access</label><select id="program" required>${options}</select></div>
        </div>
        <div class="form-actions"><button type="button" class="btn btn-neutral" data-action="close">Cancel</button><button class="btn btn-orange" type="submit">Continue to Checkout ↗</button></div>
      </form>`);
    $("#registrationForm").addEventListener("submit",e=>{
      e.preventDefault();
      if(!e.currentTarget.reportValidity())return;
      const selection=Number($("#program").value);
      demo.program=programs[selection];
      demo.attendee={name:$("#fullName").value.trim(),email:$("#participantEmail").value.trim(),company:$("#participantCompany").value.trim(),role:$("#participantRole").value.trim()};
      checkout();
    });
  }
  function checkout(){
    if(!demo.attendee)return register();
    const isVisitor=demo.program===programs[0];
    openModal("Checkout preview", `${banner}
      <div class="progress-steps"><span>01 / PROFILE</span><span class="active">02 / CHECKOUT DEMO</span><span>03 / QR PASS</span></div>
      <h3 class="step-heading">Review your registration</h3>
      <div class="summary-box">
        <div class="summary-line"><span>Participant</span><strong>${escapeHTML(demo.attendee.name)}</strong></div>
        <div class="summary-line"><span>Access type</span><strong>${escapeHTML(demo.program)}</strong></div>
        <div class="summary-line"><span>Event dates</span><strong>${eventDates}</strong></div>
        <div class="summary-line"><span>Registration fee</span><strong>To be announced</strong></div>
      </div>
      <p class="modal-footnote">${isVisitor?"Visitor access pricing has not been confirmed.":"Conference package pricing has not been confirmed."} These buttons only illustrate the intended payment experience.</p>
      <h3 class="step-heading" style="font-size:18px;margin:22px 0 7px">Simulated payment method</h3>
      <div class="demo-payment">
        ${["QRIS","Virtual Account","E-Wallet"].map(v=>`<button type="button" class="payment-opt ${demo.payment===v?"selected":""}" data-method="${v}">${v}</button>`).join("")}
      </div>
      <div class="form-actions"><button class="btn btn-neutral" data-action="register-again">Back</button>${btn("Simulate Confirmation","confirm-demo")}</div>`);
    $$("[data-method]",body).forEach(el=>el.addEventListener("click",()=>{
      demo.payment=el.dataset.method;
      $$("[data-method]",body).forEach(b=>b.classList.toggle("selected",b===el));
    }));
  }
  function confirm(){
    if(!demo.attendee)return register();
    demo.checkedIn=false;
    demo.passIndex = 1+Math.floor(Math.random()*20);
    demo.passCode = `IMDX27-DEMO-${String(demo.passIndex).padStart(4,"0")}`;
    dashboard(true);
  }
  function passImg(){
    return window.IMDX_QR_DATA?.[demo.passIndex] || window.IMDX_QR_DATA?.[1] || "";
  }
  function dashboard(newlyConfirmed=false){
    if(!demo.attendee){
      openModal("Participant dashboard",`${banner}
        <p class="dashboard-intro">Discover how visitors and conference attendees will manage their profile, registration status and digital entry pass.</p>
        <div class="empty-state"><strong>No sample registration has been created in this tab.</strong><p>Choose “Create Demo Account” to walk through the journey and generate your sample QR pass.</p></div>
        <div class="form-actions">${btn("Create Demo Account","register")}</div>`);
      return;
    }
    openModal("My participant dashboard", `${banner}
      ${newlyConfirmed?'<div class="scan-result ok"><strong>Demo registration confirmed.</strong> A sample QR pass has been generated.</div>':""}
      <p class="dashboard-intro">Hello, <strong>${escapeHTML(demo.attendee.name)}</strong>. Your event profile and sample QR pass are ready for review.</p>
      <div class="dashboard-card">
        <div><span>IMDX27 · DIGITAL PASS · DEMO ONLY</span><h3>${escapeHTML(demo.attendee.name)}</h3><small>${escapeHTML(demo.program)}</small><p style="font-size:12px;letter-spacing:.06em;margin-top:14px">${escapeHTML(demo.passCode)}</p></div>
        <img src="${passImg()}" alt="Demonstration QR code for an event pass">
      </div>
      <div class="dashboard-detail summary-box">
        <div class="summary-line"><span>Participant email</span><strong>${escapeHTML(demo.attendee.email)}</strong></div>
        <div class="summary-line"><span>Company</span><strong>${escapeHTML(demo.attendee.company||"Not provided")}</strong></div>
        <div class="summary-line"><span>Event</span><strong>${eventDates} · JIEXPO Jakarta</strong></div>
        <div class="summary-line"><span>Demo status</span><strong>${demo.checkedIn?"Simulated checked-in":"Sample pass issued"}</strong></div>
      </div>
      <p class="modal-footnote">Sample QR codes are not valid for event admission. A production system would issue unique signed tokens, verify registration and payment on a server, and track check-ins securely.</p>
      <div class="form-actions"><button class="btn btn-neutral" data-action="scanner">Try Staff Check-in</button>${btn("Close","close")}</div>`);
  }
  let cameraStream=null;
  let cameraTimer=null;
  async function stopCamera(){
    if(cameraTimer)clearInterval(cameraTimer);
    cameraTimer=null;
    if(cameraStream)cameraStream.getTracks().forEach(t=>t.stop());
    cameraStream=null;
  }
  function scanner(){
    openModal("Organizer check-in simulator",`${banner}
      <p class="dashboard-intro">Preview the on-site entry workflow. The scanner only recognizes simulated passes created in this browser session or the publicly shared sample code.</p>
      <div class="demo-scan-frame" id="cameraHolder">
        <div class="text-center"><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5"><path d="M9 33V9h24M67 9h24v24M91 67v24H67M33 91H9V67"/><path d="M17 50h66M50 17v66" stroke-width="2"/></svg><p style="font-size:12px;margin-top:3px">Optional camera scanning (supported browsers)</p></div>
      </div>
      <form id="scannerForm">
        <div class="form-grid">
          <div class="form-field full"><label for="scanCode">Pass code</label><input id="scanCode" type="text" placeholder="IMDX27-DEMO-0001" required value="${escapeHTML(demo.attendee?demo.passCode:"IMDX27-DEMO-0001")}"></div>
        </div><div class="form-actions" style="justify-content:space-between"><button type="button" class="btn btn-neutral" id="cameraButton">Enable Camera</button><button type="submit" class="btn btn-orange">Validate Demo Pass ↗</button></div>
      </form><div id="scanFeedback" aria-live="polite"></div>
      <p class="modal-footnote">This is a simulated check-in with no organizer database, server-side access rules or actual attendance record.</p>`);
    $("#scannerForm").addEventListener("submit",e=>{
      e.preventDefault(); validatePass($("#scanCode").value);
    });
    $("#cameraButton").addEventListener("click",startCamera);
  }
  function validatePass(raw){
    const value=raw.trim().replace(/^DEMO-ONLY:/i,"");
    const feedback=$("#scanFeedback");
    if(!feedback)return;
    let result;
    if(demo.attendee&&value===demo.passCode){
      if(demo.checkedIn)result='<div class="scan-result no"><strong>Already checked in (simulated).</strong><br>This demo pass has already been used in this browser session.</div>';
      else{
        demo.checkedIn=true;
        result=`<div class="scan-result ok"><strong>✓ Demo check-in accepted.</strong><br>${escapeHTML(demo.attendee.name)} · ${escapeHTML(demo.program)}<br>Sample record marked checked-in for this browser session.</div>`;
      }
    } else if(!demo.attendee&&value==="IMDX27-DEMO-0001") {
      result='<div class="scan-result ok"><strong>✓ Example QR detected.</strong><br>This is the public demo code. Create a participant profile to simulate personalized validation.</div>';
    } else{
      result=errorBox("Unrecognized sample pass in this browser session. Create a demo registration first, or enter IMDX27-DEMO-0001 for the sample.");
    }
    feedback.innerHTML=result;
  }
  async function startCamera(){
    const feedback=$("#scanFeedback");
    if(!("BarcodeDetector" in window)){
      feedback.innerHTML=errorBox("This browser does not support built-in QR camera scanning. You can still validate the example pass code manually.");
      return;
    }
    try {
      await stopCamera();
      if(!navigator.mediaDevices?.getUserMedia)throw new Error("Camera access requires HTTPS and permission.");
      cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"},audio:false});
      const holder=$("#cameraHolder");
      if(!holder){stopCamera();return;}
      holder.innerHTML='<video autoplay playsinline muted style="width:100%;height:100%;object-fit:cover;border-radius:8px"></video>';
      const video=$("video",holder);video.srcObject=cameraStream;await video.play();
      const detector=new BarcodeDetector({formats:["qr_code"]});
      let busy=false;
      cameraTimer=setInterval(async()=>{
        if(busy||video.readyState<2)return;
        busy=true;
        try{
          const codes=await detector.detect(video);
          if(codes.length){
            const code=codes[0].rawValue.replace(/^DEMO-ONLY:/,"");
            $("#scanCode").value=code;
            validatePass(code);
            await stopCamera();
            $("#cameraButton").textContent="Camera scan complete";
          }
        }catch(e){ /* camera preview remains available */ }
        finally{ busy=false; }
      },500);
    }catch(e){
      await stopCamera();
      feedback.innerHTML=errorBox(e.message||"Unable to access your camera. Use manual sample code entry.");
    }
  }
  document.addEventListener("click",e=>{
    const toggle=e.target.closest("#navToggle");
    if(toggle){
      const nav=$("#navLinks");const open=nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded",String(open));return;
    }
    const scope=e.target.closest(".scope-row");
    if(scope){
      $$(".scope-row").forEach(row=>{
        const selected=row===scope && row.getAttribute("aria-expanded")!=="true";
        row.setAttribute("aria-expanded",String(selected));
        $(".scope-sign",row).textContent=selected?"−":"+";
      });
      return;
    }
    const action=e.target.closest("[data-action]")?.dataset.action;
    if(!action)return;
    e.preventDefault();
    if(action==="close") closeModal();
    else if(action==="exhibitor")exhibitor();
    else if(action==="finish-exhibitor"){closeModal();showToast("Booth request preview complete. Nothing was submitted.");}
    else if(action==="register")register(e.target.closest("[data-action]").dataset.program);
    else if(action==="register-again")register(demo.program);
    else if(action==="confirm-demo")confirm();
    else if(action==="dashboard")dashboard();
    else if(action==="scanner")scanner();
  });
  $$("a[href^='#']").forEach(link=>link.addEventListener("click",()=>{
    $("#navLinks")?.classList.remove("open");
    $("#navToggle")?.setAttribute("aria-expanded","false");
  }));
  document.addEventListener("keydown",e=>{if(e.key==="Escape" && modal.classList.contains("is-open")) closeModal();});
  console.info("IMDX27 conceptual demo loaded. No live payment or attendee system is connected.");
})();
