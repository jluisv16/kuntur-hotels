<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Chart, type ChartConfiguration, registerables } from 'chart.js'
import { useTheme } from '../composables/useTheme'

Chart.register(...registerables)

const props = defineProps<{ build: (c: { fg: string; muted: string; line: string; primary: string; info: string; warning: string; success: string }) => ChartConfiguration }>()
const canvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null
const { isDark } = useTheme()

function colors() {
  const s = getComputedStyle(document.documentElement)
  const v = (n: string): string => `rgb(${s.getPropertyValue(n).trim().split(' ').join(',')})`
  return { fg: v('--color-fg'), muted: v('--color-fg-muted'), line: v('--color-line'), primary: v('--color-primary'), info: v('--color-info'), warning: v('--color-warning'), success: v('--color-success') }
}
function draw(): void {
  chart?.destroy()
  if (!canvas.value) return
  const cfg = props.build(colors())
  cfg.options = { ...(cfg.options ?? {}), responsive: true, maintainAspectRatio: false }
  chart = new Chart(canvas.value, cfg)
}
onMounted(draw)
watch(isDark, () => requestAnimationFrame(draw))
watch(() => props.build, draw)
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <div class="relative h-full w-full"><canvas ref="canvas" /></div>
</template>
