<script setup lang="ts">
import { computed, ref } from 'vue'
import { fmtDay, money, ROOM_TYPES, type RoomStatus } from '../data/mock'
import { useHotel } from '../stores/hotel'
import { useAuth } from '../stores/auth'
import { askBackend } from '../composables/usePending'

const hotel = useHotel()
const auth = useAuth()
const filter = ref<RoomStatus | 'all'>('all')
const selected = ref('101')
const LABEL: Record<RoomStatus, string> = { free: 'Libre', occupied: 'Ocupada', cleaning: 'En limpieza', maintenance: 'Mantenimiento' }
const CHIP: Record<RoomStatus, string> = { free: 'ok', occupied: 'info', cleaning: 'warn', maintenance: 'bad' }
const canEdit = computed(() => auth.user?.role === 'admin')

const floors = computed(() => [1, 2, 3].map((f) => ({ floor: f, rooms: hotel.rooms.filter((r) => r.floor === f) })))
const room = computed(() => hotel.roomOf(selected.value))
const occupant = computed(() => hotel.occupantOf(selected.value))
const arrival = computed(() => hotel.nextArrival(selected.value))
const rate = (type: string): number => ROOM_TYPES.find((t) => t.name === type)?.rate ?? 0
const shown = (s: RoomStatus): boolean => filter.value === 'all' || filter.value === s
</script>

<template>
  <div class="grid gap-4 xl:grid-cols-[1fr_320px]">
    <div class="space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <button class="k-tab" :class="{ on: filter === 'all' }" @click="filter = 'all'">Todas ({{ hotel.rooms.length }})</button>
        <button v-for="s in (['free', 'occupied', 'cleaning', 'maintenance'] as const)" :key="s" class="k-tab flex items-center gap-2" :class="{ on: filter === s }" @click="filter = s"><span class="k-dot" :class="s" />{{ LABEL[s] }} ({{ hotel.countBy(s) }})</button>
        <button class="k-btn primary ml-auto" :disabled="!canEdit" @click="askBackend('Crear habitaciones necesita guardarse en el servidor.')">Nueva habitación</button>
      </div>

      <div v-for="f in floors" :key="f.floor" class="k-card">
        <h3 class="mb-3">Piso {{ f.floor }}</h3>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <template v-for="r in f.rooms" :key="r.number">
            <button v-if="shown(r.status)" class="k-room" :class="[r.status, { sel: selected === r.number }]" @click="selected = r.number">
              <div class="flex items-center justify-between"><b class="text-[17px]">{{ r.number }}</b><span class="k-dot" :class="r.status" /></div>
              <div class="k-sub mt-0.5">{{ r.type }}</div>
              <div class="mt-1.5 truncate text-[11.5px] font-semibold">
                <template v-if="r.status === 'occupied'">{{ hotel.occupantOf(r.number)?.guest.split(',')[0] }}</template>
                <template v-else-if="hotel.nextArrival(r.number) && r.status !== 'maintenance'">Llega {{ fmtDay(hotel.nextArrival(r.number)!.start) }}</template>
                <template v-else>{{ LABEL[r.status] }}</template>
              </div>
            </button>
          </template>
        </div>
      </div>

      <div class="k-card">
        <div class="mb-2 flex items-center justify-between"><h3>Tipos de habitación y tarifas</h3><button class="k-btn ghost sm" :disabled="!canEdit" @click="askBackend('Editar tarifas se guardará en el servidor.')">Editar tarifas</button></div>
        <table class="k-table">
          <thead><tr><th>Tipo</th><th>Cantidad</th><th>Capacidad</th><th class="r">Tarifa base</th></tr></thead>
          <tbody><tr v-for="t in ROOM_TYPES" :key="t.id"><td><b>{{ t.name }}</b></td><td>{{ hotel.rooms.filter((r) => r.type === t.name).length }}</td><td>{{ t.capacity }} personas</td><td class="r">{{ money(t.rate) }}</td></tr></tbody>
        </table>
      </div>
    </div>

    <aside v-if="room" class="k-card h-fit xl:sticky xl:top-0">
      <div class="flex items-center justify-between"><h3 class="text-lg">Habitación {{ room.number }}</h3><span class="k-chip" :class="CHIP[room.status]">{{ LABEL[room.status] }}</span></div>
      <dl class="mt-3 space-y-2 text-[13px]">
        <div class="flex justify-between"><dt class="k-sub">Tipo</dt><dd class="font-semibold">{{ room.type }}</dd></div>
        <div class="flex justify-between"><dt class="k-sub">Tarifa base</dt><dd class="font-semibold">{{ money(rate(room.type)) }}</dd></div>
        <div class="flex justify-between"><dt class="k-sub">Piso</dt><dd class="font-semibold">{{ room.floor }}</dd></div>
      </dl>
      <div v-if="occupant" class="mt-4 rounded-xl bg-surface-alt p-3 text-[13px]"><div class="k-sub">Huésped actual</div><b>{{ occupant.guest }}</b><div class="k-sub">{{ fmtDay(occupant.start) }} a {{ fmtDay(occupant.end) }}, {{ occupant.people }} personas</div></div>
      <div v-if="arrival" class="mt-3 rounded-xl bg-surface-alt p-3 text-[13px]"><div class="k-sub">Próxima llegada</div><b>{{ arrival.guest }}</b><div class="k-sub">{{ fmtDay(arrival.start) }} a {{ fmtDay(arrival.end) }}</div></div>
      <div v-if="room.note" class="mt-3 rounded-xl p-3 text-[13px]" style="background: rgb(var(--color-danger) / .1)"><div class="k-sub">Motivo</div>{{ room.note }}</div>
      <div class="mt-4 flex flex-col gap-2">
        <button v-if="room.status === 'maintenance'" class="k-btn primary" :disabled="!canEdit" @click="hotel.toggleMaintenance(room.number)">Devolver a servicio</button>
        <button v-else class="k-btn plain" :disabled="room.status === 'occupied' || !canEdit" :title="room.status === 'occupied' ? 'No se puede con un huésped en la habitación' : ''" @click="hotel.toggleMaintenance(room.number)">Marcar en mantenimiento</button>
        <button class="k-btn ghost" :disabled="!canEdit" @click="askBackend('Editar la habitación se guardará en el servidor.')">Editar habitación</button>
        <p v-if="!canEdit" class="k-sub text-center">Solo administración puede cambiar habitaciones.</p>
      </div>
    </aside>
  </div>
</template>
