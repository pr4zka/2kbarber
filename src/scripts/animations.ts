import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduce = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// 1) Preloader: pinta el logo + contador, luego revela el hero.
export function runPreloader(onDone: () => void) {
  const pre = document.getElementById("preloader");
  const logo = document.getElementById("preloader-logo");
  const count = document.getElementById("preloader-count");

  if (!pre || reduce()) {
    pre?.remove();
    onDone();
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      pre.remove();
      onDone();
    },
  });

  const sprays = pre.querySelectorAll("#pre-spray-1, #pre-spray-2");
  const counter = { v: 0 };
  tl.from(
    sprays,
    { scale: 0.2, opacity: 0, duration: 0.7, ease: "back.out(1.7)", stagger: 0.15 },
    0,
  )
    .to(logo, { clipPath: "inset(0% 0 0 0)", duration: 1.1, ease: "power2.out" }, 0.1)
    .to(
      counter,
      {
        v: 100,
        duration: 1.3,
        ease: "power1.inOut",
        onUpdate: () => {
          if (count) count.textContent = String(Math.round(counter.v));
        },
      },
      0.1,
    )
    .to(pre, { yPercent: -100, duration: 0.9, ease: "power3.inOut" }, "+=0.25");
}

// 2) Entrada del hero.
export function animateHero() {
  if (reduce()) return;
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from('[data-hero="title"]', {
    y: 30,
    opacity: 0,
    scale: 0.92,
    duration: 1.0,
  })
    .from('[data-hero="sub"]', { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
    .from('[data-hero="cta"]', { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
    .to('[data-hero="scroll"]', {
      y: 8,
      repeat: -1,
      yoyo: true,
      duration: 1,
      ease: "sine.inOut",
    });
}

// 3) Servicios: scroll horizontal pinneado (solo desktop).
export function initServicios() {
  if (reduce()) return;
  const track = document.querySelector<HTMLElement>(".services-track");
  const section = document.querySelector<HTMLElement>("#servicios");
  if (!track || !section || window.innerWidth < 768) return;

  const scrollAmount = () => track.scrollWidth - window.innerWidth + 40;

  gsap.to(track, {
    x: () => -scrollAmount(),
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => `+=${scrollAmount()}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });
}

// 4) Reveals genéricos por scroll.
export function initReveals() {
  if (reduce()) return;

  gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  // Reveal por línea en titulares marcados con [data-split]
  gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
    gsap.from(el, {
      yPercent: 110,
      opacity: 0,
      duration: 1,
      ease: "power4.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  // Parallax de manchas
  gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
    const depth = parseFloat(el.dataset.parallax || "0.2");
    gsap.to(el, {
      yPercent: depth * 100,
      ease: "none",
      scrollTrigger: {
        trigger: el.parentElement || el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });
}
