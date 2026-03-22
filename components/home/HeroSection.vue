<template>
  <section class="hero" ref="heroEl">
    <ParticleField />
    <div class="hero-spotlight" aria-hidden="true" />

    <div class="container hero-content">
      <p class="hero-greeting reveal" style="--delay: 0.1s">{{ sectionContent.hero.greeting }}</p>

      <!-- Constellation zone: name in center, chips orbit around it -->
      <div class="constellation-zone" ref="zoneEl">
        <h1 class="hero-name">
          <KineticText
            :texts="orderedIdentities"
            :speed="uiConfig.hero.typeSpeed"
            :erase-speed="uiConfig.hero.eraseSpeed"
            :delay="uiConfig.hero.startDelay"
            :pause-time="uiConfig.hero.pauseTime"
            :settle-on-last="true"
            class="gradient-text"
            @text-complete="onTextComplete"
            @settled="onSettled"
          />
        </h1>

        <!-- Chips orbit around name, placed one by one as identities cycle -->
        <span
          v-for="chip in chips"
          :key="chip.id"
          class="orbit-chip"
          :class="{ 'orbit-chip--placed': chip.placed }"
          :style="{ '--tx': `${chip.x}px`, '--ty': `${chip.y}px` }"
          aria-hidden="true"
        >{{ chip.text }}</span>
      </div>

      <p class="hero-title reveal" style="--delay: 0.5s">
        {{ store.person.title }}
      </p>

      <p v-if="store.person.tagline" class="hero-tagline reveal" style="--delay: 0.7s">
        {{ store.person.tagline }}
      </p>

      <div class="hero-actions reveal" style="--delay: 0.9s">
        <a href="#work" class="btn btn-primary">
          {{ sectionContent.hero.ctaWork }}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>
        <NuxtLink to="/resume" class="btn btn-ghost">{{ sectionContent.hero.ctaResume }}</NuxtLink>
      </div>

      <div v-if="store.hasSocial" class="hero-social reveal" style="--delay: 1.1s">
        <a
          v-for="link in store.socialLinks"
          :key="link.platform"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="social-pill"
          :aria-label="link.label"
        >
          <SocialIcon :platform="link.platform" :size="16" />
          <span>{{ link.label }}</span>
        </a>
      </div>
    </div>

    <a href="#about" class="scroll-indicator" aria-label="Scroll to about section">
      <span class="scroll-mouse"><span class="scroll-wheel" /></span>
      <span class="scroll-text">{{ sectionContent.hero.scrollLabel }}</span>
    </a>

    <div class="orb orb-1" aria-hidden="true" />
    <div class="orb orb-2" aria-hidden="true" />
  </section>
</template>

<script setup lang="ts">
import { identities } from '~/data/identities'
import { uiConfig } from '~/data/uiConfig'
import { sectionContent } from '~/data/sectionContent'

const store = useSiteStore()
const heroEl = ref<HTMLElement | null>(null)
const zoneEl = ref<HTMLElement | null>(null)

// Shuffle all non-name identities, then put name last
const nonNameIdentities = identities.slice(1)
const shuffledQueue = [...nonNameIdentities].sort(() => Math.random() - 0.5)
const orderedIdentities = [...shuffledQueue, identities[0]]

// Pre-compute random orbit positions — distributed around an ellipse
const orbitPositions = computeOrbitPositions(nonNameIdentities.length)

interface Chip {
  id: number
  text: string
  x: number
  y: number
  placed: boolean
}

const chips = ref<Chip[]>([])
const settled = ref(false)
let chipIndex = 0

function computeOrbitPositions(count: number): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = []
  const sectorAngle = (Math.PI * 2) / count
  for (let i = 0; i < count; i++) {
    // Distribute evenly with random jitter, starting from top
    const baseAngle = sectorAngle * i - Math.PI / 2
    const jitter = (Math.random() - 0.5) * sectorAngle * 0.65
    const angle = baseAngle + jitter
    const radius = 145 + Math.random() * 105 // 145–250px from center
    const x = Math.round(Math.cos(angle) * radius * 2.1) // wide ellipse
    const y = Math.round(Math.sin(angle) * radius * 0.8)
    positions.push({ x, y })
  }
  // Shuffle positions so identities don't appear in angular order
  return positions.sort(() => Math.random() - 0.5)
}

function onTextComplete(text: string) {
  if (chipIndex >= orbitPositions.length) return
  const pos = orbitPositions[chipIndex++]
  const chip: Chip = { id: Date.now() + chipIndex, text, x: pos.x, y: pos.y, placed: false }
  chips.value.push(chip)
  // Trigger animation on next frame
  nextTick(() => requestAnimationFrame(() => { chip.placed = true }))
}

function onSettled() {
  settled.value = true
}

const { y: scrollY } = useWindowScroll()

onMounted(() => {
  nextTick(() => {
    document.querySelectorAll('.hero .reveal').forEach((el) => {
      const delay = (el as HTMLElement).style.getPropertyValue('--delay') || '0s'
      ;(el as HTMLElement).style.transitionDelay = delay
      setTimeout(() => el.classList.add('visible'), 50)
    })
  })
})
</script>

<style scoped>
.hero {
  position: relative;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding-top: 80px;
}

:deep(.particle-canvas) { z-index: 0; }

.hero-spotlight {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -55%);
  width: 700px; height: 500px;
  background: radial-gradient(ellipse at center, rgba(94,234,212,0.06) 0%, transparent 70%);
  pointer-events: none;
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--sp-4);
}

.hero-greeting {
  font-family: var(--font-mono);
  font-size: clamp(0.78rem, 1.5vw, 0.9rem);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
  max-width: none;
  opacity: 0;
}
.hero-greeting.visible { opacity: 1; transform: none; }

/* Constellation zone */
.constellation-zone {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Extra padding to give chips room to orbit outside the name */
  padding: 160px 260px;
  margin: -100px -200px; /* collapse the visual gap so layout stays compact */
}

.hero-name {
  font-size: clamp(3rem, 9vw, 7rem);
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1.05;
  margin: 0;
  position: relative;
  z-index: 2;
  pointer-events: none;
}

/* Orbit chips */
.orbit-chip {
  position: absolute;
  top: 50%;
  left: 50%;
  /* Default: collapsed at center, invisible */
  transform: translate(-50%, -50%) scale(0.2);
  opacity: 0;
  transition:
    transform 1s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.5s ease;
  pointer-events: none;
  white-space: nowrap;

  font-family: var(--font-mono);
  font-size: clamp(0.55rem, 1vw, 0.68rem);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-3);
  background: var(--bg-surface);
  border: 1px solid var(--border-xs);
  border-radius: 99px;
  padding: 0.25em 0.75em;
}

/* Placed: fly to orbit position */
.orbit-chip--placed {
  transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1);
  opacity: 0.82;
  color: var(--text-2);
  border-color: var(--border-sm);
}

.orbit-chip--placed:hover {
  opacity: 1;
  border-color: rgba(94,234,212,0.35);
  color: var(--accent);
  background: var(--accent-dim);
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(1rem, 2.5vw, 1.4rem);
  font-weight: 400;
  color: var(--text-2);
  letter-spacing: 0.02em;
  max-width: none;
  opacity: 0;
}
.hero-title.visible { opacity: 1; transform: none; }

.hero-tagline {
  font-size: clamp(0.9rem, 1.8vw, 1.1rem);
  color: var(--text-3);
  max-width: 50ch;
  text-align: center;
  font-style: italic;
  opacity: 0;
}
.hero-tagline.visible { opacity: 1; transform: none; }

.hero-actions {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  flex-wrap: wrap;
  justify-content: center;
  margin-top: var(--sp-2);
  opacity: 0;
}
.hero-actions.visible { opacity: 1; transform: none; }

.hero-social {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  flex-wrap: wrap;
  justify-content: center;
  margin-top: var(--sp-2);
  opacity: 0;
}
.hero-social.visible { opacity: 1; transform: none; }

.social-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 0.35em 0.9em;
  background: var(--bg-surface);
  border: 1px solid var(--border-sm);
  border-radius: 99px;
  font-size: 0.8rem;
  color: var(--text-2);
  transition: all var(--t-base);
  text-decoration: none;
}
.social-pill:hover {
  color: var(--accent);
  border-color: rgba(94,234,212,0.3);
  background: var(--accent-dim);
  opacity: 1;
  transform: translateY(-1px);
}

.scroll-indicator {
  position: absolute;
  bottom: 2.5rem; left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  color: var(--text-3);
  animation: fade-in 1s 2s both;
  z-index: 2;
  text-decoration: none;
}
.scroll-indicator:hover { color: var(--accent); opacity: 1; }
.scroll-mouse {
  width: 22px; height: 34px;
  border: 1.5px solid currentColor;
  border-radius: 11px;
  display: flex;
  justify-content: center;
  padding-top: 5px;
}
.scroll-wheel {
  width: 3px; height: 7px;
  background: currentColor;
  border-radius: 2px;
  animation: float 1.5s ease-in-out infinite;
}
.scroll-text {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  will-change: transform;
}
.orb-1 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(94,234,212,0.06) 0%, transparent 70%);
  top: 10%; left: -10%;
  animation: float 12s ease-in-out infinite;
}
.orb-2 {
  width: 350px; height: 350px;
  background: radial-gradient(circle, rgba(129,140,248,0.06) 0%, transparent 70%);
  bottom: 15%; right: -8%;
  animation: float 9s ease-in-out infinite reverse;
}

@media (max-width: 640px) {
  .hero { padding-top: 70px; }
  .hero-actions { flex-direction: column; width: 100%; }
  .hero-actions .btn { width: 100%; justify-content: center; }
  .constellation-zone { padding: 120px 140px; margin: -80px -100px; }
}
</style>
