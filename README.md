# Roel Cloud — Web Sitesi

roelcloud.com için sıfırdan tasarlanmış, scroll animasyonlu, canlı arka planlı ve sayfada gezinen robot maskotlu tek sayfa site.

## Geliştirme

```bash
pnpm install
pnpm dev      # http://localhost:5173
pnpm build    # dist/ klasörüne statik çıktı
pnpm preview  # build'i yerelde önizle
```

Çıktı tamamen statiktir (`dist/`); Cloudflare Pages, Netlify veya herhangi bir statik hosting'e doğrudan yüklenebilir.

## Yapı

| Dosya | Görev |
| --- | --- |
| `index.html` | Tüm bölümlerin işaretlemesi (hero, hizmetler, yaklaşım, süreç, modeller, yorumlar, SSS, iletişim, footer) |
| `src/data.ts` | Hizmetler, müşteri yorumları ve robotun bölüm bazlı replikleri |
| `src/background.ts` | Canvas tabanlı canlı arka plan: aurora + imlece tepki veren edge-ağı |
| `src/robot.ts` | Robot maskot: hero pozundan dock'a geçiş, gezinme, göz takibi, konuşma balonu, tıklama tepkisi |
| `src/nav.ts` | Orb tetiklemeli radyal menü (masaüstü) ve tam ekran overlay menü (mobil) |
| `src/animations.ts` | Lenis smooth scroll + GSAP ScrollTrigger animasyonları |
| `src/styles/main.css` | Tasarım sistemi ve tüm stiller |

İçerik değişiklikleri için `src/data.ts` ve `index.html` yeterlidir.
