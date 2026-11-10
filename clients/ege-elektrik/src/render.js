import { ICONS, iconFor } from "./icons.js";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const telHref = (p) => {
  const d = String(p || "").replace(/\D/g, "");
  if (d.startsWith("90")) return "tel:+" + d;
  if (d.startsWith("0")) return "tel:+90" + d.slice(1);
  return "tel:" + d;
};

const waHref = (n, text) =>
  `https://wa.me/${String(n || "").replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

export function renderPage(c, origin) {
  const tel = telHref(c.phone);
  const wa = waHref(c.whatsapp, "Merhaba, web siteniz üzerinden ulaşıyorum. Bilgi almak istiyorum.");
  const year = new Date().getFullYear();
  const fullName = `${c.brand} ${c.brandLine1} ${c.brandLine2}`.trim();

  const services = (c.services || [])
    .map(
      (s, i) => `
      <article class="svc reveal" style="--d:${i * 70}ms">
        <div class="svc-img">${s.image ? `<img src="${esc(s.image)}" alt="${esc(s.title)}" loading="lazy" width="480" height="480">` : ""}</div>
        <div class="svc-body">
          <span class="svc-ico">${iconFor(s.icon)}</span>
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.text)}</p>
          <a class="svc-link" href="${esc(waHref(c.whatsapp, `Merhaba, ${s.title} hakkında bilgi almak istiyorum.`))}" target="_blank" rel="noopener">Teklif Al <span aria-hidden="true">→</span></a>
        </div>
      </article>`
    )
    .join("");

  const features = (c.features || [])
    .map(
      (f) => `
      <div class="feat reveal">
        <span class="feat-ico">${iconFor(f.icon)}</span>
        <div><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></div>
      </div>`
    )
    .join("");

  const regions = (c.regions || []).map((r) => `<li>${ICONS.pin}<span>${esc(r)}</span></li>`).join("");

  const serviceOptions = (c.services || []).map((s) => `<option>${esc(s.title)}</option>`).join("");

  const ld = {
    "@context": "https://schema.org",
    "@type": "Electrician",
    name: fullName,
    telephone: c.phone,
    email: c.email || undefined,
    address: c.address || undefined,
    areaServed: c.regions,
    url: origin,
    image: origin + (c.heroImage || ""),
  };

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(c.seoTitle)}</title>
<meta name="description" content="${esc(c.seoDescription)}">
<meta name="theme-color" content="#0a1628">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(c.seoTitle)}">
<meta property="og:description" content="${esc(c.seoDescription)}">
<meta property="og:image" content="${esc(origin + (c.heroImage || ""))}">
<meta property="og:locale" content="tr_TR">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,600;0,700;1,800;1,900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css?v=1">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>
</head>
<body>
<header class="top" id="top">
  <div class="wrap top-in">
    <a href="#" class="logo" aria-label="${esc(fullName)}">
      <span class="logo-mark">${esc(c.brand)}<i>${ICONS.elektrik}</i></span>
      <span class="logo-sub"><b>${esc(c.brandLine1)}</b><em>${esc(c.brandLine2)}</em></span>
    </a>
    <nav class="nav" id="nav" aria-label="Ana menü">
      <a href="#hizmetler">Hizmetler</a>
      <a href="#hakkimizda">Hakkımızda</a>
      <a href="#bolgeler">Bölgeler</a>
      <a href="#iletisim">İletişim</a>
      <a class="nav-call" href="${tel}">${ICONS.phone}<span>${esc(c.phone)}</span></a>
    </nav>
    <a class="top-call" href="${tel}" aria-label="Hemen ara">${ICONS.phone}</a>
    <button class="burger" id="burger" aria-label="Menüyü aç" aria-expanded="false" aria-controls="nav">${ICONS.menu}${ICONS.close}</button>
  </div>
</header>

<main>
<section class="hero">
  <div class="hero-bg" style="background-image:url('${esc(c.heroImage)}')"></div>
  <div class="hero-grid" aria-hidden="true"></div>
  <div class="wrap hero-in">
    <p class="chip">${ICONS.elektrik}<span>${esc(c.heroTag)}</span></p>
    <h1><span class="h-brand">${esc(c.brand)}<i>${ICONS.elektrik}</i></span><span class="h-l1">${esc(c.brandLine1)}</span><span class="h-l2">${esc(c.brandLine2)}</span></h1>
    <p class="slogan">${esc(c.slogan)}</p>
    <p class="lead">${esc(c.heroText)}</p>
    <div class="cta">
      <a class="btn btn-blue" href="${tel}">${ICONS.phone}<span>Hemen Ara</span></a>
      <a class="btn btn-wa" href="${esc(wa)}" target="_blank" rel="noopener">${ICONS.whatsapp}<span>WhatsApp</span></a>
    </div>
    <a class="hero-phone" href="${tel}">${esc(c.phone)}</a>
  </div>
</section>

<section class="feats">
  <div class="wrap feats-in">${features}</div>
</section>

<section class="sec" id="hizmetler">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Hizmetlerimiz</p>
      <h2>Elektrik Elektronik: Kamera, Uydu, Diyafon</h2>
      <p>Elektrik işleri ve güvenlik sistemlerinde keşiften kuruluma, bakımdan arızaya kadar tek adres.</p>
    </div>
    <div class="svcs">${services}</div>
  </div>
</section>

<section class="sec about" id="hakkimizda">
  <div class="wrap about-in">
    <div class="about-txt reveal">
      <p class="eyebrow">Hakkımızda</p>
      <h2>${esc(c.aboutTitle)}</h2>
      <p>${esc(c.aboutText)}</p>
      <ul class="ticks">
        <li>${ICONS.check}Ücretsiz keşif ve fiyat bilgisi</li>
        <li>${ICONS.check}Kaliteli ve garantili malzeme</li>
        <li>${ICONS.check}Hızlı arıza ve servis desteği</li>
      </ul>
    </div>
    <div class="regions reveal" id="bolgeler">
      <h3>${ICONS.pin}Hizmet Bölgelerimiz</h3>
      <ul>${regions}</ul>
      <p class="regions-note">Bölgelerinde hizmet vermekteyiz.</p>
    </div>
  </div>
</section>

<section class="sec contact" id="iletisim">
  <div class="wrap contact-in">
    <div class="contact-info reveal">
      <p class="eyebrow">İletişim</p>
      <h2>Hemen Ulaşın</h2>
      <p>Arıza, kurulum veya fiyat bilgisi için bizi arayın ya da formu doldurun, en kısa sürede dönüş yapalım.</p>
      <a class="cinfo" href="${tel}"><span>${ICONS.phone}</span><div><small>Telefon</small><b>${esc(c.phone)}</b></div></a>
      <a class="cinfo wa" href="${esc(wa)}" target="_blank" rel="noopener"><span>${ICONS.whatsapp}</span><div><small>WhatsApp</small><b>Mesaj Gönder</b></div></a>
      ${c.email ? `<a class="cinfo" href="mailto:${esc(c.email)}"><span>${ICONS.mail}</span><div><small>E-posta</small><b>${esc(c.email)}</b></div></a>` : ""}
      ${c.address ? `<div class="cinfo"><span>${ICONS.pin}</span><div><small>Adres</small><b>${esc(c.address)}</b></div></div>` : ""}
      ${c.hours ? `<div class="cinfo"><span>${ICONS.clock}</span><div><small>Çalışma Saatleri</small><b>${esc(c.hours)}</b></div></div>` : ""}
    </div>
    <form class="form reveal" id="form" novalidate>
      <h3>Bize Yazın</h3>
      <label>Adınız Soyadınız<input name="name" required maxlength="80" autocomplete="name"></label>
      <label>Telefon<input name="phone" type="tel" required maxlength="20" inputmode="tel" autocomplete="tel" placeholder="05xx xxx xx xx"></label>
      <label>Hizmet<select name="service"><option value="">Seçiniz</option>${serviceOptions}<option>Diğer</option></select></label>
      <label>Mesajınız<textarea name="message" rows="4" maxlength="1500"></textarea></label>
      <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="btn btn-blue" type="submit">Gönder</button>
      <p class="form-msg" id="form-msg" role="status"></p>
    </form>
  </div>
</section>
</main>

<footer class="foot">
  <div class="wrap foot-in">
    <a href="#" class="logo">
      <span class="logo-mark">${esc(c.brand)}<i>${ICONS.elektrik}</i></span>
      <span class="logo-sub"><b>${esc(c.brandLine1)}</b><em>${esc(c.brandLine2)}</em></span>
    </a>
    <p class="foot-slogan">${esc(c.slogan)}</p>
    <p class="foot-regions">${(c.regions || []).map(esc).join(" · ")}</p>
    <p class="copy">© ${year} ${esc(fullName)}. Tüm hakları saklıdır.</p>
  </div>
</footer>

<div class="dock" aria-label="Hızlı iletişim">
  <a class="dock-call" href="${tel}">${ICONS.phone}<span>Hemen Ara</span></a>
  <a class="dock-wa" href="${esc(wa)}" target="_blank" rel="noopener">${ICONS.whatsapp}<span>WhatsApp</span></a>
</div>

<script src="/app.js?v=1" defer></script>
</body>
</html>`;
}
