import { DEFAULT_CONTENT } from "./defaults.js";
import { renderPage } from "./render.js";

const SESSION_DAYS = 7;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const enc = new TextEncoder();

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });

async function getContent(env) {
  const saved = await env.SITE.get("content", "json");
  return { ...DEFAULT_CONTENT, ...(saved || {}) };
}

// --- oturum: "son-kullanma.imza" biçiminde HMAC imzalı çerez ---
async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/[+/=]/g, (c) => ({ "+": "-", "/": "_", "=": "" })[c]);
}

function safeEqual(a, b) {
  const x = enc.encode(a), y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}

const secretOf = (env) => env.SESSION_SECRET || "s:" + env.ADMIN_PASSWORD;

async function makeSession(env) {
  const exp = Date.now() + SESSION_DAYS * 864e5;
  return `${exp}.${await hmac(secretOf(env), String(exp))}`;
}

async function isAuthed(req, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const m = (req.headers.get("cookie") || "").match(/(?:^|;\s*)sess=([^;]+)/);
  if (!m) return false;
  const [exp, sig] = m[1].split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, await hmac(secretOf(env), exp));
}

const cookie = (val, maxAge) => `sess=${val}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;

// --- içerik doğrulama: yalnızca bilinen alanları ve makul uzunlukları kabul et ---
const str = (v, max = 600) => String(v ?? "").slice(0, max);
function sanitizeContent(b) {
  const d = DEFAULT_CONTENT;
  const out = {};
  for (const k of Object.keys(d)) {
    if (typeof d[k] === "string") out[k] = str(b[k] ?? d[k], k.endsWith("Text") || k === "seoDescription" ? 2000 : 600);
  }
  out.services = (Array.isArray(b.services) ? b.services : d.services).slice(0, 12).map((s) => ({
    icon: str(s.icon, 20), title: str(s.title, 80), text: str(s.text, 600), image: str(s.image, 300),
  }));
  out.features = (Array.isArray(b.features) ? b.features : d.features).slice(0, 6).map((f) => ({
    icon: str(f.icon, 20), title: str(f.title, 80), text: str(f.text, 300),
  }));
  out.regions = (Array.isArray(b.regions) ? b.regions : d.regions).slice(0, 30).map((r) => str(r, 60)).filter(Boolean);
  return out;
}

async function handleApi(req, env, url) {
  const p = url.pathname;
  const method = req.method;

  if (p === "/api/contact" && method === "POST") {
    let b;
    try { b = await req.json(); } catch { return json({ error: "Geçersiz istek" }, 400); }
    if (b.website) return json({ ok: true }); // honeypot: bot
    const name = str(b.name, 80).trim(), phone = str(b.phone, 20).trim();
    if (!name || phone.replace(/\D/g, "").length < 10) return json({ error: "Lütfen ad ve geçerli bir telefon girin." }, 400);
    const ip = req.headers.get("cf-connecting-ip") || "local";
    const rlKey = "rl:" + ip;
    const count = Number((await env.SITE.get(rlKey)) || 0);
    if (count >= 5) return json({ error: "Çok fazla deneme. Lütfen bizi telefonla arayın." }, 429);
    await env.SITE.put(rlKey, String(count + 1), { expirationTtl: 3600 });
    const id = `${String(9999999999999 - Date.now()).padStart(13, "0")}-${crypto.randomUUID().slice(0, 8)}`;
    const msg = { id, name, phone, service: str(b.service, 80), message: str(b.message, 1500), date: new Date().toISOString() };
    // Ters zaman damgalı anahtar: KV list sonuçları en yeni mesaj önce gelir.
    await env.SITE.put("msg:" + id, JSON.stringify(msg));
    return json({ ok: true });
  }

  if (p === "/api/login" && method === "POST") {
    if (!env.ADMIN_PASSWORD) return json({ error: "ADMIN_PASSWORD tanımlı değil." }, 500);
    let b;
    try { b = await req.json(); } catch { return json({ error: "Geçersiz istek" }, 400); }
    if (!safeEqual(str(b.password, 200), env.ADMIN_PASSWORD)) {
      await new Promise((r) => setTimeout(r, 800));
      return json({ error: "Şifre hatalı." }, 401);
    }
    return json({ ok: true }, 200, { "set-cookie": cookie(await makeSession(env), SESSION_DAYS * 86400) });
  }

  if (p === "/api/logout" && method === "POST") return json({ ok: true }, 200, { "set-cookie": cookie("", 0) });

  if (!p.startsWith("/api/admin/")) return json({ error: "Bulunamadı" }, 404);
  if (!(await isAuthed(req, env))) return json({ error: "Oturum gerekli" }, 401);

  if (p === "/api/admin/content" && method === "GET") return json(await getContent(env));
  if (p === "/api/admin/content" && method === "PUT") {
    let b;
    try { b = await req.json(); } catch { return json({ error: "Geçersiz istek" }, 400); }
    const content = sanitizeContent(b);
    await env.SITE.put("content", JSON.stringify(content));
    return json({ ok: true, content });
  }
  if (p === "/api/admin/content" && method === "DELETE") {
    await env.SITE.delete("content");
    return json({ ok: true, content: DEFAULT_CONTENT });
  }

  if (p === "/api/admin/messages" && method === "GET") {
    const list = await env.SITE.list({ prefix: "msg:", limit: 200 });
    const items = await Promise.all(list.keys.map((k) => env.SITE.get(k.name, "json")));
    return json(items.filter(Boolean));
  }
  const del = p.match(/^\/api\/admin\/messages\/([\w-]+)$/);
  if (del && method === "DELETE") {
    await env.SITE.delete("msg:" + del[1]);
    return json({ ok: true });
  }

  if (p === "/api/admin/upload" && method === "POST") {
    const type = req.headers.get("content-type") || "";
    if (!/^image\/(jpeg|png|webp)$/.test(type)) return json({ error: "Yalnızca JPG, PNG veya WEBP." }, 400);
    const buf = await req.arrayBuffer();
    if (buf.byteLength > MAX_IMAGE_BYTES) return json({ error: "Görsel 2 MB'tan büyük olamaz." }, 413);
    const id = crypto.randomUUID();
    await env.SITE.put("img:" + id, buf, { metadata: { type } });
    return json({ ok: true, url: "/media/" + id });
  }

  return json({ error: "Bulunamadı" }, 404);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (url.pathname.startsWith("/api/")) return handleApi(req, env, url);

    if (url.pathname.startsWith("/media/")) {
      const id = url.pathname.slice(7);
      const { value, metadata } = await env.SITE.getWithMetadata("img:" + id, "arrayBuffer");
      if (!value) return new Response("Bulunamadı", { status: 404 });
      return new Response(value, {
        headers: { "content-type": metadata?.type || "image/jpeg", "cache-control": "public, max-age=31536000, immutable" },
      });
    }

    if (url.pathname === "/") {
      const html = renderPage(await getContent(env), url.origin);
      return new Response(html, {
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=0, must-revalidate" },
      });
    }

    return env.ASSETS.fetch(req);
  },
};
