# 2kbarber

Landing inmersiva para **2K Barber Shop** — estética street/graffiti, construida con Astro + Tailwind CSS, GSAP y Three.js.

## Stack
- [Astro](https://astro.build) (output estático)
- Tailwind CSS v4
- GSAP + ScrollTrigger
- Lenis (smooth scroll)
- Three.js (escena 3D del hero)

## Desarrollo
```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # build de producción
pnpm preview
```

## Reservas
El formulario de turnos hace `POST` a la API propia (configurable en `.env`):
```
PUBLIC_API_BASE=https://api.pr4zka.online/api
PUBLIC_CITAS_PATH=/citas
PUBLIC_HORARIOS_PATH=/horarios
```
Pendiente en el backend: endpoints `/citas` y `/horarios` + CORS.
