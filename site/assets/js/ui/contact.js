/* Contact : WhatsApp, horaires, adresse, carte (uniquement sur le vrai domaine), copie des numéros, mesure d'audience. */
import { $, $$, track } from "./dom.js";
import { waLink } from "../core/format.js";

export function initContact({ CONFIG }) {
  $("#cHours").textContent = CONFIG.hoursLabel;
  const maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.mapsQuery);
  const addr = $("#cAddr"); addr.textContent = "";
  const span = document.createElement("span"); span.textContent = CONFIG.address;
  const a = document.createElement("a"); a.className = "maplink"; a.href = maps; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = "Itinéraire Google Maps →";
  addr.append(span, a);

  const onSite = !!CONFIG.siteUrl && location.origin === new URL(CONFIG.siteUrl).origin;
  if (onSite) {
    const f = document.createElement("iframe");
    f.title = "Plan d'accès au showroom"; f.loading = "lazy"; f.referrerPolicy = "no-referrer-when-downgrade";
    f.src = "https://www.google.com/maps?q=" + encodeURIComponent(CONFIG.mapsQuery) + "&output=embed";
    $("#mapBox").append(f); $("#mapBox").hidden = false;
  }

  const hi = waLink(CONFIG.whatsapp, "Bonjour, je souhaite des informations sur les parquets EGGER.");
  $$("#waContact,#waBar,#waFloat").forEach(x => { x.href = hi; x.addEventListener("click", () => track("Contact")); });
  $$("a[href^='tel:']").forEach(x => x.addEventListener("click", () => track("Contact", { method: "phone" })));
  $$("[data-copy]").forEach(b => b.addEventListener("click", () => {
    navigator.clipboard?.writeText(b.dataset.copy).then(() => { b.textContent = "Copié"; setTimeout(() => { b.textContent = "Copier"; }, 2000); }, () => { });
  }));
  $("#yr").textContent = new Date().getFullYear();

  // Mesure d'audience facultative (pensez à autoriser ces domaines dans la CSP, voir LISEZMOI-HOSTINGER.md)
  if (CONFIG.metaPixel) {
    const n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!window._fbq) window._fbq = n; n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
    const s = document.createElement("script"); s.async = true; s.src = "https://connect.facebook.net/en_US/fbevents.js"; document.head.append(s);
    window.fbq("init", CONFIG.metaPixel); window.fbq("track", "PageView");
  }
  if (CONFIG.ga4) {
    const s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(CONFIG.ga4); document.head.append(s);
    window.dataLayer = window.dataLayer || []; window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date()); window.gtag("config", CONFIG.ga4);
  }
}
