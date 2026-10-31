<script setup lang="ts">
import { computed, ref } from 'vue'
import { fmtDay, money } from '../data/mock'
import { useHotel } from '../stores/hotel'
import { askBackend } from '../composables/usePending'

const hotel = useHotel()
const q = ref('')
const filter = ref<'all' | 'inhouse' | 'today' | 'freq'>('all')
const selectedName = ref('Pérez Ruiz, Jorge')
const notes = ref<Record<string, string>>({})

const inHouseNames = computed(() => new Set(hotel.inHouse.map((r) => r.guest)))
const todayNames = computed(() => new Set(hotel.arrivals.filter((r) => r.status !== 'inhouse').map((r) => r.guest)))
const list = computed(() => hotel.guests.filter((g) => {
  const t = q.value.trim().toLowerCase()
  if (t && !g.name.toLowerCase().includes(t) && !g.doc.toLowerCase().includes(t)) return false
  if (filter.value === 'inhouse') return inHouseNames.value.has(g.name)
  if (filter.value === 'today') return todayNames.value.has(g.name)
  if (filter.value === 'freq') return g.stays >= 4
  return true
}))
const selected = computed(() => hotel.guests.find((g) => g.name === selectedName.value))
const stays = computed(() => hotel.reservations.filter((r) => r.guest === selectedName.value && r.status !== 'maintenance'))
</script>

<template>
  <div class="grid gap-4 xl:grid-cols-[1fr_340px]">
    <div class="k-card min-w-0">
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <div class="relative min-w-[220px] flex-1">
          <svg class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" /></svg>
          <input v-model="q" class="k-input !pl-9" placeholder="Buscar por nombre o documento" aria-label="Buscar huésped" />
        </div>
        <button class="k-btn primary" @click="askBackend('Crear huéspedes necesita guardarse en el servidor.')">Nuevo huésped</button>
      </div>
      <div class="k-tabs mb-3">
        <button class="k-tab" :class="{ on: filter === 'all' }" @click="filter = 'all'">Todos</button>
        <button class="k-tab" :class="{ on: filter === 'inhouse' }" @click="filter = 'inhouse'">En casa</button>
        <button class="k-tab" :class="{ on: filter === 'today' }" @click="filter = 'today'">Llegan hoy</button>
        <button class="k-tab" :class="{ on: filter === 'freq' }" @click="filter = 'freq'">Frecuentes</button>
      </div>
      <table class="k-table">
        <thead><tr><th>Huésped</th><th>Documento</th><th>Nacionalidad</th><th>Procedencia</th><th>Estadías</th><th>Última visita</th><th /></tr></thead>
        <tbody>
          <tr v-for="g in list" :key="g.name" class="click" :class="{ sel: selectedName === g.name }" @click="selectedName = g.name">
            <td><b>{{ g.name }}</b></td><td>{{ g.doc }}</td><td>{{ g.nat }}</td><td>{{ g.origin }}</td><td>{{ g.stays }}</td><td>{{ g.last }}</td>
            <td class="r"><span v-if="inHouseNames.has(g.name)" class="k-chip info">En casa</span><span v-else-if="todayNames.has(g.name)" class="k-chip pri">Llega hoy</span></td>
          </tr>
        </tbody>
      </table>
      <p v-if="!list.length" class="k-sub py-8 text-center">No hay huéspedes con ese criterio.</p>
    </div>

    <aside v-if="selected" class="k-card h-fit">
      <h3 class="text-lg">{{ selected.name }}</h3>
      <p class="k-sub">{{ selected.doc }}, {{ selected.nat }}</p>
      <p class="k-sub">Procedencia: {{ selected.origin }}</p>
      <p class="k-sub mt-1">Los datos de documento, nacionalidad y procedencia son de uso interno del hotel.</p>
      <h4 class="mt-4 text-[12px] font-bold uppercase tracking-wider text-fg-muted">Estadías</h4>
      <ul class="mt-2 space-y-2">
        <li v-for="s in stays" :key="s.id" class="rounded-xl border border-line px-3 py-2 text-[13px]">
          <div class="flex justify-between"><b>Hab. {{ s.room }}</b><span class="k-chip" :class="s.status === 'inhouse' ? 'info' : 'pri'">{{ s.status === 'inhouse' ? 'En casa' : 'Reserva' }}</span></div>
          <div class="k-sub">{{ fmtDay(s.start) }} a {{ fmtDay(s.end) }}, {{ money(s.rate) }} por noche</div>
        </li>
        <li v-if="!stays.length" class="k-sub">Sin estadías en el calendario actual.</li>
      </ul>
      <label class="k-label mt-4" for="nota">Nota interna</label>
      <textarea id="nota" v-model="notes[selected.name]" class="k-input" rows="3" placeholder="Preferencias, avisos, observaciones" />
      <div class="mt-4 flex flex-col gap-2">
        <button class="k-btn primary" @click="askBackend('Crear una reserva desde la ficha se guardará en el servidor.')">Nueva reserva</button>
        <button class="k-btn ghost" @click="askBackend('Guardar la ficha se hará en el servidor.')">Guardar ficha</button>
      </div>
    </aside>
  </div>
</template>
