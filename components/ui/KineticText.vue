<!-- Character-by-character typewriter reveal with cursor blink -->
<!-- Single text mode: types once then hides cursor.           -->
<!-- Cycling mode (texts prop): type → pause → erase → repeat  -->
<!-- settleOnLast: after all texts shown, stops on the last one -->
<template>
  <span class="kinetic-text" :aria-label="currentText">
    <span
      v-for="(char, i) in displayed"
      :key="i"
      class="char"
      :class="{ space: char === ' ' }"
    >{{ char === ' ' ? '\u00a0' : char }}</span>
    <span v-if="showCursor" class="cursor" aria-hidden="true">|</span>
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  text?: string
  texts?: string[]
  startIndex?: number
  speed?: number
  eraseSpeed?: number
  delay?: number
  pauseTime?: number
  hideCursor?: boolean
  settleOnLast?: boolean
}>(), {
  text: '',
  speed: 72,
  eraseSpeed: 38,
  delay: 500,
  pauseTime: 2200,
  hideCursor: false,
  settleOnLast: false,
})

const emit = defineEmits<{
  settled: []
  textComplete: [text: string]
}>()

const displayed  = ref<string[]>([])
const showCursor = ref(true)
const cycleIndex = ref(props.startIndex ?? 0)
let timerId: ReturnType<typeof setTimeout>

const cycling     = computed(() => !!props.texts?.length)
const currentText = computed(() =>
  cycling.value ? props.texts![cycleIndex.value] : props.text
)

function typeNext(index: number) {
  const target = currentText.value
  if (index >= target.length) {
    if (cycling.value) {
      const isLast = props.settleOnLast && cycleIndex.value === props.texts!.length - 1
      if (isLast) {
        timerId = setTimeout(() => {
          showCursor.value = false
          emit('settled')
        }, 900)
      } else {
        emit('textComplete', target)
        timerId = setTimeout(() => eraseFrom(target.length - 1), props.pauseTime)
      }
    } else {
      if (!props.hideCursor) {
        timerId = setTimeout(() => { showCursor.value = false }, 1400)
      }
    }
    return
  }
  displayed.value.push(target[index])
  timerId = setTimeout(() => typeNext(index + 1), props.speed)
}

function eraseFrom(index: number) {
  if (index < 0) {
    cycleIndex.value = (cycleIndex.value + 1) % props.texts!.length
    timerId = setTimeout(() => typeNext(0), props.speed * 4)
    return
  }
  displayed.value.pop()
  timerId = setTimeout(() => eraseFrom(index - 1), props.eraseSpeed)
}

onMounted(() => {
  timerId = setTimeout(() => typeNext(0), props.delay)
})

onUnmounted(() => clearTimeout(timerId))
</script>

<style scoped>
.kinetic-text { display: inline; }
.char { display: inline; animation: char-in 0.12s ease both; }
.cursor {
  display: inline-block; width: 0.06em; font-weight: 300;
  color: var(--accent); margin-left: 2px;
  animation: blink 0.9s step-end infinite;
}
@keyframes char-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
