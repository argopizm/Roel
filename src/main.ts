import "./styles/main.css";
import gsap from "gsap";
import { initBackground } from "./background";
import { initRobot } from "./robot";
import { initNav } from "./nav";
import { initScrollAnimations, initSmoothScroll, renderContent } from "./animations";

// Always start from the top so the hero intro and mascot pose line up.
window.scrollTo(0, 0);
window.addEventListener("pageshow", () => window.scrollTo(0, 0));

const bg = initBackground(document.getElementById("bg-canvas") as HTMLCanvasElement);
renderContent();
const scroller = initSmoothScroll();
initNav(scroller.scrollTo);
const robot = initRobot();
const anim = initScrollAnimations((id) => {
  bg.setSection(id);
  robot.setSection(id);
});

// Loader: wait for fonts, then reveal.
const loader = document.getElementById("loader")!;
scroller.stop();
const ready = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 1800))]);
gsap.to(".loader__bar span", { width: "100%", duration: 1.2, ease: "power2.inOut" });
ready.then(() => {
  gsap.timeline()
    .to(".loader__bar span", { width: "100%", duration: 0.2 })
    .to(loader, { yPercent: -100, duration: 0.9, ease: "power4.inOut", onComplete: () => loader.remove() }, 0.25)
    .add(() => { scroller.start(); anim.playIntro(); }, 0.6);
});
