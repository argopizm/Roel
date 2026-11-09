export interface Service {
  slug: string;
  title: string;
  short: string;
  desc: string;
  accent: string;
  icon: string; // inline SVG path(s)
}

export const services: Service[] = [
  {
    slug: "web-tasarim",
    title: "Kurumsal Web & Tasarım",
    short: "Marka odaklı, hızlı, yönetilebilir",
    desc: "Ölçeklenebilir, hızlı ve kolay yönetilebilir kurumsal web siteleri. Özel UI/UX, SEO, yönetim paneli ve Cloudflare CDN.",
    accent: "#8a5df1",
    icon: `<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18M8 21h8"/>`,
  },
  {
    slug: "e-ticaret",
    title: "E-Ticaret & B2B",
    short: "Yüksek dönüşümlü mağazalar",
    desc: "Yüksek dönüşüm oranlı online mağazalar ve B2B sipariş sistemleri. Ödeme, kargo ve muhasebe entegrasyonları.",
    accent: "#ff9e64",
    icon: `<path d="M3 4h2l2.5 11h11L21 7H7"/><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/>`,
  },
  {
    slug: "blog-haber",
    title: "Blog & Haber Platformu",
    short: "Yüksek trafik içerik mimarisi",
    desc: "Milyonlarca görüntülemeye hazır içerik platformları. Editör panelleri, kategori yapısı ve edge önbellekleme.",
    accent: "#58d7bd",
    icon: `<path d="M4 5h16v14H4zM8 9h8M8 13h8M8 17h5"/>`,
  },
  {
    slug: "ui-ux",
    title: "UI / UX Tasarım",
    short: "Kullanıcı odaklı arayüz sistemleri",
    desc: "Erişilebilir, dönüşüm odaklı ekranlar ve ölçeklenebilir tasarım sistemleri. Prototipten koda.",
    accent: "#f092c7",
    icon: `<circle cx="12" cy="12" r="3"/><path d="M4 12h3M17 12h3M12 4v3M12 17v3"/>`,
  },
  {
    slug: "ozel-yazilim",
    title: "Özel Yazılım Geliştirme",
    short: "İş akışınıza özel sistemler",
    desc: "İş süreçlerinize göre tasarlanmış web sistemleri; yönetim panelleri, backend servisleri ve raporlama.",
    accent: "#5ea9ff",
    icon: `<path d="M8 6l-5 6 5 6M16 6l5 6-5 6M14 4l-4 16"/>`,
  },
  {
    slug: "saas",
    title: "Platform & SaaS",
    short: "Çok kiracılı abonelik ürünleri",
    desc: "Ölçeklenebilir, çok kullanıcılı abonelik ürünleri. Üyelik, abonelik, rol yönetimi ve multi-tenant mimari.",
    accent: "#b98cff",
    icon: `<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>`,
  },
  {
    slug: "mobil",
    title: "Mobil Uygulama",
    short: "Native iOS & Android",
    desc: "Web sistemleriyle senkron, bildirim destekli, akıcı native deneyimler.",
    accent: "#5ed5ee",
    icon: `<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>`,
  },
  {
    slug: "masaustu",
    title: "Masaüstü Uygulama",
    short: "Windows & macOS iş araçları",
    desc: "Ofis içi operasyonlar için çevrimdışı çalışabilen, hızlı masaüstü yazılımları.",
    accent: "#9d79ff",
    icon: `<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>`,
  },
  {
    slug: "cloudflare",
    title: "Cloudflare & Edge CDN",
    short: "Önbellek, WAF, DDoS koruması",
    desc: "300+ edge noktasında önbellekleme, WAF kuralları, DDoS koruması ve performans iyileştirmeleri.",
    accent: "#f6a04d",
    icon: `<path d="M7 18a4 4 0 0 1-.6-7.95A6 6 0 0 1 18 8.5a4.5 4.5 0 0 1-.5 9H7z"/>`,
  },
  {
    slug: "devops",
    title: "Cloud & DevOps",
    short: "Sunucu mimarisi, CI/CD",
    desc: "Trafik büyümesine hazır sunucu mimarisi, konteyner altyapısı ve otomatik dağıtım hatları.",
    accent: "#71b8ff",
    icon: `<rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/><path d="M7 7h.01M7 17h.01"/>`,
  },
  {
    slug: "api",
    title: "API & Entegrasyon",
    short: "ERP, CRM, ödeme, kargo",
    desc: "ERP, CRM, ödeme, kargo ve üçüncü parti servislerle güvenli, izlenebilir veri akışı.",
    accent: "#52d399",
    icon: `<path d="M10 14a4 4 0 0 1 0-5.6l2-2a4 4 0 0 1 5.6 5.6l-1 1M14 10a4 4 0 0 1 0 5.6l-2 2a4 4 0 0 1-5.6-5.6l1-1"/>`,
  },
  {
    slug: "ai",
    title: "Yapay Zekâ & Otomasyon",
    short: "LLM ajanları, iş otomasyonu",
    desc: "Operasyon, müşteri yanıtı ve veri işleme için LLM tabanlı ajanlar ve otomasyon akışları.",
    accent: "#c58aff",
    icon: `<path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4zM5 17l.8 2 2 .8-2 .8L5 22l-.8-1.4-2-.8 2-.8zM19 15l.6 1.6 1.6.6-1.6.6L19 19l-.6-1.2-1.6-.6 1.6-.6z"/>`,
  },
  {
    slug: "seo",
    title: "Teknik SEO",
    short: "Core Web Vitals, görünürlük",
    desc: "Core Web Vitals, yapısal veri, tarama bütçesi ve arama görünürlüğünde ölçülebilir iyileştirme.",
    accent: "#66d5a7",
    icon: `<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M8 11l2 2 4-4"/>`,
  },
];

export interface Review {
  name: string;
  score: number;
  text: string;
}

export const reviews: Review[] = [
  { name: "tanegeli", score: 4.8, text: "Projemizin yapısını daha da genişleterek eksiksiz bir şekilde dizayn edilmesine yardımcı oldular. Ortaya çıkan finansal analiz platformu beklentilerimizi aştı." },
  { name: "ferituzun", score: 5, text: "Elinize sağlık. Pratik, samimi, doğal ve hızlı çözüm üreten bir ekip. İkinci sipariş ile devam ediyoruz." },
  { name: "sizinbahce", score: 5, text: "Çok cana yakın ve sıkılmadan bizim isteklerimize göre çalıştılar. Çok hızlı ve çok tatmin edici bir iş çıkardılar." },
  { name: "oguzhankarakurt", score: 5, text: "Çok ilgili ve tüm isteklerimize hızlı şekilde geri dönüş yapıp yerine getirdiği için firmamız adına çok teşekkür ediyoruz." },
  { name: "company", score: 5, text: "Great job. Thanks!" },
  { name: "doğrulanmış müşteri", score: 5, text: "Emeğinize sağlık, dört dörtlük ve bir o kadar hızlı bir çalışma oldu. Net tavsiye ederim." },
  { name: "doğrulanmış müşteri", score: 5, text: "İletişim ve hizmetin kalitesi süperdi. Yeni bir ihtiyacımızda kesin çözüm ortaklarımızdan biri olacaklar." },
  { name: "doğrulanmış müşteri", score: 4.9, text: "Zamanında teslim, net iletişim ve beklediğimizden iyi bir sonuç. Uzun vadeli çalışacağız." },
];

// What the mascot says when each section scrolls into view.
export const robotLines: Record<string, string[]> = {
  hero: ["Merhaba! Ben Roel. 👋", "Sayfayı kaydır, seninle geliyorum.", "Edge'de yaşıyorum, 25 ms'de oradayım."],
  hizmetler: ["13 alan, tek ekip. Hangisi lazım?", "Kaydırmaya devam, kartlar yana akıyor →", "E-ticaret mi, SaaS mi? İkisini de yaparız."],
  yaklasim: ["Üç katman, tek mimari.", "Deneyim → Uygulama → Edge. Hepsi birlikte.", "Tek parça değil, bütün sistem."],
  surec: ["Fikirden yayına 6 adım.", "Önce dinliyoruz, sonra inşa ediyoruz.", "Yayın sonrası da buradayız."],
  modeller: ["Sabit paket yok, net teklif var.", "Ortadaki en çok tercih edilen 😉", "Kapsamı birlikte belirliyoruz."],
  yorumlar: ["4,9 / 5 — teşekkürler! ⭐", "Hepsi Bionluk'ta doğrulanmış.", "%100 zamanında teslim."],
  sss: ["Sorusu olan?", "Fiyat kapsama göre belirlenir.", "Mevcut siteyi de geliştiririz."],
  iletisim: ["Hadi konuşalım! 🚀", "WhatsApp'tan yaz, hemen dönelim.", "Ücretsiz keşif görüşmesi bekliyor."],
};

export const robotClickLines = [
  "Hey! Gıdıklanıyorum 😄",
  "Beep boop. Sistem %100.",
  "Bir fikrin mi var? Aşağıda konuşalım!",
  "Cloudflare'de uyudum, edge'de uyandım.",
  "WAF aktif, DDoS yok, keyif var.",
  "PageSpeed 98+. Ben de hızlıyım!",
];
