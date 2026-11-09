import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { reviews, services } from "./data";

gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = () => window.innerWidth < 820;

export function initSmoothScroll() {
  const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return {
    scrollTo(target: string) {
      lenis.scrollTo(target, { offset: target === "#hero" ? 0 : -20, duration: 1.4 });
    },
    stop: () => lenis.stop(),
    start: () => lenis.start(),
  };
}

// Splits a heading into word spans wrapped in overflow:hidden lines.
function splitWords(el: HTMLElement) {
  const text = el.textContent?.trim() ?? "";
  el.setAttribute("aria-label", text);
  el.innerHTML = text
    .split(/\s+/)
    .map((w) => `<span class="w" aria-hidden="true" style="display:inline-block;transform:translateY(110%)">${w}</span>`)
    .join(" ");
  el.style.overflow = "hidden";
  el.style.paddingBottom = "0.1em";
}

export function renderContent() {
  const track = document.getElementById("services-track")!;
  track.innerHTML =
    services
      .map(
        (s, i) => `
      <article class="svc" style="--a:${s.accent}" data-slug="${s.slug}">
        <span class="svc__num">${String(i + 1).padStart(2, "0")} / ${services.length}</span>
        <span class="svc__icon"><svg viewBox="0 0 24 24" aria-hidden="true">${s.icon}</svg></span>
        <h3>${s.title}</h3>
        <span class="svc__short">${s.short}</span>
        <p>${s.desc}</p>
        <span class="svc__glyph" aria-hidden="true">✦</span>
      </article>`,
      )
      .join("") +
    `<article class="svc svc--end">
      <h3>Hangisi size uygun?</h3>
      <p>Kapsamı birlikte netleştirelim. Ücretsiz keşif görüşmesinde ihtiyacınızı dinleyip mimariyi planlıyoruz.</p>
      <a class="btn btn--primary" href="#iletisim"><span>Proje konuşalım</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
    </article>`;

  const rows = document.getElementById("reviews-rows")!;
  const card = (r: (typeof reviews)[number]) => `
    <article class="review">
      <header><b>@${r.name}</b><span>★ ${r.score.toFixed(1)}</span></header>
      <p>“${r.text}”</p>
      <footer><i></i> Bionluk üzerinden doğrulandı</footer>
    </article>`;
  const a = reviews.slice(0, 4);
  const b = reviews.slice(4);
  rows.innerHTML = `
    <div class="reviews__row">${[...a, ...b, ...a, ...b].map(card).join("")}</div>
    <div class="reviews__row reviews__row--rev">${[...b, ...a, ...b, ...a].map(card).join("")}</div>`;

  // Card spotlight follows the pointer.
  track.addEventListener("pointermove", (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>(".svc");
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  });
}

export function initScrollAnimations(onSection: (id: string) => void) {
  // ----- hero intro -----
  const intro = gsap.timeline({ paused: true });
  intro
    .to("#hero-title .w", { y: 0, duration: 1.1, stagger: 0.08, ease: "power4.out" }, 0)
    .to(".hero__copy [data-reveal]", { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: "power3.out" }, 0.4)
    .from("#globe", { scale: 0.86, opacity: 0, duration: 1.4, ease: "power3.out" }, 0.2)
    .to(".hero__stats [data-reveal]", { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" }, 0.8)
    .add(() => countUp(), 0.9);

  // hero parallax: globe drifts slower than the copy
  gsap.to("#hero-visual", {
    yPercent: 18,
    ease: "none",
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".hero__copy", {
    yPercent: -10,
    opacity: 0.3,
    ease: "none",
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
  });

  // ----- generic reveals -----
  document.querySelectorAll<HTMLElement>("[data-split]").forEach(splitWords);
  gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
    gsap.to(el.querySelectorAll(".w"), {
      y: 0, duration: 1, stagger: 0.06, ease: "power4.out",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  });
  ScrollTrigger.batch("main [data-reveal]:not(.hero [data-reveal])", {
    start: "top 88%",
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power3.out", overwrite: true }),
  });

  // ----- services horizontal pin -----
  const pin = document.getElementById("services-pin")!;
  const track = document.getElementById("services-track")!;
  const prog = document.getElementById("services-progress")!;
  ScrollTrigger.matchMedia({
    "(min-width: 821px)": () => {
      const getDist = () => track.scrollWidth - window.innerWidth;
      const tween = gsap.to(track, {
        x: () => -getDist(),
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: () => `+=${getDist() + window.innerHeight * 0.15}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => { prog.style.width = `${self.progress * 100}%`; },
        },
      });
      gsap.utils.toArray<HTMLElement>(".svc").forEach((card) => {
        gsap.from(card, {
          y: 80, opacity: 0, rotate: 3, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 95%", once: true },
        });
      });
    },
    "(max-width: 820px)": () => {
      gsap.utils.toArray<HTMLElement>(".svc").forEach((card) => {
        gsap.from(card, { y: 40, opacity: 0, duration: 0.7, scrollTrigger: { trigger: card, start: "top 90%", once: true } });
      });
    },
  });

  // ----- approach layer peel -----
  const layers = gsap.utils.toArray<HTMLElement>(".layer");
  const items = gsap.utils.toArray<HTMLElement>("#approach-list li");
  const setActive = (i: number) => items.forEach((li, j) => li.classList.toggle("is-active", i === j));
  const mobile = isMobile();
  gsap.set(layers, { rotateX: mobile ? 36 : 52, rotateZ: mobile ? 0 : -8, y: (i) => i * -40, z: (i) => i * -80, transformOrigin: "50% 50%" });
  const peel = gsap.timeline({
    scrollTrigger: {
      trigger: "#approach-stage",
      start: "top 70%",
      end: "bottom 40%",
      scrub: 0.8,
      onUpdate: (self) => setActive(self.progress < 0.33 ? 0 : self.progress < 0.66 ? 1 : 2),
    },
  });
  peel
    .to(layers, { rotateX: mobile ? 36 : 52, rotateZ: mobile ? 0 : -8, y: (i) => i * (mobile ? -110 : -150), z: (i) => i * 60, ease: "power1.inOut", duration: 1 })
    .to(layers, {
      rotateX: 0, rotateZ: (i) => (mobile ? 0 : (i - 1) * -5), y: (i) => (i - 1) * (mobile ? 44 : 30), x: (i) => (mobile ? 0 : (i - 1) * 110), z: 0,
      ease: "power2.inOut", duration: 1,
    });
  items.forEach((li, i) => li.addEventListener("click", () => setActive(i)));

  // ----- process path draw -----
  const line = document.getElementById("process-line") as unknown as SVGPathElement | null;
  if (line && !isMobile()) {
    const len = line.getTotalLength();
    gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
    const steps = gsap.utils.toArray<HTMLElement>("#process-steps li");
    gsap.to(line, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".process__path",
        start: "top 75%",
        end: "bottom 45%",
        scrub: 0.5,
        onUpdate: (self) => {
          steps.forEach((s, i) => s.classList.toggle("is-lit", self.progress >= (i + 0.4) / steps.length));
        },
      },
    });
    gsap.from(steps, {
      y: 30, opacity: 0, duration: 0.7, stagger: 0.12, ease: "power3.out",
      scrollTrigger: { trigger: ".process__path", start: "top 80%", once: true },
    });
  } else {
    gsap.utils.toArray<HTMLElement>("#process-steps li").forEach((s) => {
      gsap.from(s, { y: 30, opacity: 0, duration: 0.7, scrollTrigger: { trigger: s, start: "top 90%", once: true, onEnter: () => s.classList.add("is-lit") } });
    });
  }

  // ----- models fly-in + tilt -----
  gsap.from(".model", {
    y: 80, opacity: 0, rotateY: -18, duration: 1, stagger: 0.14, ease: "power3.out",
    scrollTrigger: { trigger: "#models-grid", start: "top 80%", once: true },
  });
  document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((card) => {
    const rx = gsap.quickTo(card, "rotateX", { duration: 0.5, ease: "power2" });
    const ry = gsap.quickTo(card, "rotateY", { duration: 0.5, ease: "power2" });
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
      ry(((e.clientX - r.left) / r.width - 0.5) * 12);
    });
    card.addEventListener("pointerleave", () => { rx(0); ry(0); });
  });

  // ----- FAQ accordion -----
  document.querySelectorAll<HTMLDetailsElement>("#faq-list details").forEach((d) => {
    const body = d.querySelector<HTMLElement>(".faq__body")!;
    const summary = d.querySelector("summary")!;
    summary.addEventListener("click", (e) => {
      e.preventDefault();
      if (d.open) {
        gsap.to(body, { height: 0, opacity: 0, duration: 0.35, ease: "power2.inOut", onComplete: () => (d.open = false) });
      } else {
        d.open = true;
        gsap.fromTo(body, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.45, ease: "power3.out" });
      }
    });
  });

  // ----- CTA title -----
  gsap.from("#cta-title .line", {
    yPercent: 110, duration: 1.1, stagger: 0.12, ease: "power4.out",
    scrollTrigger: { trigger: "#cta-title", start: "top 85%", once: true },
  });

  // ----- magnetic buttons -----
  if (!isMobile()) {
    document.querySelectorAll<HTMLElement>(".magnetic").forEach((btn) => {
      const x = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" });
      const y = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        x((e.clientX - r.left - r.width / 2) * 0.3);
        y((e.clientY - r.top - r.height / 2) * 0.4);
      });
      btn.addEventListener("pointerleave", () => { x(0); y(0); });
    });
  }

  // ----- section tracking (nav + accent + robot) -----
  document.querySelectorAll<HTMLElement>("[data-section]").forEach((sec) => {
    const id = sec.dataset.section!;
    ScrollTrigger.create({
      trigger: sec,
      start: "top 50%",
      end: "bottom 50%",
      onToggle: (self) => {
        if (!self.isActive) return;
        document.body.dataset.section = id;
        onSection(id);
      },
    });
  });

  if (reduced) {
    intro.progress(1);
    ScrollTrigger.getAll().forEach((st) => st.vars.scrub && st.kill());
  }

  return { playIntro: () => intro.play() };
}

function countUp() {
  document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    const decimals = Number(el.dataset.decimals ?? 0);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.8, ease: "power3.out",
      onUpdate: () => { el.textContent = obj.v.toFixed(decimals).replace(".", ","); },
    });
  });
}
