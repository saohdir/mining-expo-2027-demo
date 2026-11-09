/* Event Highlight gallery (/highlights/): year buttons, 12 photos/videos per page, lightbox with keyboard + swipe.
   Content: CMS → Event Gallery (published, compressed items only). URL keeps ?year=&page= so Back/Forward and sharing work. */
(() => {
  'use strict';
  const grid = document.querySelector("[data-gallery-grid]");
  if (!grid) return;
  const zh = /^\/zh(\/|$)/.test(location.pathname) || /^zh/i.test(document.documentElement.lang);
  const L = (en, z) => zh ? z : en;
  const api = (window.IMDX_UAT_BASE_URL && /^https:\/\//.test(window.IMDX_UAT_BASE_URL) ? window.IMDX_UAT_BASE_URL.replace(/\/$/, "") : "") + "/api/public";
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
  const safe = u => typeof u === "string" && /^\/api\/public\/gallery-media\/[0-9a-f-]{36}\.(webp|mp4)$/.test(u) ? u : "";
  const yearsBox = document.querySelector("[data-gallery-years]"), pager = document.querySelector("[data-gallery-pager]"), empty = document.querySelector("[data-gallery-empty]");
  const section = grid.closest("section") || grid;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dur = s => s ? Math.floor(s / 60) + ":" + String(Math.round(s % 60)).padStart(2, "0") : "";
  if (zh && empty) empty.textContent = "展会结束后，精彩图片与视频将在此发布。";
  let state = {year: null, page: 1, data: null};

  const params = () => { const q = new URLSearchParams(location.search); return {year: Number(q.get("year")) || null, page: Math.max(1, Math.trunc(Number(q.get("page"))) || 1)}; };
  async function load(year, page, push, focus) {
    grid.setAttribute("aria-busy", "true");
    let d;
    try { const r = await fetch(`${api}/gallery?${new URLSearchParams({locale: zh ? "zh" : "en", ...(year ? {year: String(year)} : {}), page: String(page)})}`, {cache: "no-cache"}); if (!r.ok) throw 0; d = await r.json(); }
    catch { grid.removeAttribute("aria-busy"); empty.hidden = false; return; }
    state = {year: d.year, page: d.page, data: d};
    const u = new URL(location.href);
    if (d.year && d.year !== d.years[0]?.year) u.searchParams.set("year", d.year); else u.searchParams.delete("year");
    if (d.page > 1) u.searchParams.set("page", d.page); else u.searchParams.delete("page");
    if (u.href !== location.href) history[push ? "pushState" : "replaceState"]({gallery: 1}, "", u);
    render(focus);
  }
  function render(focus) {
    const d = state.data;
    grid.removeAttribute("aria-busy");
    // Year buttons
    yearsBox.hidden = !d.years.length;
    yearsBox.innerHTML = d.years.map(y => `<button type="button" role="tab" aria-selected="${y.year === d.year}" tabindex="${y.year === d.year ? 0 : -1}" data-year="${y.year}">${esc(y.label)}<small>${y.count}</small></button>`).join("");
    // Grid
    empty.hidden = d.items.length > 0;
    grid.innerHTML = d.items.map((i, n) => { const t = safe(i.thumbUrl); return `<button type="button" class="gallery-tile${i.kind === "VIDEO" ? " is-video" : ""}" data-index="${n}" aria-label="${esc((i.kind === "VIDEO" ? L("Play video: ", "播放视频：") : L("Open photo: ", "查看图片：")) + (i.title || i.alt))}">
      ${t ? `<img src="${esc(t)}" alt="" loading="lazy" decoding="async" width="600" height="450">` : ""}
      ${i.kind === "VIDEO" ? `<span class="gallery-play" aria-hidden="true">▶</span><span class="gallery-dur" aria-hidden="true">${esc(dur(i.duration))}</span>` : ""}
      ${i.title ? `<span class="gallery-cap" aria-hidden="true">${esc(i.title)}</span>` : ""}</button>`; }).join("");
    // Pagination
    pager.hidden = d.pages < 2;
    if (d.pages > 1) {
      const b = (p, label, aria, dis, step) => `<button type="button" data-page="${p}" aria-label="${esc(aria)}" ${dis ? "disabled" : ""}${!step && p === d.page ? ' aria-current="page"' : ""} class="${step ? "is-step" : ""}">${label}</button>`;
      pager.innerHTML = b(d.page - 1, "←", L("Previous page", "上一页"), d.page === 1, true) + Array.from({length: d.pages}, (_, k) => b(k + 1, String(k + 1), L("Page ", "第 ") + (k + 1) + L("", " 页"))).join("") +
        b(d.page + 1, "→", L("Next page", "下一页"), d.page === d.pages, true) + `<span class="gallery-status">${L(`Page ${d.page} of ${d.pages}`, `第 ${d.page} 页，共 ${d.pages} 页`)}</span>`;
    }
    if (focus) { if (section.getBoundingClientRect().top < 0) section.scrollIntoView({behavior: reduce ? "auto" : "smooth"}); (focus === "year" ? yearsBox.querySelector('[aria-selected="true"]') : grid.querySelector(".gallery-tile"))?.focus({preventScroll: true}); }
  }
  yearsBox.addEventListener("click", e => { const b = e.target.closest("button[data-year]"); if (b && Number(b.dataset.year) !== state.year) void load(Number(b.dataset.year), 1, true, "year"); });
  yearsBox.addEventListener("keydown", e => { const tabs = [...yearsBox.querySelectorAll("button")], i = tabs.indexOf(document.activeElement); if (i < 0) return;
    const j = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : -1; if (j >= 0 && j < tabs.length) { e.preventDefault(); tabs[j].click(); } });
  pager.addEventListener("click", e => { const b = e.target.closest("button[data-page]"); if (b && !b.disabled) void load(state.year, Number(b.dataset.page), true, true); });
  addEventListener("popstate", () => { const p = params(); void load(p.year, p.page, false, false); });
  // Swipe between pages on touch screens.
  let sx = null;
  grid.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, {passive: true});
  grid.addEventListener("touchend", e => { if (sx === null || !state.data || state.data.pages < 2) return; const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 60) { const p = Math.min(state.data.pages, Math.max(1, state.page + (dx < 0 ? 1 : -1))); if (p !== state.page) void load(state.year, p, true, true); } }, {passive: true});

  /* Lightbox */
  let box = null, cur = 0, opener = null;
  function show(n) {
    const items = state.data.items; cur = (n + items.length) % items.length; const i = items[cur], url = safe(i.url);
    const media = i.kind === "VIDEO" ? `<video src="${esc(url)}" poster="${esc(safe(i.thumbUrl))}" controls playsinline preload="metadata" aria-label="${esc(i.alt)}"></video>` : `<img src="${esc(url)}" alt="${esc(i.alt)}" decoding="async">`;
    box.querySelector(".lb-media").innerHTML = media;
    box.querySelector(".lb-text").innerHTML = `${i.title ? `<strong>${esc(i.title)}</strong>` : ""}${i.caption ? `<p>${esc(i.caption)}</p>` : ""}<small>${cur + 1} / ${items.length} · ${esc(String(i.year))}</small>`;
    box.querySelector(".lb-prev").hidden = box.querySelector(".lb-next").hidden = items.length < 2;
  }
  function openBox(n, from) {
    opener = from;
    box = document.createElement("div"); box.className = "gallery-lightbox"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", L("Photo and video viewer", "图片与视频浏览"));
    box.innerHTML = `<button type="button" class="lb-close" aria-label="${L("Close", "关闭")}">×</button><button type="button" class="lb-prev" aria-label="${L("Previous", "上一个")}">‹</button>
      <figure><div class="lb-media"></div><figcaption class="lb-text"></figcaption></figure><button type="button" class="lb-next" aria-label="${L("Next", "下一个")}">›</button>`;
    document.body.appendChild(box); document.body.classList.add("gallery-open");
    box.addEventListener("click", e => { if (e.target === box || e.target.closest(".lb-close")) close(); else if (e.target.closest(".lb-prev")) show(cur - 1); else if (e.target.closest(".lb-next")) show(cur + 1); });
    let tx = null; box.addEventListener("touchstart", e => { tx = e.touches[0].clientX; }, {passive: true});
    box.addEventListener("touchend", e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; tx = null; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); }, {passive: true});
    addEventListener("keydown", onKey); show(n); box.querySelector(".lb-close").focus();
  }
  function close() { if (!box) return; removeEventListener("keydown", onKey); box.remove(); box = null; document.body.classList.remove("gallery-open"); opener?.focus(); }
  function onKey(e) { if (e.key === "Escape") close(); else if (e.key === "ArrowRight") show(cur + 1); else if (e.key === "ArrowLeft") show(cur - 1);
    else if (e.key === "Tab") { const f = [...box.querySelectorAll("button:not([hidden]),video")]; const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } } }
  grid.addEventListener("click", e => { const t = e.target.closest(".gallery-tile"); if (t) openBox(Number(t.dataset.index), t); });

  if (location.protocol === "file:" || location.hostname.endsWith("github.io")) { grid.removeAttribute("aria-busy"); empty.hidden = false; return; }
  const p = params(); void load(p.year, p.page, false, false);
})();
