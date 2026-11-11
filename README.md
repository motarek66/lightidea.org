# LightIdea.org — Landing Page

Static landing page for LightIdea, built from the Figma design.

- `index.html` — the whole page (HTML, CSS and JavaScript in one file)
- `assets/` — images, logos and icons exported from Figma

## Run locally

Serve the folder with any static server, for example:

```bash
npx http-server . -p 5510
```

Then open http://localhost:5510.

## Libraries (loaded from CDN)

- [GSAP](https://gsap.com/) 3.13 with ScrollTrigger and SplitText — animations
- [Lenis](https://lenis.darkroom.engineering/) 1.3 — smooth scrolling
- [Phosphor Icons](https://phosphoricons.com/) — icons
- Google Fonts (Inter, Manrope, Geist, Onest, JetBrains Mono)

Motion respects `prefers-reduced-motion`.
