import gsap from "gsap";
import { robotClickLines, robotLines } from "./data";

// The mascot lives in a fixed layer. In the hero it is "posed" next to the
// headline; once the user scrolls past, it docks to the bottom-right and
// starts roaming along the bottom band of the viewport.

interface Pose {
  x: number;
  y: number;
  s: number;
}

export function initRobot() {
  const root = document.getElementById("robot")!;
  const svg = document.getElementById("robot-svg") as unknown as SVGSVGElement;
  const bubble = document.getElementById("robot-bubble")!;
  const bubbleText = document.getElementById("robot-bubble-text")!;
  const sparks = document.getElementById("robot-sparks")!;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const head = svg.querySelector(".rb-head")!;
  const armR = svg.querySelector(".rb-arm--r")!;
  const eyes = svg.querySelectorAll<SVGGElement>(".rb-eye");
  const pupils = svg.querySelectorAll<SVGCircleElement>(".rb-pupil");
  const flames = svg.querySelectorAll<SVGPathElement>(".rb-flame");
  const mouth = svg.querySelector<SVGPathElement>(".rb-mouth")!;

  const cur: Pose = { x: 0, y: 0, s: 1 };
  let facing = 1; // 1 = right, -1 = left
  let mode: "hero" | "roam" = "hero";
  let roamX = 0;
  let wanderTween: gsap.core.Tween | null = null;
  let wanderTimer = 0;
  let bubbleTimer = 0;
  let idleTimer = 0;
  let busy = false;
  let currentSection = "hero";
  let scrollVel = 0;
  let lastY = window.scrollY;
  let bob = 0;
  let lean = 0;

  const size = () => ({ w: root.offsetWidth, h: root.offsetHeight });
  const isMobile = () => window.innerWidth < 820;

  function heroPose(): Pose {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { w, h } = size();
    if (isMobile()) return { x: vw - w - 12, y: vh - h - 12, s: 0.95 };
    const s = gsap.utils.clamp(1.1, 1.9, vw / 820);
    return { x: Math.min(vw * 0.66, vw - w * s - 40), y: vh * 0.5 - (h * s) / 2 + 20, s };
  }
  function dockPose(): Pose {
    const { w, h } = size();
    return { x: window.innerWidth - w - 20, y: window.innerHeight - h - 16, s: 1 };
  }

  // ---------- speech ----------
  function say(text: string, hold = 3800) {
    clearTimeout(bubbleTimer);
    bubbleText.textContent = text;
    gsap.killTweensOf(bubble);
    gsap.fromTo(bubble, { opacity: 0, y: 8, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(2)" });
    bubbleTimer = window.setTimeout(() => gsap.to(bubble, { opacity: 0, y: 6, duration: 0.3 }), hold);
  }
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

  // ---------- idle animations ----------
  function blink() {
    gsap.to(eyes, { scaleY: 0.08, duration: 0.08, yoyo: true, repeat: 1, transformOrigin: "50% 50%" });
    setTimeout(blink, 2200 + Math.random() * 3200);
  }
  function wave() {
    gsap.fromTo(armR, { rotate: 0 }, { rotate: -70, duration: 0.3, yoyo: true, repeat: 5, ease: "sine.inOut", transformOrigin: "50% 10%" });
  }

  // ---------- pointer tracking ----------
  const pupilX = gsap.quickTo(pupils, "x", { duration: 0.4, ease: "power2" });
  const pupilY = gsap.quickTo(pupils, "y", { duration: 0.4, ease: "power2" });
  const headRot = gsap.quickTo(head, "rotate", { duration: 0.6, ease: "power2" });
  window.addEventListener(
    "pointermove",
    (e) => {
      const r = root.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.3;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 300);
      pupilX((dx / d) * 4 * k * facing);
      pupilY((dy / d) * 4 * k);
      headRot(gsap.utils.clamp(-8, 8, (dx / window.innerWidth) * 16 * facing));
    },
    { passive: true },
  );

  // ---------- click reaction ----------
  svg.addEventListener("click", () => {
    if (busy) return;
    busy = true;
    root.classList.add("is-busy");
    say(pick(robotClickLines), 3000);
    gsap.to(mouth, { attr: { d: "M68 70 Q80 84 92 70" }, duration: 0.2, yoyo: true, repeat: 1, repeatDelay: 1.4 });
    const tl = gsap.timeline({ onComplete: () => { busy = false; root.classList.remove("is-busy"); } });
    tl.to(root, { y: -60, duration: 0.35, ease: "power2.out" }, 0)
      .to(svg, { rotate: 360 * facing, duration: 0.7, ease: "power2.inOut", transformOrigin: "50% 60%" }, 0)
      .to(root, { y: 0, duration: 0.45, ease: "bounce.out" }, 0.35)
      .set(svg, { rotate: 0 });
    burst();
  });

  function burst() {
    const colors = ["#5ed5ee", "#8a5df1", "#ff3b7c", "#52d399", "#f6a04d"];
    for (let i = 0; i < 14; i++) {
      const s = document.createElement("i");
      s.style.background = colors[i % colors.length];
      sparks.appendChild(s);
      const a = (i / 14) * Math.PI * 2;
      const d = 60 + Math.random() * 60;
      gsap.fromTo(
        s,
        { x: 0, y: 0, scale: 1, opacity: 1 },
        { x: Math.cos(a) * d, y: Math.sin(a) * d - 30, scale: 0, opacity: 0, duration: 0.8 + Math.random() * 0.4, ease: "power3.out", onComplete: () => s.remove() },
      );
    }
  }

  // ---------- roaming ----------
  function scheduleWander() {
    clearTimeout(wanderTimer);
    wanderTimer = window.setTimeout(wander, 2500 + Math.random() * 6000);
  }
  function wander() {
    // On small screens the mascot stays docked so it never covers tap targets.
    if (mode !== "roam" || reduced || document.hidden || isMobile()) return scheduleWander();
    const { w } = size();
    const minX = isMobile() ? 12 : 90;
    const maxX = window.innerWidth - w - 20;
    const target = gsap.utils.random(minX, maxX);
    const dist = Math.abs(target - roamX);
    if (dist < 80) return scheduleWander();
    facing = target > roamX ? 1 : -1;
    gsap.to(svg, { scaleX: facing, duration: 0.25, transformOrigin: "50% 50%" });
    const dur = dist / 110;
    wanderTween = gsap.to({ v: roamX }, {
      v: target,
      duration: dur,
      ease: "sine.inOut",
      onUpdate() {
        roamX = (this.targets()[0] as { v: number }).v;
      },
      onStart() {
        gsap.to({ l: lean }, { l: 10 * facing, duration: 0.4, onUpdate() { lean = (this.targets()[0] as { l: number }).l; } });
      },
      onComplete() {
        gsap.to({ l: lean }, { l: 0, duration: 0.5, onUpdate() { lean = (this.targets()[0] as { l: number }).l; } });
        if (Math.random() < 0.35) say(pick(robotLines[currentSection] ?? robotLines.hero), 3000);
        scheduleWander();
      },
    });
  }

  function enterRoam() {
    if (mode === "roam") return;
    mode = "roam";
    roamX = dockPose().x;
    scheduleWander();
  }
  function leaveRoam() {
    if (mode === "hero") return;
    mode = "hero";
    wanderTween?.kill();
    wanderTween = null;
    clearTimeout(wanderTimer);
    lean = 0;
    if (facing !== 1) {
      facing = 1;
      gsap.to(svg, { scaleX: 1, duration: 0.25 });
    }
  }

  // ---------- main loop ----------
  const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  gsap.ticker.add((time) => {
    const y = window.scrollY;
    scrollVel += (y - lastY - scrollVel) * 0.15;
    lastY = y;
    const p = gsap.utils.clamp(0, 1, y / (window.innerHeight * 0.85));
    const hp = heroPose();
    const dp = dockPose();
    let target: Pose;
    if (p >= 1) {
      enterRoam();
      target = { x: roamX, y: dp.y, s: dp.s };
    } else {
      leaveRoam();
      const e = ease(p);
      target = { x: hp.x + (dp.x - hp.x) * e, y: hp.y + (dp.y - hp.y) * e, s: hp.s + (dp.s - hp.s) * e };
    }
    cur.x += (target.x - cur.x) * 0.12;
    cur.y += (target.y - cur.y) * 0.12;
    cur.s += (target.s - cur.s) * 0.12;

    bob = reduced ? 0 : Math.sin(time * 2.2) * 6;
    const tilt = gsap.utils.clamp(-16, 16, -scrollVel * 0.18) + lean;
    const thrust = 1 + Math.min(1.6, Math.abs(scrollVel) * 0.02 + Math.abs(lean) * 0.05);
    gsap.set(root, { x: cur.x, y: cur.y + bob, scale: cur.s, rotate: tilt });
    gsap.set(flames, { scaleY: thrust });
  });

  // ---------- section lines ----------
  function setSection(id: string) {
    if (id === currentSection) return;
    currentSection = id;
    const lines = robotLines[id];
    if (lines) say(pick(lines));
    clearTimeout(idleTimer);
    idleTimer = window.setTimeout(idleTalk, 14000);
  }
  function idleTalk() {
    if (!document.hidden && mode === "roam") say(pick(robotLines[currentSection] ?? robotLines.hero), 3200);
    idleTimer = window.setTimeout(idleTalk, 14000 + Math.random() * 8000);
  }

  // init
  const hp = heroPose();
  Object.assign(cur, hp);
  gsap.set(root, { x: hp.x, y: hp.y, scale: hp.s });
  if (!reduced) {
    blink();
    setTimeout(() => {
      wave();
      say(robotLines.hero[0]);
    }, 1400);
    idleTimer = window.setTimeout(idleTalk, 12000);
  }

  return { setSection, say };
}
