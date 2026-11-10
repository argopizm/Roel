const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const ICON_OPTS = { diyafon: "Diyafon", kamera: "Kamera", uydu: "Uydu", elektrik: "Elektrik (şimşek)", genel: "Genel (anahtar)" };
const FEAT_ICONS = { shield: "Kalkan", gear: "Dişli", users: "Kişiler", clock: "Saat", star: "Yıldız", elektrik: "Şimşek" };

let content = null;
let dirty = false;

async function api(path, opts = {}) {
  const r = await fetch(path, { credentials: "same-origin", ...opts });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && path.startsWith("/api/admin")) { showLogin(); throw new Error("Oturum süresi doldu"); }
  if (!r.ok) throw new Error(j.error || "İşlem başarısız");
  return j;
}

function toast(msg, bad = false) {
  const t = $("#toast");
  t.textContent = msg;
  t.className = "toast show" + (bad ? " bad" : "");
  clearTimeout(t._h);
  t._h = setTimeout(() => (t.className = "toast"), 2600);
}

function setDirty(v = true) {
  dirty = v;
  $("#savebar").classList.toggle("dirty", v);
}
window.addEventListener("beforeunload", (e) => { if (dirty) e.preventDefault(); });

function showLogin() { $("#app").hidden = true; $("#login").hidden = false; }

async function boot() {
  try {
    content = await api("/api/admin/content");
  } catch { showLogin(); return; }
  $("#login").hidden = true;
  $("#app").hidden = false;
  renderAll();
  loadMessages();
}

$("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("#login-err").textContent = "";
  try {
    await api("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: e.target.password.value }) });
    e.target.reset();
    boot();
  } catch (err) { $("#login-err").textContent = err.message; }
});

$("#logout").addEventListener("click", async () => {
  if (dirty && !confirm("Kaydedilmemiş değişiklikler kaybolacak. Çıkılsın mı?")) return;
  await api("/api/logout", { method: "POST" });
  setDirty(false);
  showLogin();
});

$("#tabs").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-tab]");
  if (!b) return;
  document.querySelectorAll("#tabs button").forEach((x) => x.classList.toggle("on", x === b));
  document.querySelectorAll(".tab").forEach((p) => (p.hidden = p.dataset.pane !== b.dataset.tab));
  $("#savebar").hidden = b.dataset.tab === "mesajlar";
  if (b.dataset.tab === "mesajlar") loadMessages();
});

// --- form yardımcıları: data-k="alan" veya data-k="services.0.title" yolu ---
const field = (k, label, val, { area = false, hint = "", type = "text" } = {}) =>
  `<label>${esc(label)}${hint ? ` <small>${esc(hint)}</small>` : ""}${
    area ? `<textarea data-k="${k}" rows="4">${esc(val)}</textarea>` : `<input type="${type}" data-k="${k}" value="${esc(val)}">`
  }</label>`;

const select = (k, label, val, opts) =>
  `<label>${esc(label)}<select data-k="${k}">${Object.entries(opts)
    .map(([v, t]) => `<option value="${v}"${v === val ? " selected" : ""}>${esc(t)}</option>`)
    .join("")}</select></label>`;

const imgPick = (k, val, cls = "") =>
  `<div class="img-pick"><img class="${cls}" src="${esc(val || "")}" alt=""><div class="row">
    <label class="btn ghost sm" style="margin:0">Görsel Değiştir<input type="file" accept="image/*" data-img="${k}" hidden></label>
  </div></div>`;

function setPath(path, value) {
  const parts = path.split(".");
  let o = content;
  while (parts.length > 1) o = o[parts.shift()];
  o[parts[0]] = value;
}

function renderAll() {
  const c = content;
  $('[data-pane="genel"]').innerHTML = `
    <div class="card"><h2>Firma & Logo</h2><div class="grid2">
      ${field("brand", "Marka", c.brand)}${field("brandLine1", "Alt satır 1", c.brandLine1)}
      ${field("brandLine2", "Alt satır 2", c.brandLine2)}${field("slogan", "Slogan", c.slogan)}
    </div></div>
    <div class="card"><h2>Giriş Bölümü</h2>
      ${field("heroTag", "Üst etiket", c.heroTag)}
      ${field("heroText", "Açıklama", c.heroText, { area: true })}
      <label>Arka plan görseli</label>${imgPick("heroImage", c.heroImage, "hero-thumb")}
    </div>
    <div class="card"><h2>İletişim</h2><div class="grid2">
      ${field("phone", "Telefon", c.phone, { type: "tel" })}
      ${field("whatsapp", "WhatsApp numarası", c.whatsapp, { hint: "Ülke koduyla, örn. 905xxxxxxxxx", type: "tel" })}
      ${field("email", "E-posta", c.email, { type: "email", hint: "Boş bırakılırsa gösterilmez" })}
      ${field("address", "Adres", c.address)}
      ${field("hours", "Çalışma saatleri", c.hours, { hint: "Boş bırakılırsa gösterilmez" })}
    </div></div>
    <div class="card"><h2>Hakkımızda</h2>
      ${field("aboutTitle", "Başlık", c.aboutTitle)}
      ${field("aboutText", "Metin", c.aboutText, { area: true })}
    </div>`;

  $('[data-pane="hizmetler"]').innerHTML =
    c.services.map((s, i) => `
      <div class="card item">
        <div class="item-head"><strong>${i + 1}. Hizmet</strong>
          <button class="btn ghost sm" data-move="services.${i}.-1" ${i === 0 ? "disabled" : ""} aria-label="Yukarı">↑</button>
          <button class="btn ghost sm" data-move="services.${i}.1" ${i === c.services.length - 1 ? "disabled" : ""} aria-label="Aşağı">↓</button>
          <button class="btn danger sm" data-del="services.${i}">Sil</button>
        </div>
        ${imgPick(`services.${i}.image`, s.image)}
        <div class="grid2">${field(`services.${i}.title`, "Başlık", s.title)}${select(`services.${i}.icon`, "İkon", s.icon, ICON_OPTS)}</div>
        ${field(`services.${i}.text`, "Açıklama", s.text, { area: true })}
      </div>`).join("") +
    `<div class="row" style="margin-top:12px"><button class="btn ghost" data-add="services">+ Hizmet Ekle</button></div>`;

  $('[data-pane="ozellikler"]').innerHTML =
    c.features.map((f, i) => `
      <div class="card item">
        <div class="item-head"><strong>${i + 1}. Özellik</strong><button class="btn danger sm" data-del="features.${i}">Sil</button></div>
        <div class="grid2">${field(`features.${i}.title`, "Başlık", f.title)}${select(`features.${i}.icon`, "İkon", f.icon, FEAT_ICONS)}</div>
        ${field(`features.${i}.text`, "Açıklama", f.text)}
      </div>`).join("") +
    (c.features.length < 6 ? `<div class="row" style="margin-top:12px"><button class="btn ghost" data-add="features">+ Özellik Ekle</button></div>` : "");

  $('[data-pane="bolgeler"]').innerHTML = `
    <div class="card"><h2>Hizmet Bölgeleri</h2>
      <label>Her satıra bir bölge yazın<textarea data-regions rows="8">${esc(c.regions.join("\n"))}</textarea></label>
    </div>`;

  $('[data-pane="seo"]').innerHTML = `
    <div class="card"><h2>Arama Motoru (Google) Bilgileri</h2>
      ${field("seoTitle", "Sayfa başlığı", c.seoTitle, { hint: "~60 karakter" })}
      ${field("seoDescription", "Açıklama", c.seoDescription, { area: true, hint: "~155 karakter" })}
    </div>
    <div class="card"><h2>Varsayılana Dön</h2>
      <p style="margin:0 0 12px;color:var(--muted)">Tüm site içeriğini ilk haline döndürür. Mesajlar silinmez.</p>
      <button class="btn danger" id="reset">İçeriği Sıfırla</button>
    </div>`;
}

const main = document.querySelector(".main");
main.addEventListener("input", (e) => {
  const k = e.target.dataset.k;
  if (k) { setPath(k, e.target.value); setDirty(); }
  if (e.target.hasAttribute("data-regions")) {
    content.regions = e.target.value.split("\n").map((s) => s.trim()).filter(Boolean);
    setDirty();
  }
});

main.addEventListener("click", async (e) => {
  const t = e.target.closest("button");
  if (!t) return;
  if (t.dataset.del) {
    const [list, i] = t.dataset.del.split(".");
    if (!confirm("Silinsin mi?")) return;
    content[list].splice(Number(i), 1);
    setDirty(); renderAll();
  } else if (t.dataset.add) {
    const list = t.dataset.add;
    content[list].push(list === "services" ? { icon: "genel", title: "Yeni Hizmet", text: "", image: "" } : { icon: "star", title: "Yeni Özellik", text: "" });
    setDirty(); renderAll();
  } else if (t.dataset.move) {
    const [list, i, d] = t.dataset.move.split(".");
    const a = content[list], from = Number(i), to = from + Number(d);
    [a[from], a[to]] = [a[to], a[from]];
    setDirty(); renderAll();
  } else if (t.id === "reset") {
    if (!confirm("Tüm içerik varsayılana dönecek. Emin misiniz?")) return;
    content = (await api("/api/admin/content", { method: "DELETE" })).content;
    setDirty(false); renderAll(); toast("İçerik sıfırlandı");
  } else if (t.dataset.msgDel) {
    if (!confirm("Mesaj silinsin mi?")) return;
    await api("/api/admin/messages/" + t.dataset.msgDel, { method: "DELETE" });
    loadMessages();
  }
});

// Görseli tarayıcıda küçültüp JPEG olarak yükle (KV boyutunu ve sayfa hızını korumak için).
async function shrink(file, max = 1400) {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const cv = document.createElement("canvas");
  cv.width = Math.round(bmp.width * s);
  cv.height = Math.round(bmp.height * s);
  cv.getContext("2d").drawImage(bmp, 0, 0, cv.width, cv.height);
  return new Promise((res) => cv.toBlob(res, "image/jpeg", 0.85));
}

main.addEventListener("change", async (e) => {
  const k = e.target.dataset.img;
  if (!k || !e.target.files[0]) return;
  try {
    toast("Görsel yükleniyor…");
    const blob = await shrink(e.target.files[0]);
    const { url } = await api("/api/admin/upload", { method: "POST", headers: { "content-type": "image/jpeg" }, body: blob });
    setPath(k, url);
    setDirty(); renderAll();
    toast("Görsel yüklendi, kaydetmeyi unutmayın");
  } catch (err) { toast(err.message, true); }
});

$("#save").addEventListener("click", async () => {
  const b = $("#save");
  b.disabled = true;
  try {
    content = (await api("/api/admin/content", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(content) })).content;
    setDirty(false);
    toast("Kaydedildi ✓");
  } catch (err) { toast(err.message, true); }
  b.disabled = false;
});

async function loadMessages() {
  const pane = $('[data-pane="mesajlar"]');
  try {
    const msgs = await api("/api/admin/messages");
    $("#msg-count").textContent = msgs.length || "";
    pane.innerHTML = msgs.length
      ? msgs.map((m) => `
        <div class="card msg" style="margin-bottom:10px">
          <div class="msg-top"><b>${esc(m.name)}</b><time>${new Date(m.date).toLocaleString("tr-TR")}</time></div>
          <a href="tel:${esc(m.phone.replace(/[^\d+]/g, ""))}" style="color:var(--blue2);font-weight:600">${esc(m.phone)}</a>
          ${m.service ? `<span class="svc">${esc(m.service)}</span>` : ""}
          ${m.message ? `<p>${esc(m.message)}</p>` : ""}
          <div class="row" style="margin-top:6px">
            <a class="btn ghost sm" href="tel:${esc(m.phone.replace(/[^\d+]/g, ""))}">Ara</a>
            <button class="btn danger sm" data-msg-del="${esc(m.id)}">Sil</button>
          </div>
        </div>`).join("")
      : `<div class="empty">Henüz mesaj yok.</div>`;
  } catch (err) { pane.innerHTML = `<div class="empty">${esc(err.message)}</div>`; }
}

boot();
