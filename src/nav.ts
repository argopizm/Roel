import gsap from "gsap";

// Classic sticky header with hamburger-driven fullscreen overlay on small screens.
export function initNav(scrollTo: (target: string) => void) {
  const burger = document.getElementById("burger")!;
  const overlay = document.getElementById("overlay-menu")!;
  const overlayBg = overlay.querySelector<HTMLElement>(".overlay-menu__bg")!;
  const overlayLinks = Array.from(overlay.querySelectorAll<HTMLAnchorElement>("nav a"));
  const header = document.getElementById("site-header")!;
  const promo = document.getElementById("promo")!;
  const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>("#nav-links a"));
  let open = false;

  function openMenu() {
    open = true;
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Menüyü kapat");
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
    gsap.to(overlayBg, { opacity: 1, duration: 0.4 });
    gsap.to(overlayLinks, { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, ease: "power3.out", delay: 0.1 });
  }
  function closeMenu() {
    if (!open) return;
    open = false;
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Menüyü aç");
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

  burger.addEventListener("click", () => (open ? closeMenu() : openMenu()));
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());
  window.addEventListener("resize", () => open && closeMenu());

  promo.querySelector("#promo-close")!.addEventListener("click", () => promo.classList.add("is-hidden"));

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

  window.addEventListener("scroll", () => header.classList.toggle("is-scrolled", window.scrollY > 10), { passive: true });

  return {
    setSection(id: string) {
      navLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.nav === id));
    },
  };
}
