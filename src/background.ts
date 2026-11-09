// Living background: drifting aurora blobs + an "edge network" of nodes that
// react to the pointer and to scroll velocity. Accent colour follows the section.

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
}

interface Blob {
  x: number;
  y: number;
  r: number;
  hue: [number, number, number];
  speed: number;
  phase: number;
}

// Light-theme accents: all within the brand purple family so the page stays corporate.
const ACCENTS: Record<string, [number, number, number]> = {
  hero: [130, 83, 245],
  hizmetler: [103, 61, 230],
  yaklasim: [130, 83, 245],
  surec: [80, 37, 209],
  modeller: [103, 61, 230],
  yorumlar: [130, 83, 245],
  sss: [103, 61, 230],
  iletisim: [168, 146, 255],
};

export function initBackground(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { alpha: true })!;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w = 0;
  let h = 0;
  let dpr = 1;
  let nodes: Node[] = [];
  let blobs: Blob[] = [];
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
  let scrollVel = 0;
  let lastScroll = window.scrollY;
  let accent: [number, number, number] = ACCENTS.hero;
  let accentTarget: [number, number, number] = ACCENTS.hero;
  let t = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(80, (w * h) / 18000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: 1 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
    }));
    blobs = [
      { x: 0.2, y: 0.3, r: 0.45, hue: [138, 93, 241], speed: 0.00018, phase: 0 },
      { x: 0.8, y: 0.2, r: 0.4, hue: [168, 146, 255], speed: 0.00023, phase: 2 },
      { x: 0.6, y: 0.85, r: 0.5, hue: [201, 181, 255], speed: 0.00015, phase: 4 },
    ];
  }

  function draw() {
    t += 1;
    ctx.clearRect(0, 0, w, h);

    // ease accent + pointer
    for (let i = 0; i < 3; i++) accent[i] += (accentTarget[i] - accent[i]) * 0.03;
    mouse.x += (mouse.tx - mouse.x) * 0.08;
    mouse.y += (mouse.ty - mouse.y) * 0.08;
    const sy = window.scrollY;
    scrollVel += (sy - lastScroll - scrollVel) * 0.2;
    lastScroll = sy;
    const velN = Math.max(-1, Math.min(1, scrollVel / 60));

    // soft lavender haze (normal blending so it tints white instead of washing it out)
    for (const b of blobs) {
      const bx = (b.x + Math.sin(t * b.speed * 60 + b.phase) * 0.12) * w;
      const by = (b.y + Math.cos(t * b.speed * 45 + b.phase) * 0.14) * h - velN * 40;
      const r = b.r * Math.max(w, h) * 0.9;
      const g = ctx.createRadialGradient(bx, by, 0, bx, by, r);
      const [cr, cg, cb] = b === blobs[0] ? accent : b.hue;
      g.addColorStop(0, `rgba(${cr | 0},${cg | 0},${cb | 0},0.09)`);
      g.addColorStop(0.5, `rgba(${cr | 0},${cg | 0},${cb | 0},0.03)`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // nodes
    const [ar, ag, ab] = accent.map((v) => v | 0);
    const linkDist = Math.min(170, w * 0.14);
    for (const n of nodes) {
      n.x += n.vx * (1 + Math.abs(velN) * 3);
      n.y += n.vy - velN * 1.2;
      // pointer attraction
      const dx = mouse.x - n.x;
      const dy = mouse.y - n.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 220 * 220 && d2 > 1) {
        const f = (1 - Math.sqrt(d2) / 220) * 0.012;
        n.vx += dx * f * 0.08;
        n.vy += dy * f * 0.08;
      }
      n.vx *= 0.985;
      n.vy *= 0.985;
      if (Math.abs(n.vx) < 0.05) n.vx += (Math.random() - 0.5) * 0.05;
      if (Math.abs(n.vy) < 0.05) n.vy += (Math.random() - 0.5) * 0.05;
      if (n.x < -20) n.x = w + 20;
      if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20;
      if (n.y > h + 20) n.y = -20;
    }

    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < linkDist) {
          const alpha = (1 - d / linkDist) * 0.11;
          ctx.strokeStyle = `rgba(${ar},${ag},${ab},${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      const pulse = 0.6 + Math.sin(t * 0.03 + n.phase) * 0.4;
      ctx.fillStyle = `rgba(${ar},${ag},${ab},${0.18 + pulse * 0.25})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * (0.8 + pulse * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }

    // pointer "signal" ring
    if (mouse.tx > 0) {
      ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.25)`;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 18 + Math.sin(t * 0.08) * 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (!reduced) requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener(
    "pointermove",
    (e) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
    },
    { passive: true },
  );
  window.addEventListener("pointerleave", () => {
    mouse.tx = -9999;
    mouse.ty = -9999;
  });

  resize();
  draw();

  return {
    setSection(id: string) {
      accentTarget = ACCENTS[id] ?? ACCENTS.hero;
      document.documentElement.style.setProperty("--accent", `rgb(${accentTarget.join(",")})`);
    },
  };
}
