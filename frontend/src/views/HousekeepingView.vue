<script setup lang="ts">
import { computed, ref } from 'vue'
import { HK_CHECKS } from '../data/mock'
import { useHotel } from '../stores/hotel'
import { askBackend } from '../composables/usePending'
import KpiCard from '../components/KpiCard.vue'

const hotel = useHotel()
const filter = ref<'all' | 'pending' | 'doing' | 'done'>('all')
const selectedId = ref('T-1')
const LABEL = { pending: 'Pendiente', doing: 'En proceso', done: 'Completada' }
const CHIP = { pending: 'warn', doing: 'info', done: 'ok' }

const list = computed(() => hotel.tasks.filter((t) => filter.value === 'all' || t.state === filter.value))
const selected = computed(() => hotel.tasks.find((t) => t.id === selectedId.value))
const count = (s: 'pending' | 'doing' | 'done'): number => hotel.tasks.filter((t) => t.state === s).length
const ready = computed(() => !!selected.value && selected.value.checks.every(Boolean))
const toLeave = computed(() => hotel.departures.length)
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="Pendientes" :value="count('pending')" sub="Por empezar" icon="sparkles" tone="warning" />
      <KpiCard label="En proceso" :value="count('doing')" sub="Limpiando ahora" icon="clock" tone="info" />
      <KpiCard label="Completadas hoy" :value="count('done')" sub="Listas para recibir" icon="check" tone="success" />
      <KpiCard label="Salidas por limpiar" :value="toLeave" sub="Aún con huésped" icon="logout" />
    </div>

    <p v-if="hotel.lastReady" class="rounded-xl px-4 py-2.5 text-[13px] font-semibold" style="background: rgb(var(--color-success) / .14); color: rgb(var(--color-success))" role="status">Habitación {{ hotel.lastReady }} lista. Recepción ya puede asignarla.</p>

    <div class="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
      <div class="k-card min-w-0">
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <div class="k-tabs">
            <button class="k-tab" :class="{ on: filter === 'all' }" @click="filter = 'all'">Todas ({{ hotel.tasks.length }})</button>
            <button class="k-tab" :class="{ on: filter === 'pending' }" @click="filter = 'pending'">Pendientes</button>
            <button class="k-tab" :class="{ on: filter === 'doing' }" @click="filter = 'doing'">En proceso</button>
            <button class="k-tab" :class="{ on: filter === 'done' }" @click="filter = 'done'">Completadas</button>
          </div>
          <button class="k-btn ghost sm ml-auto" @click="askBackend('Registrar objetos olvidados se guardará en el servidor.')">Objeto olvidado</button>
        </div>
        <table class="k-table">
          <thead><tr><th>Hab.</th><th>Tarea</th><th>Asignada a</th><th>Hora</th><th>Estado</th><th /></tr></thead>
          <tbody>
            <tr v-for="t in list" :key="t.id" class="click" :class="{ sel: selectedId === t.id }" @click="selectedId = t.id">
              <td><b>{{ t.room }}</b></td><td>{{ t.kind }}</td><td>{{ t.staff }}</td><td>{{ t.time || '-' }}</td>
              <td><span class="k-chip" :class="CHIP[t.state]">{{ LABEL[t.state] }}</span></td>
              <td class="r"><button v-if="t.state === 'pending'" class="k-btn primary sm" @click.stop="hotel.startTask(t.id); selectedId = t.id">Iniciar</button></td>
            </tr>
          </tbody>
        </table>
        <p v-if="!list.length" class="k-sub py-6 text-center">No hay tareas en este filtro.</p>
      </div>

      <aside v-if="selected" class="k-card h-fit">
        <div class="flex items-center justify-between"><h3 class="text-lg">Habitación {{ selected.room }}</h3><span class="k-chip" :class="CHIP[selected.state]">{{ LABEL[selected.state] }}</span></div>
        <p class="k-sub">{{ selected.kind }}, asignada a {{ selected.staff }}</p>
        <h4 class="mt-4 text-[12px] font-bold uppercase tracking-wider text-fg-muted">Lista de revisión</h4>
        <ul class="mt-2 space-y-1.5">
          <li v-for="(c, i) in HK_CHECKS" :key="c">
            <label class="flex items-center gap-3 rounded-lg px-2 py-2 text-[13.5px]" :class="selected.state === 'doing' ? 'cursor-pointer hover:bg-surface-alt' : 'opacity-70'">
              <input v-model="selected.checks[i]" type="checkbox" class="h-4 w-4 accent-[rgb(var(--color-primary))]" :disabled="selected.state !== 'doing'" />{{ c }}
            </label>
          </li>
        </ul>
        <div class="mt-4 flex flex-col gap-2">
          <button v-if="selected.state === 'pending'" class="k-btn primary" @click="hotel.startTask(selected.id)">Iniciar limpieza</button>
          <button v-else-if="selected.state === 'doing'" class="k-btn primary" :disabled="!ready" @click="hotel.finishTask(selected.id)">Marcar habitación lista</button>
          <p v-if="selected.state === 'doing' && !ready" class="k-sub text-center">Completa la lista para terminar.</p>
          <button class="k-btn ghost" @click="askBackend('Asignar personal se guardará en el servidor.')">Asignar a otra persona</button>
          <button class="k-btn plain" @click="askBackend('Reportar un daño desde la tarea se conecta en Incidentes.')">Reportar incidente</button>
        </div>
      </aside>
    </div>
  </div>
</template>
