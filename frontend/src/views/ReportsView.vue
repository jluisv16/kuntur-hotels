<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChartConfiguration } from 'chart.js'
import { NIGHTS_SOLD, PAY_SPLIT, SERIES, SOURCE_SPLIT, ROOM_TYPES, fmtDay, money } from '../data/mock'
import { useHotel } from '../stores/hotel'
import { askBackend } from '../composables/usePending'
import ChartCanvas from '../components/ChartCanvas.vue'
import KpiCard from '../components/KpiCard.vue'

const hotel = useHotel()
type Tab = 'rev' | 'occ' | 'inc' | 'proj'
const tab = ref<Tab>('rev')
const range = ref(30)

const revTotal = SERIES.rev.reduce((a, b) => a + b, 0)
const occAvg = Math.round(SERIES.occ.reduce((a, b) => a + b, 0) / SERIES.occ.length)
const rev = computed(() => SERIES.rev.slice(-range.value))
const occ = computed(() => SERIES.occ.slice(-range.value))
const labels = computed(() => rev.value.map((_, i) => fmtDay(i - range.value + 1)))
const avgDaily = computed(() => Math.round(rev.value.reduce((a, b) => a + b, 0) / rev.value.length))

type Colors = { primary: string; info: string; warning: string; success: string; muted: string; line: string }
const revChart = (c: Colors): ChartConfiguration => ({
  type: 'bar',
  data: { labels: labels.value, datasets: [{ data: rev.value, backgroundColor: c.primary, borderRadius: 4 }] },
  options: { plugins: { legend: { display: false } }, scales: { y: { ticks: { color: c.muted }, grid: { color: c.line } }, x: { ticks: { color: c.muted, maxTicksLimit: 10 }, grid: { display: false } } } },
})
const occChart = (c: Colors): ChartConfiguration => ({
  type: 'line',
  data: { labels: labels.value, datasets: [{ data: occ.value, borderColor: c.info, tension: 0.35, pointRadius: 0, borderWidth: 2.5 }] },
  options: { plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100, ticks: { color: c.muted, callback: (v) => `${v}%` }, grid: { color: c.line } }, x: { ticks: { color: c.muted, maxTicksLimit: 10 }, grid: { display: false } } } },
})
const donut = (c: Colors): ChartConfiguration => ({
  type: 'doughnut',
  data: { labels: PAY_SPLIT.map((p) => p[0]), datasets: [{ data: PAY_SPLIT.map((p) => p[1]), backgroundColor: [c.primary, c.info, c.warning, c.success], borderWidth: 0 }] },
  options: { cutout: '66%', plugins: { legend: { position: 'right', labels: { color: c.muted, boxWidth: 10 } } } },
} as unknown as ChartConfiguration)
const sourceChart = (c: Colors): ChartConfiguration => ({
  type: 'bar',
  data: { labels: SOURCE_SPLIT.map((s) => s[0]), datasets: [{ data: SOURCE_SPLIT.map((s) => s[1]), backgroundColor: c.info, borderRadius: 6, maxBarThickness: 22 }] },
  options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { ticks: { color: c.muted }, grid: { color: c.line } }, y: { ticks: { color: c.muted }, grid: { display: false } } } },
})

// Proyección: habitaciones reservadas por día con las reservas confirmadas y pendientes.
const projDays = Array.from({ length: 14 }, (_, i) => i)
const proj = computed(() => projDays.map((d) => hotel.real.filter((r) => r.start <= d && r.end > d && r.status !== 'done').length))
const projChart = (c: Colors): ChartConfiguration => ({
  type: 'bar',
  data: { labels: projDays.map((d) => fmtDay(d)), datasets: [{ data: proj.value.map((n) => Math.round((n / hotel.rooms.length) * 100)), backgroundColor: c.primary, borderRadius: 5 }] },
  options: { plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100, ticks: { color: c.muted, callback: (v) => `${v}%` }, grid: { color: c.line } }, x: { ticks: { color: c.muted }, grid: { display: false } } } },
})
const byType = computed(() => ROOM_TYPES.map((t) => {
  const n = hotel.rooms.filter((r) => r.type === t.name)
  const occupied = n.filter((r) => r.status === 'occupied').length
  return { name: t.name, pct: Math.round((occupied / n.length) * 100), text: `${occupied} de ${n.length}` }
}))
const damages = computed(() => hotel.incidents.filter((i) => i.amount > 0))
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <div class="k-tabs">
        <button v-for="t in ([['rev', 'Ingresos'], ['occ', 'Ocupación'], ['inc', 'Incidencias'], ['proj', 'Proyección']] as const)" :key="t[0]" class="k-tab" :class="{ on: tab === t[0] }" @click="tab = t[0]">{{ t[1] }}</button>
      </div>
      <div v-if="tab === 'rev' || tab === 'occ'" class="k-tabs ml-2">
        <button v-for="r in [7, 14, 30]" :key="r" class="k-tab" :class="{ on: range === r }" @click="range = r">{{ r }} días</button>
      </div>
      <button class="k-btn ghost ml-auto" @click="askBackend('Exportar a Excel se generará en el servidor.')"><span>Exportar a Excel</span></button>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="Ingresos de octubre" :value="money(revTotal)" sub="Mes en curso" icon="wallet" />
      <KpiCard label="Ocupación promedio" :value="occAvg + '%'" sub="Octubre" icon="bed" tone="info" />
      <KpiCard label="Noches vendidas" :value="NIGHTS_SOLD" sub="Octubre" icon="calendar" tone="success" />
      <KpiCard label="Tarifa promedio" :value="money(Math.round(revTotal / NIGHTS_SOLD))" sub="Por noche" icon="trend" tone="warning" />
    </div>

    <template v-if="tab === 'rev'">
      <div class="k-card">
        <div class="mb-2 flex items-center justify-between"><h3>Ingresos por día</h3><span class="k-chip pri">Promedio {{ money(avgDaily) }} al día</span></div>
        <div class="h-[260px]"><ChartCanvas :key="range" :build="revChart" /></div>
      </div>
      <div class="grid gap-4 lg:grid-cols-2">
        <div class="k-card"><h3 class="mb-2">Por medio de pago</h3><div class="h-[220px]"><ChartCanvas :build="donut" /></div></div>
        <div class="k-card"><h3 class="mb-2">Por origen de reserva</h3><div class="h-[220px]"><ChartCanvas :build="sourceChart" /></div></div>
      </div>
    </template>

    <template v-else-if="tab === 'occ'">
      <div class="k-card"><h3 class="mb-2">Ocupación por día</h3><div class="h-[260px]"><ChartCanvas :key="range" :build="occChart" /></div></div>
      <div class="k-card">
        <h3 class="mb-3">Ocupación hoy por tipo de habitación</h3>
        <div v-for="t in byType" :key="t.name" class="mb-3 last:mb-0">
          <div class="mb-1 flex justify-between text-[13px]"><b>{{ t.name }}</b><span class="k-sub">{{ t.text }}, {{ t.pct }}%</span></div>
          <div class="h-2.5 overflow-hidden rounded-full bg-surface-alt"><div class="h-full rounded-full bg-primary transition-all" :style="{ width: t.pct + '%' }" /></div>
        </div>
      </div>
    </template>

    <template v-else-if="tab === 'inc'">
      <div class="k-card">
        <h3 class="mb-2">Incidencias con cargo</h3>
        <table class="k-table">
          <thead><tr><th>Fecha</th><th>Hab.</th><th>Ítem</th><th>Estado</th><th class="r">Cargo</th></tr></thead>
          <tbody><tr v-for="i in damages" :key="i.id"><td>{{ i.date }}</td><td>{{ i.room }}</td><td><b>{{ i.item }}</b></td><td><span class="k-chip" :class="i.state === 'closed' ? 'ok' : i.state === 'review' ? 'warn' : 'bad'">{{ i.state === 'closed' ? 'Cobrado' : i.state === 'review' ? 'En aprobación' : 'Rechazado' }}</span></td><td class="r">{{ money(i.amount) }}</td></tr></tbody>
        </table>
      </div>
    </template>

    <template v-else>
      <div class="k-card">
        <h3 class="mb-1">Ocupación proyectada, próximos 14 días</h3>
        <p class="k-sub mb-2">Con las reservas confirmadas y pendientes de hoy.</p>
        <div class="h-[260px]"><ChartCanvas :build="projChart" /></div>
      </div>
    </template>
  </div>
</template>
