/* Régénère les données structurées (JSON-LD) de index.html à partir de data.js et config.js.
   À lancer après toute modification du catalogue ou de la FAQ : npm run seo */
import { readFileSync, writeFileSync } from "node:fs";
import { DECORS, FAQ } from "../site/assets/js/data.js";
import { CONFIG } from "../site/assets/js/config.js";

const url = CONFIG.siteUrl.replace(/\/$/, "") + "/";
const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HomeAndConstructionBusiness", "@id": url + "#business", name: "La Maison du Parquet",
      description: "Représentant EGGER en Algérie. Sols stratifiés EGGER en stock, posés directement sur carrelage. Showroom à Dar El Beïda (Alger), sur rendez-vous.",
      url, telephone: "+" + CONFIG.whatsapp, image: url + "img/og.jpg", logo: url + "img/logo.png",
      hasMap: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.mapsQuery),
      areaServed: { "@type": "Country", name: "Algérie" },
      address: { "@type": "PostalAddress", addressLocality: "Dar El Beïda", addressRegion: "Alger", addressCountry: "DZ" },
      contactPoint: [CONFIG.whatsapp, CONFIG.phone2.replace(/\D/g, "").replace(/^0/, "213")].map(t => ({ "@type": "ContactPoint", telephone: "+" + t, contactType: "customer service", availableLanguage: "French" })),
      openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"], opens: "08:00", closes: "16:00" }],
      brand: { "@type": "Brand", name: "EGGER" }
    },
    {
      "@type": "ItemList", name: "Parquets stratifiés EGGER en stock",
      itemListElement: DECORS.map((d, i) => ({
        "@type": "ListItem", position: i + 1,
        item: { "@type": "Product", name: `Parquet stratifié EGGER ${d.n} ${d.ref}`, sku: d.ref, brand: { "@type": "Brand", name: "EGGER" }, description: `${d.mm} mm, classe d'usage ${d.cl}. ${d.d}`, image: url + `img/sw-${d.ref.toLowerCase()}.jpg` }
      }))
    },
    { "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }
  ]
};
const file = new URL("../site/index.html", import.meta.url);
const html = readFileSync(file, "utf8").replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(graph)}</script>`);
writeFileSync(file, html);
console.log("JSON-LD mis à jour :", DECORS.length, "décors,", FAQ.length, "questions");
