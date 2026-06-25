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

// 3) Servicios: carrusel con scroll horizontal nativo.
//    Mobile -> swipe nativo. Desktop -> rueda del mouse + arrastre.
export function initServicios() {
  const vp = document.querySelector<HTMLElement>(".services-viewport");
  if (!vp) return;

  // Rueda vertical -> scroll horizontal (cede a la página en los extremos).
  vp.addEventListener(
    "wheel",
    (e) => {
      if (vp.scrollWidth <= vp.clientWidth) return;
      const delta = e.deltaY;
      const atStart = vp.scrollLeft <= 0;
      const atEnd = vp.scrollLeft + vp.clientWidth >= vp.scrollWidth - 1;
      if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return;
      e.preventDefault();
      vp.scrollLeft += delta;
    },
    { passive: false },
  );

  // Arrastrar con el mouse (solo desktop; en touch va el scroll nativo).
  let down = false;
  let startX = 0;
  let startLeft = 0;
  vp.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    down = true;
    startX = e.clientX;
    startLeft = vp.scrollLeft;
    vp.classList.add("dragging");
  });
  vp.addEventListener("pointermove", (e) => {
    if (!down) return;
    vp.scrollLeft = startLeft - (e.clientX - startX);
  });
  const end = () => {
    down = false;
    vp.classList.remove("dragging");
  };
  vp.addEventListener("pointerup", end);
  vp.addEventListener("pointerleave", end);
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
