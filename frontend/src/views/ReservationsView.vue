<script setup lang="ts">
import { computed, ref } from 'vue'
import { dayName, fmtDay, money, type ResStatus } from '../data/mock'
import { balance, total, useHotel } from '../stores/hotel'
import { askBackend } from '../composables/usePending'

const hotel = useHotel()
const FROM = -2
const DAYS = 14
const status = ref<ResStatus | 'all'>('all')
const selectedId = ref('R-2051')
const LABEL: Record<string, string> = { inhouse: 'En casa', confirmed: 'Confirmada', pending: 'Pendiente', done: 'Finalizada', maintenance: 'Mantenimiento' }
const days = Array.from({ length: DAYS }, (_, i) => FROM + i)

const rooms = computed(() => hotel.rooms.map((r) => r.number))
const bars = (room: string) => hotel.reservations
  .filter((r) => r.room === room && r.end > FROM && r.start < FROM + DAYS && (status.value === 'all' || r.status === status.value))
  .map((r) => {
    const s = Math.max(r.start, FROM)
    const e = Math.min(r.end, FROM + DAYS)
    return { r, left: ((s - FROM) / DAYS) * 100, width: ((e - s) / DAYS) * 100 }
  })
const selected = computed(() => hotel.reservations.find((r) => r.id === selectedId.value && r.status !== 'maintenance'))
</script>

<template>
  <div class="grid gap-4 xl:grid-cols-[1fr_300px]">
    <div class="k-card min-w-0 !p-0">
      <div class="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <button class="k-tab" :class="{ on: status === 'all' }" @click="status = 'all'">Todas</button>
        <button v-for="s in (['inhouse', 'confirmed', 'pending'] as const)" :key="s" class="k-tab" :class="{ on: status === s }" @click="status = s">{{ LABEL[s] }}</button>
        <button class="k-btn primary ml-auto" @click="askBackend('Crear reservas necesita guardarse en el servidor.')">Nueva reserva</button>
      </div>
      <div class="overflow-x-auto">
        <div class="min-w-[760px]">
          <div class="flex border-b border-line">
            <div class="w-14 shrink-0 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-fg-muted">Hab.</div>
            <div class="grid flex-1" :style="{ gridTemplateColumns: `repeat(${DAYS}, 1fr)` }">
              <div v-for="d in days" :key="d" class="py-2 text-center text-[11px] leading-tight" :class="d === 0 ? 'rounded-md bg-primary/15 font-extrabold text-primary' : 'text-fg-muted'">{{ dayName(d) }}<br />{{ fmtDay(d).split(' ')[0] }}</div>
            </div>
          </div>
          <div v-for="n in rooms" :key="n" class="flex border-b border-line/60">
            <div class="w-14 shrink-0 px-3 py-2.5 text-[13px] font-bold">{{ n }}</div>
            <div class="relative h-[38px] flex-1" :style="{ backgroundImage: `repeating-linear-gradient(90deg, transparent 0, transparent calc(100% / ${DAYS} - 1px), rgb(var(--color-line) / .6) calc(100% / ${DAYS} - 1px), rgb(var(--color-line) / .6) calc(100% / ${DAYS}))` }">
              <div class="absolute bottom-0 top-0 w-[2px] bg-primary/60" :style="{ left: `${((0 - FROM + 0.5) / DAYS) * 100}%` }" />
              <button v-for="b in bars(n)" :key="b.r.id" class="tl-bar" :class="[b.r.status, { sel: selectedId === b.r.id }]" :style="{ left: `calc(${b.left}% + 2px)`, width: `calc(${b.width}% - 4px)` }" :disabled="b.r.status === 'maintenance'" :title="b.r.guest" @click="selectedId = b.r.id">{{ b.r.status === 'maintenance' ? 'Mantenimiento' : b.r.guest.split(',')[0] }}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap gap-4 px-4 py-3 text-[12px] text-fg-muted">
        <span v-for="s in (['inhouse', 'confirmed', 'pending', 'maintenance'] as const)" :key="s" class="flex items-center gap-1.5"><i class="tl-bar !static !inline-block !h-3 !w-5 !p-0" :class="s" />{{ LABEL[s] }}</span>
      </div>
    </div>

    <aside class="k-card h-fit">
      <template v-if="selected">
        <div class="flex items-center justify-between"><h3>{{ selected.id }}</h3><span class="k-chip" :class="selected.status === 'inhouse' ? 'info' : selected.status === 'pending' ? 'warn' : 'pri'">{{ LABEL[selected.status] }}</span></div>
        <p class="mt-1 text-[15px] font-bold">{{ selected.guest }}</p>
        <dl class="mt-3 space-y-2 text-[13px]">
          <div class="flex justify-between"><dt class="k-sub">Habitación</dt><dd class="font-semibold">{{ selected.room }}</dd></div>
          <div class="flex justify-between"><dt class="k-sub">Fechas</dt><dd class="font-semibold">{{ fmtDay(selected.start) }} a {{ fmtDay(selected.end) }}</dd></div>
          <div class="flex justify-between"><dt class="k-sub">Noches</dt><dd class="font-semibold">{{ selected.end - selected.start }}</dd></div>
          <div class="flex justify-between"><dt class="k-sub">Tarifa congelada</dt><dd class="font-semibold">{{ money(selected.rate) }}</dd></div>
          <div class="flex justify-between"><dt class="k-sub">Origen</dt><dd class="font-semibold">{{ selected.source }}</dd></div>
          <div class="flex justify-between"><dt class="k-sub">Total</dt><dd class="font-semibold">{{ money(total(selected)) }}</dd></div>
          <div class="flex justify-between"><dt class="k-sub">Saldo</dt><dd><span class="k-chip" :class="balance(selected) > 0 ? 'warn' : 'ok'">{{ money(Math.max(balance(selected), 0)) }}</span></dd></div>
        </dl>
        <p class="k-sub mt-3">Las reservas no se editan. Si algo cambia, se cancela con una penalidad y se crea otra.</p>
        <div class="mt-4 flex flex-col gap-2">
          <button class="k-btn danger" :disabled="selected.status === 'inhouse'" @click="askBackend('Cancelar una reserva con penalidad se guardará en el servidor.')">Cancelar reserva</button>
          <button class="k-btn ghost" @click="askBackend('Imprimir la confirmación estará disponible pronto.')">Enviar confirmación</button>
        </div>
      </template>
      <p v-else class="k-sub py-6 text-center">Elige una reserva en el calendario.</p>
    </aside>
  </div>
</template>
