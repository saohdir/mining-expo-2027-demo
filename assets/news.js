/* Exhibition insights & updates: CMS news (Website Content → NEWS) as cards with pagination, and the article detail page.
   Published items only; text is always inserted as text (no HTML from the CMS). Static cards stay as fallback when the CMS has none. */
(() => {
  'use strict';
  const zh = /^\/zh(\/|$)/.test(location.pathname) || /^zh/i.test(document.documentElement.lang);
  const L = (en, z) => zh ? z : en;
  const api = (window.IMDX_UAT_BASE_URL && /^https:\/\//.test(window.IMDX_UAT_BASE_URL) ? window.IMDX_UAT_BASE_URL.replace(/\/$/, "") : "") + "/api/public";
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
  const root = zh && location.pathname.startsWith("/zh/") ? "/zh" : "";
  const articleHref = slug => root + "/news/article/?slug=" + encodeURIComponent(slug);
  const day = d => d ? new Date(d).toLocaleDateString(zh ? "zh-CN" : "en-GB", {day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta"}) : "";
  const offline = location.protocol === "file:" || location.hostname.endsWith("github.io");
  async function news(locale) {
    const r = await fetch(`${api}/content?kind=NEWS&locale=${locale}`);
    if (!r.ok) throw new Error("news unavailable");
    return (await r.json()).items || [];
  }
  const label = i => [i.role || L("UPDATE", "动态"), day(i.publishedAt)].filter(Boolean).join(" · ");
  const setBg = box => box.querySelectorAll("[data-bg]").forEach(el => { el.style.backgroundImage = "url(" + JSON.stringify(el.dataset.bg) + ")"; el.removeAttribute("data-bg"); });
  // No cover image: a branded placeholder keeps the card layout intact.
  const image = (i, cls) => `<a class="${cls}${i.imageUrl ? "" : " news-cover--empty"}" href="${esc(articleHref(i.slug))}" tabindex="-1" aria-hidden="true">` +
    (i.imageUrl ? `<span class="icee-news-image" data-bg="${esc(i.imageUrl)}"></span>` : `<span class="icee-news-image"><b>IMDX</b><small>2027</small></span>`) + `</a>`;
  const lead = i => `<article class="icee-news-lead news-card">${image(i, "news-cover")}<div class="icee-news-body"><span class="icee-news-label">${esc(label(i))}</span>
    <h3><a href="${esc(articleHref(i.slug))}">${esc(i.title)}</a></h3>${i.summary ? `<p>${esc(i.summary)}</p>` : ""}<a class="news-more" href="${esc(articleHref(i.slug))}">${L("Read article", "阅读全文")} <span aria-hidden="true">↗</span></a></div></article>`;
  const mini = i => `<article class="icee-news-mini news-card">${image(i, "news-cover")}<div><span class="icee-news-label">${esc(label(i))}</span>
    <h3><a href="${esc(articleHref(i.slug))}">${esc(i.title)}</a></h3>${i.summary ? `<p>${esc(i.summary)}</p>` : ""}<a class="news-more" href="${esc(articleHref(i.slug))}">${L("Read article", "阅读全文")} <span aria-hidden="true">↗</span></a></div></article>`;

  /* Card grid with pagination: [data-news-grid data-page-size="3"] */
  document.querySelectorAll("[data-news-grid]").forEach(async grid => {
    if (offline) return;
    let items;
    try { items = await news(zh ? "zh" : "en"); } catch { return; }
    if (!items.length) return; // keep the designed fallback cards
    const size = Math.max(1, Number(grid.dataset.pageSize) || 3), pages = Math.ceil(items.length / size);
    const section = grid.closest("section") || grid;
    const pager = document.createElement("nav");
    pager.className = "news-pager"; pager.setAttribute("aria-label", L("News pages", "新闻分页"));
    grid.after(pager);
    const status = document.createElement("p"); status.className = "news-sr"; status.setAttribute("aria-live", "polite"); pager.after(status);
    let page = 1;
    const render = (focus) => {
      const slice = items.slice((page - 1) * size, page * size);
      grid.classList.toggle("is-single", slice.length === 1);
      grid.innerHTML = lead(slice[0]) + (slice.length > 1 ? `<div class="icee-news-list">${slice.slice(1).map(mini).join("")}</div>` : "");
      setBg(grid);
      if (pages < 2) { pager.hidden = true; return; }
      const btn = (p, text, aria, disabled) => `<button type="button" data-page="${p}" ${disabled ? "disabled" : ""} aria-label="${esc(aria)}"${p === page && /^\d+$/.test(text) ? ' aria-current="page"' : ""}>${text}</button>`;
      pager.innerHTML = btn(page - 1, "‹", L("Previous page", "上一页"), page === 1) +
        Array.from({length: pages}, (_, k) => btn(k + 1, String(k + 1), L("Page ", "第 ") + (k + 1) + L("", " 页"), false)).join("") +
        btn(page + 1, "›", L("Next page", "下一页"), page === pages) + `<span class="news-pager-count">${page} / ${pages}</span>`;
      status.textContent = L(`Page ${page} of ${pages}`, `第 ${page} 页，共 ${pages} 页`);
      if (focus) { const top = section.getBoundingClientRect().top; if (top < 0) section.scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start"}); pager.querySelector(`[data-page="${page}"][aria-current]`)?.focus({preventScroll: true}); }
    };
    // Swipe on touch screens: left = next page, right = previous page.
    let sx = null, sy = 0;
    grid.addEventListener("touchstart", e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, {passive: true});
    grid.addEventListener("touchend", e => { if (sx === null || pages < 2) return; const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > 1.5 * Math.abs(dy)) { const p = Math.min(pages, Math.max(1, page + (dx < 0 ? 1 : -1))); if (p !== page) { page = p; render(true); } } }, {passive: true});
    pager.addEventListener("click", e => { const b = e.target.closest("button[data-page]"); if (!b || b.disabled) return; const p = Number(b.dataset.page); if (p >= 1 && p <= pages && p !== page) { page = p; render(true); } });
    render(false);
  });

  /* Article body. Block documents from the CMS editor ({"format":"blocks",…}: paragraph, heading, list, quote, image,
     button, divider; inline **bold**, *italic*, [text](url)) — or the older plain text (blank line = paragraph,
     "## " = subheading, "- " = bullet). Everything is escaped; only these marks become tags. */
  const okHref = u => /^https:\/\/[^\s"'<>]+$/.test(u) || /^\/[A-Za-z0-9/_\-.%?=&#]*$/.test(u);
  const inline = t => esc(t).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, a, h) => okHref(h.replace(/&amp;/g, "&")) ? `<a href="${h}"${h.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${a}</a>` : m)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>").replace(/\n/g, "<br>");
  const blockHtml = b => {
    const s = v => typeof v === "string" ? v : "";
    switch (b && b.t) {
      case "p": return s(b.text).trim() ? `<p>${inline(s(b.text))}</p>` : "";
      case "h": { const l = b.level === 3 ? 3 : 2; return `<h${l}>${esc(s(b.text))}</h${l}>`; }
      case "list": { const items = (Array.isArray(b.items) ? b.items : []).filter(i => s(i).trim()); const tag = b.ordered ? "ol" : "ul"; return items.length ? `<${tag}>${items.map(i => `<li>${inline(s(i))}</li>`).join("")}</${tag}>` : ""; }
      case "quote": return s(b.text).trim() ? `<blockquote><p>${inline(s(b.text))}</p>${b.cite ? `<cite>${esc(s(b.cite))}</cite>` : ""}</blockquote>` : "";
      case "image": return okHref(s(b.url)) ? `<figure class="news-article-figure"><img src="${esc(s(b.url))}" alt="${esc(s(b.alt))}" loading="lazy" decoding="async">${b.caption ? `<figcaption>${inline(s(b.caption))}</figcaption>` : ""}</figure>` : "";
      case "button": return okHref(s(b.url)) && s(b.text).trim() ? `<p class="news-article-cta"><a class="btn btn-orange" href="${esc(s(b.url))}"${s(b.url).startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${esc(s(b.text))} <span aria-hidden="true">↗</span></a></p>` : "";
      case "divider": return "<hr>";
      default: return "";
    }
  };
  const bodyHtml = body => {
    const text = String(body || "");
    if (text.trimStart().startsWith('{"format":"blocks"')) { try { const d = JSON.parse(text); if (Array.isArray(d.blocks)) return d.blocks.map(blockHtml).join(""); } catch { /* fall back to plain text */ } }
    const out = []; let para = [], bullets = [];
    const flush = () => { if (para.length) out.push(`<p>${para.map(esc).join("<br>")}</p>`); if (bullets.length) out.push(`<ul>${bullets.map(l => `<li>${esc(l)}</li>`).join("")}</ul>`); para = []; bullets = []; };
    for (const raw of text.replace(/\r/g, "").split("\n")) {
      const line = raw.trim();
      if (!line) { flush(); continue; }
      if (line.startsWith("## ")) { flush(); out.push(`<h2>${esc(line.slice(3))}</h2>`); continue; }
      if (/^[-•]\s+/.test(line)) { if (para.length) { out.push(`<p>${para.map(esc).join("<br>")}</p>`); para = []; } bullets.push(line.replace(/^[-•]\s+/, "")); continue; }
      if (bullets.length) { out.push(`<ul>${bullets.map(l => `<li>${esc(l)}</li>`).join("")}</ul>`); bullets = []; }
      para.push(line);
    }
    flush();
    return out.join("");
  };

  /* Article detail: [data-news-article] on /news/article/?slug=… */
  const art = document.querySelector("[data-news-article]");
  if (art) (async () => {
    const slug = new URLSearchParams(location.search).get("slug") || "";
    const notFound = () => { art.innerHTML = `<div class="news-article-head"><h1>${L("Article not found", "未找到该文章")}</h1><p>${L("It may have been moved or is no longer published.", "该文章可能已移动或已下线。")}</p><a class="btn btn-orange" href="${root}/news/">${L("All updates", "全部动态")} <span>↗</span></a></div>`; art.removeAttribute("aria-busy"); };
    if (!/^[a-z0-9-]{2,80}$/.test(slug) || offline) return notFound();
    let list = [], item;
    try { list = await news(zh ? "zh" : "en"); item = list.find(i => i.slug === slug); if (!item && zh) { const en = await news("en"); item = en.find(i => i.slug === slug); if (!list.length) list = en; } } catch { return notFound(); }
    if (!item) return notFound();
    document.title = item.title + " — IMDX 2027";
    const md = document.querySelector('meta[name="description"]'); if (md && item.summary) md.setAttribute("content", item.summary);
    const blocks = bodyHtml(item.body);
    const more = list.filter(i => i.slug !== slug).slice(0, 3);
    art.innerHTML = `<nav class="breadcrumb news-crumb" aria-label="${L("Breadcrumb", "面包屑导航")}"><ol><li><a href="${root}/">${L("Home", "首页")}</a></li><li><a href="${root}/news/">${L("News", "新闻")}</a></li><li aria-current="page">${esc(item.title.slice(0, 60))}</li></ol></nav>
      <header class="news-article-head"><span class="icee-news-label">${esc(label(item))}</span><h1>${esc(item.title)}</h1>${item.summary ? `<p class="news-article-lead">${esc(item.summary)}</p>` : ""}</header>
      ${item.imageUrl ? `<figure class="news-article-cover"><img src="${esc(item.imageUrl)}" alt="${esc(item.altText || "")}" width="1600" height="900" decoding="async"></figure>` : ""}
      <div class="news-article-body">${blocks || (item.summary ? `<p>${esc(item.summary)}</p>` : "")}
        <div class="news-article-actions"><a class="btn btn-orange" href="${root}/news/">${L("All updates", "全部动态")} <span>↗</span></a><button type="button" class="btn news-btn-secondary" data-action="exhibitor">${L("Join as Exhibitor", "参展商报名")} <span>↗</span></button></div></div>
      ${more.length ? `<section class="news-more-list" aria-labelledby="more-h"><h2 id="more-h">${L("More updates", "更多动态")}</h2><div class="news-more-grid">${more.map(mini).join("")}</div></section>` : ""}`;
    setBg(art); art.removeAttribute("aria-busy");
  })();
})();
