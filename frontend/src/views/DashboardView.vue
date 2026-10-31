<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { ChartConfiguration } from 'chart.js'
import { SERIES, fmtDay, money } from '../data/mock'
import { useHotel, balance } from '../stores/hotel'
import { vPop } from '../directives/pop'
import ChartCanvas from '../components/ChartCanvas.vue'
import KpiCard from '../components/KpiCard.vue'
import UiIcon from '../components/UiIcon.vue'

const hotel = useHotel()
const router = useRouter()

const attention = computed(() => {
  const list: { text: string; sub: string; to: string; tone: string }[] = []
  hotel.departures.forEach((r) => { if (balance(r) > 0) list.push({ text: `Salida con saldo: hab. ${r.room}`, sub: `${r.guest}, debe ${money(balance(r))}`, to: '/recepcion', tone: 'bad' }) })
  hotel.arrivals.filter((r) => r.status !== 'inhouse').forEach((r) => { if (hotel.roomOf(r.room)?.status === 'cleaning') list.push({ text: `Llegada con habitación en limpieza: ${r.room}`, sub: r.guest, to: '/housekeeping', tone: 'warn' }) })
  hotel.rooms.filter((r) => r.status === 'maintenance').forEach((r) => list.push({ text: `Habitación ${r.number} en mantenimiento`, sub: r.note ?? '', to: '/habitaciones', tone: 'info' }))
  hotel.incidents.filter((i) => i.state === 'review').forEach((i) => list.push({ text: `Cargo por aprobar: ${i.item}`, sub: `Hab. ${i.room}, ${money(i.amount)}`, to: '/incidentes', tone: 'warn' }))
  return list
})

const occ14 = SERIES.occ.slice(-14)
const rev7 = SERIES.rev.slice(-7)
const occChart = (c: { primary: string; muted: string; line: string }): ChartConfiguration => ({
  type: 'line',
  data: { labels: occ14.map((_, i) => fmtDay(i - 13)), datasets: [{ data: occ14, borderColor: c.primary, backgroundColor: c.primary.replace('rgb', 'rgba').replace(')', ',.15)'), fill: true, tension: 0.35, pointRadius: 0, borderWidth: 2.5 }] },
  options: { plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100, ticks: { color: c.muted, callback: (v) => `${v}%` }, grid: { color: c.line } }, x: { ticks: { color: c.muted, maxTicksLimit: 7 }, grid: { display: false } } } },
})
const revChart = (c: { info: string; muted: string; line: string }): ChartConfiguration => ({
  type: 'bar',
  data: { labels: rev7.map((_, i) => fmtDay(i - 6)), datasets: [{ data: rev7, backgroundColor: c.info, borderRadius: 6, maxBarThickness: 34 }] },
  options: { plugins: { legend: { display: false } }, scales: { y: { ticks: { color: c.muted }, grid: { color: c.line } }, x: { ticks: { color: c.muted }, grid: { display: false } } } },
})
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard v-pop label="Ocupación hoy" :value="hotel.occupancy + '%'" :sub="`${hotel.countBy('occupied')} de ${hotel.rooms.length} habitaciones`" icon="bed" />
      <KpiCard v-pop label="Cobrado hoy" :value="money(hotel.incomeTotal)" sub="Caja del turno" icon="wallet" tone="success" />
      <KpiCard v-pop label="Llegadas / salidas" :value="`${hotel.arrivals.length} / ${hotel.departures.length}`" sub="Para hoy" icon="login" tone="info" />
      <KpiCard v-pop label="Saldo por cobrar" :value="money(hotel.pendingBalance)" sub="Huéspedes en casa" icon="alert" tone="warning" />
    </div>

    <div class="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <div v-pop class="k-card flex flex-col">
        <div class="mb-2 flex items-center justify-between"><h3>Ocupación, últimos 14 días</h3><span class="k-chip pri">Promedio {{ Math.round(occ14.reduce((a, b) => a + b, 0) / occ14.length) }}%</span></div>
        <div class="min-h-[230px] flex-1"><ChartCanvas :build="occChart" /></div>
      </div>
      <div v-pop class="k-card">
        <h3 class="mb-2">Requiere atención</h3>
        <p v-if="!attention.length" class="k-sub py-6 text-center">Todo en orden por ahora.</p>
        <ul class="space-y-2">
          <li v-for="a in attention" :key="a.text">
            <button class="flex w-full items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-left transition-colors hover:bg-surface-alt" @click="router.push(a.to)">
              <span class="k-chip" :class="a.tone"><UiIcon name="alert" :size="14" /></span>
              <span class="min-w-0 flex-1"><span class="block truncate text-[13px] font-bold">{{ a.text }}</span><span class="k-sub block truncate">{{ a.sub }}</span></span>
              <UiIcon name="down" :size="15" class="-rotate-90 text-fg-muted" />
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div class="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <div v-pop class="k-card">
        <h3 class="mb-2">Ingresos, últimos 7 días</h3>
        <div class="h-[200px]"><ChartCanvas :build="revChart" /></div>
      </div>
      <div v-pop class="k-card">
        <div class="mb-3 flex items-center justify-between"><h3>Estado de habitaciones</h3><button class="k-btn ghost sm" @click="router.push('/habitaciones')">Ver todas</button></div>
        <div class="grid grid-cols-2 gap-3">
          <div v-for="s in ([['free', 'Libres'], ['occupied', 'Ocupadas'], ['cleaning', 'En limpieza'], ['maintenance', 'Mantenimiento']] as const)" :key="s[0]" class="rounded-xl border border-line px-3 py-3">
            <div class="flex items-center gap-2 text-[12px] font-semibold text-fg-muted"><span class="k-dot" :class="s[0]" />{{ s[1] }}</div>
            <div class="mt-1 text-2xl font-extrabold">{{ hotel.countBy(s[0]) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
