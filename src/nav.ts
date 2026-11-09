import gsap from "gsap";

// Orb-triggered radial menu on desktop, fullscreen overlay on mobile.
export function initNav(scrollTo: (target: string) => void) {
  const orb = document.getElementById("orb")!;
  const radial = document.getElementById("radial-menu")!;
  const items = Array.from(radial.querySelectorAll<HTMLAnchorElement>(".radial__item"));
  const overlay = document.getElementById("overlay-menu")!;
  const overlayBg = overlay.querySelector<HTMLElement>(".overlay-menu__bg")!;
  const overlayLinks = Array.from(overlay.querySelectorAll<HTMLAnchorElement>("nav a"));
  const header = document.getElementById("site-header")!;
  let open = false;

  const isMobile = () => window.innerWidth < 820;

  // Items fan out in an arc below the orb.
  function layout() {
    const n = items.length;
    const radius = Math.min(230, window.innerWidth * 0.22);
    const start = Math.PI * 0.12;
    const end = Math.PI * 0.88;
    items.forEach((el, i) => {
      const a = start + ((end - start) * i) / (n - 1);
      el.dataset.tx = String(Math.cos(a) * radius);
      el.dataset.ty = String(Math.sin(a) * radius * 0.75 + 40);
    });
  }

  function openMenu() {
    open = true;
    orb.setAttribute("aria-expanded", "true");
    orb.setAttribute("aria-label", "Menüyü kapat");
    if (isMobile()) {
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("menu-open");
      gsap.to(overlayBg, { opacity: 1, duration: 0.4 });
      gsap.to(overlayLinks, { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, ease: "power3.out", delay: 0.1 });
      return;
    }
    layout();
    radial.hidden = false;
    radial.classList.add("is-open");
    gsap.killTweensOf(items);
    gsap.fromTo(
      items,
      { x: 0, y: 0, opacity: 0, scale: 0.4 },
      { x: (i) => Number(items[i].dataset.tx), y: (i) => Number(items[i].dataset.ty), opacity: 1, scale: 1, duration: 0.6, stagger: 0.04, ease: "back.out(1.8)" },
    );
  }
  function closeMenu() {
    if (!open) return;
    open = false;
    orb.setAttribute("aria-expanded", "false");
    orb.setAttribute("aria-label", "Menüyü aç");
    if (overlay.classList.contains("is-open")) {
      gsap.to(overlayLinks, { opacity: 0, y: 30, duration: 0.3, stagger: 0.03 });
      gsap.to(overlayBg, {
        opacity: 0,
        duration: 0.35,
        delay: 0.1,
        onComplete() {
          overlay.classList.remove("is-open");
          overlay.setAttribute("aria-hidden", "true");
          document.body.classList.remove("menu-open");
        },
      });
    }
    radial.classList.remove("is-open");
    gsap.to(items, {
      x: 0, y: 0, opacity: 0, scale: 0.4, duration: 0.3, stagger: { each: 0.03, from: "end" }, ease: "power2.in",
      onComplete() { radial.hidden = true; },
    });
  }

  orb.addEventListener("click", () => (open ? closeMenu() : openMenu()));
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());
  document.addEventListener("click", (e) => {
    if (open && !header.contains(e.target as Node) && !overlay.contains(e.target as Node)) closeMenu();
  });
  window.addEventListener("resize", () => open && closeMenu());

  // Anchor navigation through the smooth scroller.
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href")!;
      if (id.length < 2) return;
      e.preventDefault();
      closeMenu();
      scrollTo(id);
    });
  });

  // Rail dots
  document.querySelectorAll<HTMLLIElement>(".rail__dots li").forEach((li) => {
    li.addEventListener("click", () => scrollTo(`#${li.dataset.target}`));
  });

  // Header shrink after hero
  let compact = false;
  window.addEventListener(
    "scroll",
    () => {
      const next = window.scrollY > 80;
      if (next !== compact) {
        compact = next;
        gsap.to(".logo-capsule", { scale: next ? 0.9 : 1, duration: 0.4, ease: "power2.out", transformOrigin: "left center" });
        gsap.to(".header-cta", { autoAlpha: next ? 1 : 0.0, y: next ? 0 : -8, duration: 0.4 });
      }
    },
    { passive: true },
  );
  gsap.set(".header-cta", { autoAlpha: 0, y: -8 });
}
