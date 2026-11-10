document.documentElement.classList.add("js");

// mobil menü
const burger = document.getElementById("burger");
const toggleNav = (open) => {
  document.body.classList.toggle("nav-open", open);
  burger.setAttribute("aria-expanded", String(open));
};
burger.addEventListener("click", () => toggleNav(!document.body.classList.contains("nav-open")));
document.querySelectorAll("#nav a").forEach((a) => a.addEventListener("click", () => toggleNav(false)));

// kaydırınca beliren öğeler
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// alttaki hızlı iletişim çubuğu: giriş butonları ekrandan çıkınca görünür
const dock = document.querySelector(".dock");
new IntersectionObserver(([e]) => dock.classList.toggle("show", !e.isIntersecting && e.boundingClientRect.top < 0)).observe(
  document.querySelector(".hero .cta")
);

// iletişim formu
const form = document.getElementById("form");
const out = document.getElementById("form-msg");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (!data.name.trim() || data.phone.replace(/\D/g, "").length < 10) {
    out.className = "form-msg err";
    out.textContent = "Lütfen adınızı ve geçerli bir telefon numarası girin.";
    return;
  }
  const btn = form.querySelector("button");
  btn.disabled = true;
  btn.textContent = "Gönderiliyor…";
  try {
    const r = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || "Gönderilemedi");
    form.reset();
    out.className = "form-msg ok";
    out.textContent = "Mesajınız alındı, en kısa sürede sizi arayacağız.";
  } catch (err) {
    out.className = "form-msg err";
    out.textContent = err.message || "Bir hata oluştu, lütfen bizi telefonla arayın.";
  } finally {
    btn.disabled = false;
    btn.textContent = "Gönder";
  }
});
