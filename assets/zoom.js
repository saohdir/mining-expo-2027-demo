/* Click-to-enlarge for single images: <a data-zoom href="full.jpg"><img ...></a>.
 * Opens a lightbox with the image's current src (so a CMS-replaced photo is shown), closes on ×, Esc or backdrop.
 * Click the enlarged image to toggle fit-to-screen / full size (scroll to pan). Without JS the link opens the image. */
(function () {
  "use strict";
  var zh = /^\/zh(\/|$)/.test(location.pathname), box, img, closeBtn, lastFocus;
  function t(en, cn) { return zh ? cn : en; }
  function build() {
    box = document.createElement("div"); box.className = "zoom-lightbox"; box.hidden = true;
    box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", t("Enlarged image", "放大图片"));
    box.innerHTML = '<button type="button" class="zoom-close" aria-label="' + t("Close", "关闭") + '">×</button><div class="zoom-stage"><img alt=""></div><p class="zoom-hint">' +
      t("Click the image to zoom · Esc to close", "点击图片可放大 · 按 Esc 关闭") + "</p>";
    document.body.appendChild(box);
    img = box.querySelector("img"); closeBtn = box.querySelector(".zoom-close");
    closeBtn.addEventListener("click", close);
    box.addEventListener("click", function (e) { if (e.target === box || e.target.classList.contains("zoom-stage")) close(); });
    img.addEventListener("click", function () { box.classList.toggle("is-full"); closeBtn.focus({preventScroll: true}); });
    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); close(); }
      if (e.key === "Tab") { e.preventDefault(); closeBtn.focus(); }
    });
  }
  function open(src, alt) {
    if (!box) build();
    lastFocus = document.activeElement; img.src = src; img.alt = alt || "";
    box.classList.remove("is-full"); box.hidden = false; document.documentElement.classList.add("zoom-open"); closeBtn.focus();
  }
  function close() {
    if (!box || box.hidden) return;
    box.hidden = true; document.documentElement.classList.remove("zoom-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-zoom]");
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var pic = a.querySelector("img"); e.preventDefault();
    open((pic && (pic.currentSrc || pic.src)) || a.href, pic ? pic.alt : "");
  });
})();
