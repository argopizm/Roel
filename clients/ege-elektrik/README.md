# Ege Elektrik Elektronik — Web Sitesi

Mobil öncelikli firma tanıtım sitesi + admin paneli. Tek bir Cloudflare Worker olarak çalışır:

- `/` — Worker'da, KV'deki içerikle sunucu tarafında oluşturulur (SEO dostu).
- `/admin` — şifreli yönetim paneli: metinler, iletişim bilgileri, hizmetler (görsel yükleme dahil), özellikler, bölgeler, SEO, form mesajları.
- Veriler (içerik, mesajlar, yüklenen görseller) tek bir **Workers KV** namespace'inde (`SITE`) tutulur. Ücretsiz plan yeterlidir.

## Geliştirme

```bash
npm install
echo "ADMIN_PASSWORD=test1234" > .dev.vars
npm run dev        # http://localhost:8787  — admin: /admin
```

## Cloudflare'e yayınlama

```bash
export CLOUDFLARE_API_TOKEN=...   # Workers Scripts + Workers KV Storage: Edit yetkili
export CLOUDFLARE_ACCOUNT_ID=...
npx wrangler deploy                       # KV otomatik oluşturulur
npx wrangler secret put ADMIN_PASSWORD    # admin şifresi
```

Geçici link: `https://ege-elektrik.<hesap-alt-alanı>.workers.dev`

### Alan adı bağlama

Alan adı Cloudflare'e eklendikten sonra: Workers & Pages → `ege-elektrik` → Settings → Domains & Routes → **Add Custom Domain**.
(Veya `wrangler.jsonc` içine `"routes": [{ "pattern": "alanadi.com", "custom_domain": true }]` ekleyip tekrar deploy.)

## Dosyalar

| Dosya | Görev |
| --- | --- |
| `src/worker.js` | Yönlendirme, API, oturum (HMAC imzalı çerez), görsel servis |
| `src/render.js` | Ana sayfa HTML şablonu |
| `src/defaults.js` | Varsayılan içerik (müşteri afişinden) |
| `public/style.css`, `public/app.js` | Site stili ve etkileşimleri |
| `public/admin/` | Admin paneli |
| `scripts/crop.py` | Afişten varsayılan görselleri kırpan tek seferlik betik |
