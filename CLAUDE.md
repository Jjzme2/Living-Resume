# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build (SSR, Vercel preset)
npm run generate   # Static site generation
npm run preview    # Preview production build locally
```

There is no lint or test runner configured.

## Architecture

**Nuxt 3 + Vue 3 + TypeScript + Pinia.** Deployed to Vercel as an SSR app.

### Data Flow

Everything originates from a single file:

```
config/site.ts  →  stores/site.ts (Pinia)  →  components & pages
```

`config/site.ts` is the sole source of truth for all personal/professional data (person, business, social links, skills, experience, education, projects, site settings). The Pinia store (`useSiteStore()`) loads this config and exposes computed getters like `skillsByCategory`, `featuredProjects`, `socialLinks`, and boolean presence checks (`hasSkills`, `hasSocial`, etc.). Components never import from `config/site.ts` directly — always through the store.

Section visibility (Projects, Blog, Contact, etc.) is toggled via `siteSettings` flags in `config/site.ts`, which the store and `SiteHeader.vue` respect.

### Routing

File-based Nuxt routing:
- `/` — Home (assembles all section components from `components/home/`)
- `/resume` — Print-optimized resume (uses `layouts/resume.vue`, renders `ResumeDoc.vue`)
- `/blog` — Blog index (queries `content/blog/*.md` via `@nuxt/content`)
- `/blog/[slug]` — Individual blog post
- `/projects` — Projects listing

### Blog Content

Markdown files in `content/blog/` are queried with `queryContent()` from `@nuxt/content`. The directory is currently empty (only `.gitkeep`). Add `.md` files with frontmatter to populate the blog.

### Animation System

- **Scroll reveal:** `composables/useScrollReveal.ts` — Intersection Observer that adds `.visible` to elements with `.reveal`, `.reveal-left`, `.reveal-right`, or `.stagger` classes. Animations play once.
- **Kinetic typography:** `components/ui/KineticText.vue` — typewriter character-by-character reveal, accepts `:text`, `:speed` (ms/char), `:delay` (ms before start).
- **Particle field:** `components/canvas/ParticleField.vue` — canvas-based hero background.
- **Stagger timing:** CSS `--delay` custom property on `.reveal` elements sets `transitionDelay` at mount.

### Design Tokens

All design tokens (colors, spacing, typography, shadows) live in `assets/css/main.css`. Print styles are in `assets/css/print.css`. No CSS preprocessor — plain CSS with custom properties.

Key tokens: `--accent` (teal `#5eead4`), `--text-1/2/3` (layered text), `--sp-1` through `--sp-24` (spacing scale). Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (mono).

### Component Conventions

- Components are auto-imported (no explicit imports needed). Registration uses `pathPrefix: false` so only the filename matters, not the directory.
- `components/ui/` — reusable primitives (`GlassCard`, `SectionHeading`, `KineticText`, `SocialIcon`)
- `components/home/` — one component per homepage section
- `components/layout/` — `SiteHeader` and `SiteFooter`

### Layouts

- `layouts/default.vue` — standard layout with header, footer, atmospheric background
- `layouts/resume.vue` — minimal, print-optimized with back button and print/download toolbar
