/* CR-PROGRAMME — Programme listing (3 cards per page, ?page= in the URL, Back/Forward) and programme detail pages
   (/programme/<slug>/, /zh/programme/<slug>/). Content comes from CMS → Programme Pages (published only); all CMS text is inserted
   as text (escaped). The designed cards in the HTML stay as a fallback when the API is unavailable. */
(() => {
  'use strict';
  const zh = /^\/zh(\/|$)/.test(location.pathname) || /^zh/i.test(document.documentElement.lang);
  const lang = zh ? "zh" : "en";
  const L = (en, z) => zh ? z : en;
  const api = (window.IMDX_UAT_BASE_URL && /^https:\/\//.test(window.IMDX_UAT_BASE_URL) ? window.IMDX_UAT_BASE_URL.replace(/\/$/, "") : "") + "/api/public";
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
  const safeImg = u => typeof u === "string" && (/^\/[A-Za-z0-9/_\-.%]+$/.test(u) || /^https:\/\/[^\s"'<>]+$/.test(u)) ? u : "";
  const root = zh && location.pathname.startsWith("/zh/") ? "/zh" : "";
  const href = slug => `${root}/programme/${encodeURIComponent(slug)}/`;
  const PAGE_KEY = "imdx-programme-page";
  const offline = location.protocol === "file:" || location.hostname.endsWith("github.io");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmtDate = d => new Date(d + "T00:00:00+07:00").toLocaleDateString(zh ? "zh-CN" : "en-GB", {day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta"});
  const footLabel = i => i.facts?.date ? fmtDate(i.facts.date) + (i.facts.venue ? " · " + i.facts.venue : "") : i.programmeStatus === "REFERENCE" ? L("DETAILS TO BE CONFIRMED", "详情待确认") : L("2027 · SCHEDULE TBA", "2027 · 日程待定");
  const ph = `<span class="programme-ph" aria-hidden="true"><b>IMDX</b><small>2027</small></span>`;

  /* ---------- Listing ---------- */
  const grid = document.querySelector("[data-programme-grid]");
  if (grid && !offline) (async () => {
    // Always revalidate (cache: no-cache): a publish in the CMS shows up on the next page load.
    let items;
    try { const r = await fetch(`${api}/programmes?locale=${lang}`, {cache: "no-cache"}); if (!r.ok) throw 0; items = (await r.json()).items || []; } catch { return; } // keep designed cards
    const size = 3, pages = Math.max(1, Math.ceil(items.length / size));
    const section = grid.closest("section") || grid;
    const pager = document.createElement("nav");
    pager.className = "programme-pager"; pager.setAttribute("aria-label", L("Pagination", "分页"));
    grid.after(pager);
    const clamp = v => { const n = Math.trunc(Number(v)); return Number.isFinite(n) ? Math.min(pages, Math.max(1, n)) : 1; };
    const urlPage = () => new URLSearchParams(location.search).get("page");
    const card = (i, n) => {
      const img = safeImg(i.imageUrl);
      return `<article class="conference-card is-linked${i.isLegacy ? " is-reference" : ""}"${i.fallback ? ' lang="en"' : ""}>
        <div class="conference-card-media">${img ? `<img src="${esc(img)}" alt="${esc(i.imageAlt)}" loading="lazy" decoding="async" width="800" height="450">` : ph}</div>
        <div class="conference-card-content">
          <div class="conference-card-head"><span class="tag">${esc(i.categoryLabel || i.category.replace(/_/g, " "))}</span><span>${String(n).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}</span></div>
          <h3><a class="programme-card-title" href="${esc(href(i.slug))}">${esc(i.title)}</a></h3>
          <p>${esc(i.summary)}</p>
          ${i.isLegacy ? `<span class="programme-ref-badge">${L("Reference programme", "参考项目")}</span>` : ""}
          <div class="conference-foot"><span>${esc(footLabel(i))}</span><span class="conference-card-cta" aria-hidden="true">↗</span></div>
        </div></article>`;
    };
    let page = 0;
    const render = (p, focus) => {
      page = p;
      if (!items.length) {
        grid.innerHTML = `<div class="programme-empty" role="status"><h3>${L("Programme details coming soon", "活动详情即将公布")}</h3><p>${L("Conferences and networking sessions will be announced by the organizer.", "会议与商务交流活动将由主办方另行公布。")}</p><a class="btn btn-orange" href="${root}/contact/">${L("Contact the organizer", "联系主办方")} <span>↗</span></a></div>`;
        pager.hidden = true; return;
      }
      const slice = items.slice((p - 1) * size, p * size);
      grid.innerHTML = slice.map((i, k) => card(i, (p - 1) * size + k + 1)).join("");
      grid.classList.toggle("is-partial", slice.length < size);
      try { sessionStorage.setItem(PAGE_KEY, String(p)); } catch {}
      if (pages < 2) { pager.hidden = true; return; }
      pager.hidden = false;
      const b = (to, label, aria, dis, cls) => `<button type="button" class="${cls || ""}" data-page="${to}" aria-label="${esc(aria)}" ${dis ? "disabled" : ""}${to === p && !cls ? ' aria-current="page"' : ""}>${label}</button>`;
      pager.innerHTML = b(p - 1, `<span aria-hidden="true">←</span> ${L("Previous", "上一页")}`, L("Previous page", "上一页"), p === 1, "is-step") +
        `<span class="programme-pager-pages">${Array.from({length: pages}, (_, k) => b(k + 1, String(k + 1), L("Page ", "第 ") + (k + 1) + L("", " 页"), false)).join("")}</span>` +
        b(p + 1, `${L("Next", "下一页")} <span aria-hidden="true">→</span>`, L("Next page", "下一页"), p === pages, "is-step") +
        `<span class="programme-pager-status" aria-live="polite">${L(`Page ${p} of ${pages}`, `第 ${p} 页，共 ${pages} 页`)}</span>`;
      if (focus) {
        if (section.getBoundingClientRect().top < 0) section.scrollIntoView({behavior: reduce ? "auto" : "smooth", block: "start"});
        grid.querySelector(".programme-card-title")?.focus({preventScroll: true});
      }
    };
    const go = (p, push) => {
      const u = new URL(location.href);
      if (p === 1) u.searchParams.delete("page"); else u.searchParams.set("page", String(p));
      history[push ? "pushState" : "replaceState"]({programmePage: p}, "", u);
      render(p, push);
    };
    pager.addEventListener("click", e => { const t = e.target.closest("button[data-page]"); if (!t || t.disabled) return; const p = clamp(t.dataset.page); if (p !== page) go(p, true); });
    addEventListener("popstate", () => render(clamp(urlPage() || 1), true));
    const asked = urlPage();
    const start = clamp(asked || 1);
    if (asked !== null && String(start) !== asked) go(start, false); else render(start, false); // invalid ?page= → nearest valid page
  })();

  /* ---------- Detail ---------- */
  const box = document.querySelector("[data-programme-detail]");
  if (!box) return;
  const slug = (location.pathname.match(/\/programme\/([a-z0-9-]+)\/?$/) || [])[1] || "";
  const preview = new URLSearchParams(location.search).get("cmsPreview") === "1";
  const backHref = () => { let p = 1; try { p = Number(sessionStorage.getItem(PAGE_KEY)) || 1; } catch {} return `${root}/programme/` + (p > 1 ? `?page=${p}` : ""); };
  const setMeta = (sel, attr, val, create) => { let m = document.head.querySelector(sel); if (!m && create) { m = document.createElement(create.tag); Object.entries(create.attrs).forEach(([k, v]) => m.setAttribute(k, v)); document.head.appendChild(m); } if (m) m.setAttribute(attr, val); };
  const notFound = () => {
    box.removeAttribute("aria-busy");
    setMeta('meta[name="robots"]', "content", "noindex", {tag: "meta", attrs: {name: "robots"}});
    document.title = L("Programme not found", "未找到该活动") + " — IMDX 2027";
    box.innerHTML = `<div class="programme-detail-missing"><p class="eyebrow">404</p><h1>${L("Programme not found", "未找到该活动")}</h1><p>${L("This programme is not published or the address is incorrect.", "该活动尚未发布或链接有误。")}</p><a class="btn btn-orange" href="${esc(backHref())}">${L("Back to all programmes", "返回全部活动")} <span>↗</span></a></div>`;
  };
  if (offline || !slug) return notFound();
  (async () => {
    let j;
    try { const r = await fetch(`${api}/programmes/${encodeURIComponent(slug)}?locale=${lang}${preview ? "&preview=1" : ""}`, {credentials: "same-origin", cache: preview ? "no-store" : "no-cache"}); if (!r.ok) return notFound(); j = await r.json(); } catch { return notFound(); }
    const i = j.item, img = safeImg(i.imageUrl), f = i.facts || {};
    const origin = location.origin, path = `/programme/${i.slug}/`, url = origin + root + path;
    // SEO
    document.title = (i.seoTitle || i.title) + " — IMDX 2027";
    const desc = i.seoDescription || i.summary;
    setMeta('meta[name="description"]', "content", desc, {tag: "meta", attrs: {name: "description"}});
    setMeta('link[rel="canonical"]', "href", url, {tag: "link", attrs: {rel: "canonical"}});
    [["og:title", i.title], ["og:description", desc], ["og:url", url], ["og:type", "article"], ["og:locale", zh ? "zh_CN" : "en_GB"], ...(img ? [["og:image", img.startsWith("/") ? origin + img : img]] : [])]
      .forEach(([p, v]) => setMeta(`meta[property="${p}"]`, "content", v, {tag: "meta", attrs: {property: p}}));
    document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach(n => n.remove());
    [["en", origin + path], ["zh-Hans", origin + "/zh" + path], ["x-default", origin + path]].forEach(([h, u]) => { const l = document.createElement("link"); l.rel = "alternate"; l.hreflang = h; l.href = u; document.head.appendChild(l); });
    const ld = [{"@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{"@type": "ListItem", position: 1, name: L("Home", "首页"), item: origin + root + "/"}, {"@type": "ListItem", position: 2, name: L("Programme", "活动"), item: origin + root + "/programme/"}, {"@type": "ListItem", position: 3, name: i.title, item: url}]}];
    if (f.date && f.venue) ld.push({"@context": "https://schema.org", "@type": "Event", name: i.title, description: i.summary, startDate: f.date, eventStatus: "https://schema.org/EventScheduled", location: {"@type": "Place", name: f.venue}, ...(img ? {image: img.startsWith("/") ? origin + img : img} : {})}); // only organizer-confirmed facts
    const s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(ld); document.head.appendChild(s);
    // Content
    const tba = L("To be announced", "待公布");
    const meta = [[L("Date", "日期"), f.date ? fmtDate(f.date) : tba], [L("Time", "时间"), f.time ? f.time + " WIB" : tba], [L("Venue", "地点"), f.venue || tba], [L("Admission", "费用"), f.fee || tba]];
    const paras = String(i.overview || "").replace(/\r/g, "").split(/\n{2,}/).map(t => t.trim()).filter(Boolean).map(t => `<p>${t.split("\n").map(esc).join("<br>")}</p>`).join("");
    const c = i.conference;
    const cta = c && c.state === "AVAILABLE" ? `<a class="btn btn-orange" href="${esc(c.href)}">${L("Register for conference", "报名参会")} <span>↗</span></a>`
      : c && c.state === "FULL" ? `<span class="programme-cta-note" role="status">${L("This conference is fully booked.", "本场会议名额已满。")}</span>`
      : `<span class="programme-cta-note">${L("Registration details coming soon", "报名信息即将公布")}</span>`;
    const crumbs = `<nav class="breadcrumb programme-crumb" aria-label="${L("Breadcrumb", "面包屑导航")}"><ol><li><a href="${root}/">${L("Home", "首页")}</a></li><li><a href="${esc(backHref())}">${L("Programme", "活动")}</a></li><li aria-current="page">${esc(i.title)}</li></ol></nav>`;
    box.innerHTML = (j.preview && j.status !== "PUBLISHED" ? `<div class="programme-preview-bar" role="status">${L("PREVIEW — this page is not published", "预览 — 此页面尚未发布")} (${esc(j.status)})</div>` : "") + crumbs + `
      ${i.fallback ? `<p class="programme-lang-note" role="note">中文版本即将提供，以下为英文内容。</p>` : ""}
      <div class="programme-hero"${i.fallback ? ' lang="en"' : ""}>
        <div class="programme-hero-copy">
          <div class="programme-tags"><span class="tag">${esc(i.categoryLabel || i.category.replace(/_/g, " "))}</span>${i.isLegacy ? `<span class="programme-ref-badge">${L("Reference programme", "参考项目")}</span>` : ""}</div>
          <h1>${esc(i.title)}</h1>
          <p class="programme-lead">${esc(i.summary)}</p>
          <dl class="programme-facts">${meta.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd${v === tba ? ' class="is-tba"' : ""}>${esc(v)}</dd></div>`).join("")}</dl>
          <div class="programme-actions">${cta}<a class="btn programme-btn-secondary" href="${esc(backHref())}"><span aria-hidden="true">←</span> ${L("Back to all programmes", "返回全部活动")}</a></div>
        </div>
        <figure class="programme-cover">${img ? `<img src="${esc(img)}" alt="${esc(i.imageAlt)}" width="1200" height="675" decoding="async">` : ph}</figure>
      </div>
      <div class="programme-body"${i.fallback ? ' lang="en"' : ""}>
        <section aria-labelledby="ov-h"><h2 id="ov-h">${L("Overview", "概览")}</h2>${paras}</section>
        ${i.highlights?.length ? `<section aria-labelledby="hl-h"><h2 id="hl-h">${L("Highlights", "亮点")}</h2><ol class="programme-highlights">${i.highlights.map((h, n) => `<li><span aria-hidden="true">${String(n + 1).padStart(2, "0")}</span><p>${esc(h)}</p></li>`).join("")}</ol></section>` : ""}
        ${i.source ? `<aside class="programme-source" aria-label="${L("Source reference", "资料来源")}"><strong>${L("Reference programme", "参考项目")}</strong><p>${L("This page summarises information published by a third-party source. Dates, venue, fees and the agenda are not yet confirmed by the IMDX organizer.", "本页面概述第三方来源发布的信息。日期、地点、费用及议程尚未经 IMDX 主办方确认。")}</p><a href="${esc(i.source.url)}" target="_blank" rel="noopener noreferrer nofollow">${esc(i.source.title || i.source.url)} <span aria-hidden="true">↗</span><span class="programme-sr">${L("(opens in a new tab)", "（在新标签页打开）")}</span></a></aside>` : ""}
      </div>`;
    box.removeAttribute("aria-busy");
    box.querySelector("h1").setAttribute("tabindex", "-1");
  })();
})();
