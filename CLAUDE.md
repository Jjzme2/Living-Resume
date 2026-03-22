# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build (SSR, Vercel preset)
npm run generate   # Static site generation
npm run preview    # Preview production build locally
npm run postinstall  # Nuxt prepare (auto-runs after install)
npm run generate:32-char-string  # Generate secure random strings
```

There is no lint or test runner configured.

## Architecture

**Nuxt 3 + Vue 3 + TypeScript + Pinia.** Deployed to Vercel as an SSR app.

### Data Flow

```
config/site.ts  →  stores/site.ts (Pinia)  →  components & pages
                         ↑
              /api/site-data (server refresh)
```

`config/site.ts` is the sole source of truth for all personal/professional data. The Pinia store (`useSiteStore()`) loads this config and exposes computed getters. **Components never import from `config/site.ts` directly — always through the store.**

The store provides:
- Presence checks: `hasSkills`, `hasExperience`, `hasEducation`, `hasProjects`, `hasFeatured`, `hasBio`, `hasContact`, `hasSocial`, `hasBusiness`, `hasServices`
- Derived getters: `skillsByCategory`, `featuredProjects`, `currentRole`, `socialLinks` (full URLs with labels)
- `refresh()` action: fetches from `/api/site-data` to patch live state

Section visibility (Projects, Blog, Contact, etc.) is toggled via `siteSettings` flags in `config/site.ts`, which the store and `SiteHeader.vue` respect.

### config/site.ts — Data Schema

Key interfaces and exported objects:

| Export | Description |
|---|---|
| `person` | name, fullName, initials, title, tagline, location, email, phone, bio, avatarUrl, resumePdfUrl |
| `business` | name, tagline, description, url, services[] |
| `social` | github, linkedin, twitter, instagram, youtube (usernames only) |
| `skills` | `{name, category, level: 1–100}[]` |
| `experience` | `{company, role, dates, location, type, highlights[]}[]` |
| `education` | `{institution, degree, field, year, honors}[]` |
| `projects` | `{title, description, tags[], url, repo, featured, image}[]` |
| `siteSettings` | section toggle booleans (incl. `showInterview`), siteUrl, copyrightYear, theme |

### Routing

File-based Nuxt routing:
- `/` — Home (assembles all section components from `components/home/`)
- `/resume` — Print-optimized resume (uses `layouts/resume.vue`, renders `ResumeDoc.vue`)
- `/blog` — Blog index (queries `content/blog/**/*.md` via `@nuxt/content`)
- `/blog/[...slug]` — Individual blog post (catch-all slug)
- `/projects` — Full projects listing with filtering
- `/admin/*` — Admin dashboard (protected by `middleware/admin.ts`)

### Blog Content

Markdown files in `content/blog/` are queried with `queryContent()` from `@nuxt/content`. Organize by subdirectory (e.g. `content/blog/tech/`). Add `.md` files with frontmatter:

```md
---
title: "Post Title"
date: 2026-01-01
tags: [Nuxt 3, TypeScript]
author: Your Name
status: published
---
```

### Admin Dashboard

Protected admin area at `/admin/*` with JWT-based authentication. Features:
- Content management: blog editor, projects, skills, experience, education
- Profile and resume settings
- Analytics and message viewing
- Middleware: `middleware/admin.ts` guards all `/admin` routes
- Runtime config: `adminPassword`, `jwtSecret`, Firebase credentials (set in environment)

### Server API Routes

All located in `server/api/`:

| Route | Method | Purpose |
|---|---|---|
| `/api/site-data` | GET | Serve config/site data to store |
| `/api/chat` | POST | AI interview chat (Claude Haiku, uses site data as context) |
| `/api/contact` | POST | Contact form submission (via Resend) |
| `/api/theme` | GET | Get current public theme |
| `/api/analytics/track` | POST | Page view tracking |
| `/api/auth/*` | POST | Admin authentication (JWT) |
| `/api/admin/*` | * | Admin CRUD operations |
| `/api/cron/daily-digest` | GET | Cron job (runs daily at 4 AM via Vercel) |

**`/api/chat`** accepts `{ messages: [{role, content}][] }`. It fetches live site data via `getSiteData()`, builds a system prompt from person/experience/skills/projects/education/business, and calls Claude Haiku. Caps history at 20 turns and individual messages at 2000 chars. Requires `ANTHROPIC_API_KEY`.

### Animation System

- **Scroll reveal:** `composables/useScrollReveal.ts` — IntersectionObserver (threshold `0.08`, margin `-60px`) that adds `.visible` to elements with `.reveal`, `.reveal-left`, `.reveal-right`, or `.stagger` classes. Animations play once, then unobserve.
- **Kinetic typography:** `components/ui/KineticText.vue` — typewriter character-by-character reveal with cycling support. Props: `:text` (string | string[]), `:speed` (ms/char, default 80), `:delay` (ms before start, default 300). Supports cursor blink and pause between cycles.
- **Particle field:** `components/canvas/ParticleField.vue` — canvas-based hero background. Config in `data/particleConfig.ts` (80 particles, mouse repulsion, connecting lines, twinkle).
- **Stagger timing:** CSS `--delay` custom property on `.stagger` children sets `transitionDelay` at mount.
- **KineticText identities:** Cycling values defined in `data/identities.ts` (17 items). Hero typewriter: 80ms/char, 35ms erase, 2200ms pause between cycles.

### Design Tokens

All design tokens live in `assets/css/main.css`. Print styles in `assets/css/print.css`. Theme variants in `assets/css/themes.css`. No CSS preprocessor — plain CSS custom properties.

**Key tokens:**
```css
--accent: #5eead4       /* teal */
--accent2: #818cf8      /* indigo */
--bg-base: #04060f
--text-1/2/3            /* layered text hierarchy */
--sp-1 to --sp-24       /* spacing scale (0.25rem to 6rem) */
--r-sm to --r-xl        /* border radii (6px to 28px) */
--t-fast/base/slow/xslow /* transition durations */
```

**Fonts:** Space Grotesk (display/headings), Inter (body), JetBrains Mono (mono/code).

**Utility classes:**
- `.container` — max-width (1160px) + centered padding
- `.glass` / `.glass-hover` — glassmorphism with backdrop-filter blur
- `.gradient-text` — animated gradient background-clip text
- `.chip` / `.chip-indigo` — tag/badge styling
- `.section-label` — uppercase label with accent line
- `.btn` / `.btn-primary` / `.btn-ghost` — button variants
- `.reveal`, `.reveal-left`, `.reveal-right`, `.stagger` — scroll animation triggers

### Theme System

8 themes defined in `assets/css/themes.css` via `[data-theme="<name>"]` attribute on `<html>`:

| Theme | Description |
|---|---|
| `midnight` | Default dark, teal accent (main.css base tokens) |
| `glass` | Frosted dark, enhanced blur |
| `aero` | Windows Aero-inspired, blue-tinted glass |
| `noir` | Pure black, amber-gold accent |
| `slate` | Blue-gray, indigo-violet accent |
| `dawn` | Light mode, airy off-white, sky blue accent |
| `dreamer` | Cosmic violet, lavender glow |
| `yin-yang` | Pure black + white, no color |

Theme management via `composables/useTheme.ts` — `applyTheme()`, `loadPublicTheme()`, `setPublicTheme()`. Default theme set in `siteSettings.theme` in `config/site.ts`.

### Component Conventions

- Components are auto-imported (no explicit imports needed). Registration uses `pathPrefix: false` so only the filename matters, not the directory.
- `components/ui/` — reusable primitives: `GlassCard`, `SectionHeading`, `KineticText`, `SocialIcon`
- `components/home/` — one component per homepage section (HeroSection, AboutSection, InterviewSection, SkillsSection, ExperienceSection, ProjectsSection, BlogPreview, ContactSection, QuotesSection)
- `components/layout/` — `SiteHeader` and `SiteFooter`
- `components/resume/` — `ResumeDoc` (print-optimized resume renderer)
- `components/canvas/` — `ParticleField` (canvas background)

### Static Copy / Content Strings

All user-facing UI copy lives in `data/sectionContent.ts` (section labels, titles, button text, empty states, descriptions). Import from there when adding new sections — don't hardcode strings in components.

### Layouts

- `layouts/default.vue` — standard layout with header, footer, atmospheric background, theme loading, analytics tracking
- `layouts/resume.vue` — minimal, print-optimized with sticky toolbar (back button, print/download). Hides header/footer in print.
- `layouts/admin.vue` — admin dashboard shell layout

### Key Dependencies

| Package | Purpose |
|---|---|
| `nuxt` ^3.15 | Full-stack Vue framework |
| `@pinia/nuxt` | State management |
| `@nuxt/content` ^2.13 | Markdown content queries |
| `@vueuse/core` ^11.3 | Vue composition utilities |
| `@anthropic-ai/sdk` | Anthropic AI integration |
| `firebase-admin` ^13.7 | Firebase backend |
| `resend` | Email delivery (contact form) |
| `jose` | JWT handling (admin auth) |

### Environment / Runtime Config

Set these in `.env` for local dev (Nuxt auto-loads):
```
NUXT_ADMIN_PASSWORD=...
NUXT_JWT_SECRET=...
NUXT_FIREBASE_*=...
```
Runtime config keys are defined in `nuxt.config.ts` under `runtimeConfig`. The `adminPassword` and `jwtSecret` are server-only (not exposed to client).

### Deployment

- Platform: Vercel (SSR via Nitro `vercel` preset)
- Build output: `.output/public`
- Cron: daily digest at `0 4 * * *` (configured in `vercel.json`)
- TypeScript: strict mode, extends Nuxt-generated `.nuxt/tsconfig.json`
