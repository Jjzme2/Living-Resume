<template>
  <canvas
    ref="canvasEl"
    class="particle-canvas"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { particleConfig as pc } from '~/data/particleConfig'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  twinkle: number
  twinkleSpeed: number
}

interface Mouse {
  x: number
  y: number
  active: boolean
}

const canvasEl = ref<HTMLCanvasElement | null>(null)
let animId: number
let particles: Particle[] = []
const mouse: Mouse = { x: 0, y: 0, active: false }

// ── Particle Factory ─────────────────────────────────────────────
function createParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * pc.velocitySpread,
    vy: (Math.random() - 0.5) * pc.velocitySpread,
    radius: Math.random() * pc.radiusSpread + pc.radiusMin,
    opacity: Math.random() * pc.opacitySpread + pc.opacityMin,
    twinkle: Math.random() * Math.PI * 2,
    twinkleSpeed: (Math.random() * pc.twinkleSpeedSpread) + pc.twinkleSpeedMin,
  }
}

// ── Init ─────────────────────────────────────────────────────────
function init() {
  const canvas = canvasEl.value
  if (!canvas) return
  const w = canvas.width  = canvas.offsetWidth  * devicePixelRatio
  const h = canvas.height = canvas.offsetHeight * devicePixelRatio
  canvas.style.width  = `${canvas.offsetWidth}px`
  canvas.style.height = `${canvas.offsetHeight}px`
  particles = Array.from({ length: pc.count }, () => createParticle(w, h))
}

// ── Draw ─────────────────────────────────────────────────────────
function draw() {
  const canvas = canvasEl.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height

  ctx.clearRect(0, 0, w, h)

  // Update & draw particles
  for (const p of particles) {
    // Twinkle
    p.twinkle += p.twinkleSpeed
    const alpha = p.opacity + Math.sin(p.twinkle) * pc.twinkleAmplitude

    // Mouse repulsion
    if (mouse.active) {
      const mx = mouse.x * devicePixelRatio
      const my = mouse.y * devicePixelRatio
      const dx = p.x - mx
      const dy = p.y - my
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < pc.mouseRepelRadius * devicePixelRatio) {
        const force = ((pc.mouseRepelRadius * devicePixelRatio) - dist) / (pc.mouseRepelRadius * devicePixelRatio)
        p.vx += (dx / dist) * force * 0.025
        p.vy += (dy / dist) * force * 0.025
      }
    }

    // Dampen
    p.vx *= pc.damping
    p.vy *= pc.damping

    // Clamp velocity
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
    if (speed > pc.maxSpeed) {
      p.vx = (p.vx / speed) * pc.maxSpeed
      p.vy = (p.vy / speed) * pc.maxSpeed
    }

    p.x += p.vx
    p.y += p.vy

    // Wrap edges (softer than bounce)
    if (p.x < -pc.edgeBuffer) p.x = w + pc.edgeBuffer
    if (p.x > w + pc.edgeBuffer) p.x = -pc.edgeBuffer
    if (p.y < -pc.edgeBuffer) p.y = h + pc.edgeBuffer
    if (p.y > h + pc.edgeBuffer) p.y = -pc.edgeBuffer

    // Draw dot
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius * devicePixelRatio, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(94, 234, 212, ${Math.max(0, Math.min(1, alpha))})`
    ctx.fill()
  }

  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const threshold = pc.connectionDist * devicePixelRatio

      if (dist < threshold) {
        const alpha = (1 - dist / threshold) * pc.connectionAlpha
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.strokeStyle = `rgba(94, 234, 212, ${alpha})`
        ctx.lineWidth = pc.connectionLineWidth
        ctx.stroke()
      }
    }
  }

  animId = requestAnimationFrame(draw)
}

// ── Resize ───────────────────────────────────────────────────────
const handleResize = useDebounceFn(() => {
  const canvas = canvasEl.value
  if (!canvas) return
  canvas.width  = canvas.offsetWidth  * devicePixelRatio
  canvas.height = canvas.offsetHeight * devicePixelRatio
  particles = Array.from({ length: pc.count }, () =>
    createParticle(canvas.width, canvas.height)
  )
}, pc.resizeDebounceMs)

// ── Mouse ────────────────────────────────────────────────────────
function onMouseMove(e: MouseEvent) {
  const canvas = canvasEl.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
  mouse.active = true
}

function onMouseLeave() {
  mouse.active = false
}

// ── Lifecycle ────────────────────────────────────────────────────
onMounted(() => {
  init()
  draw()
  window.addEventListener('resize', handleResize)
  canvasEl.value?.parentElement?.addEventListener('mousemove', onMouseMove)
  canvasEl.value?.parentElement?.addEventListener('mouseleave', onMouseLeave)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  window.removeEventListener('resize', handleResize)
  canvasEl.value?.parentElement?.removeEventListener('mousemove', onMouseMove)
  canvasEl.value?.parentElement?.removeEventListener('mouseleave', onMouseLeave)
})
</script>

<style scoped>
.particle-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
