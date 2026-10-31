<script setup lang="ts">
import { computed, ref } from 'vue'
import { DAMAGE_CATALOG, money } from '../data/mock'
import { useHotel } from '../stores/hotel'
import { useAuth } from '../stores/auth'
import { askBackend } from '../composables/usePending'
import KpiCard from '../components/KpiCard.vue'
import ModalBox from '../components/ModalBox.vue'

const hotel = useHotel()
const auth = useAuth()
type Tab = 'all' | 'open' | 'review' | 'closed' | 'lost'
const tab = ref<Tab>('all')
const selectedId = ref('INC-0146')
const STATE = { open: ['Abierto', 'info'], review: ['En aprobación', 'warn'], closed: ['Cerrado', 'ok'], rejected: ['Rechazado', 'bad'] } as const
const isAdmin = computed(() => auth.user?.role === 'admin')

const list = computed(() => hotel.incidents.filter((i) => tab.value === 'all' || (tab.value === 'closed' ? i.state === 'closed' || i.state === 'rejected' : i.state === tab.value)))
const selected = computed(() => hotel.incidents.find((i) => i.id === selectedId.value))
const review = computed(() => hotel.incidents.filter((i) => i.state === 'review'))
const chargedMonth = computed(() => hotel.incidents.filter((i) => i.state === 'closed').reduce((a, i) => a + i.amount, 0))
const unclaimed = computed(() => hotel.lost.filter((l) => l.state === 'Sin reclamar').length)

const reporting = ref(false)
const form = ref({ room: '203', item: DAMAGE_CATALOG[0].item, note: '' })
const price = computed(() => DAMAGE_CATALOG.find((d) => d.item === form.value.item)?.price ?? 0)
function submit(): void {
  hotel.reportDamage(form.value.room, form.value.item, auth.user?.name ?? '', form.value.note || 'Sin observaciones.')
  selectedId.value = hotel.incidents[0].id
  tab.value = 'all'
  reporting.value = false
  form.value = { room: '203', item: DAMAGE_CATALOG[0].item, note: '' }
}
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="En aprobación" :value="review.length" sub="Esperando decisión" icon="alert" tone="warning" />
      <KpiCard label="Por aprobar" :value="money(review.reduce((a, i) => a + i.amount, 0))" sub="Monto en revisión" icon="wallet" tone="info" />
      <KpiCard label="Cargado en el mes" :value="money(chargedMonth)" sub="Cargos aprobados" icon="card" tone="success" />
      <KpiCard label="Objetos sin reclamar" :value="unclaimed" sub="Guardados en recepción" icon="box" />
    </div>

    <div class="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <div class="k-card min-w-0">
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <div class="k-tabs">
            <button v-for="t in ([['all', 'Todos'], ['open', 'Abiertos'], ['review', 'En aprobación'], ['closed', 'Cerrados'], ['lost', 'Objetos olvidados']] as const)" :key="t[0]" class="k-tab" :class="{ on: tab === t[0] }" @click="tab = t[0]">{{ t[1] }}</button>
          </div>
          <button class="k-btn primary ml-auto" @click="reporting = true">Reportar daño</button>
        </div>

        <table v-if="tab !== 'lost'" class="k-table">
          <thead><tr><th>Fecha</th><th>Hab.</th><th>Ítem</th><th class="r">Cargo</th><th>Reportó</th><th>Estado</th></tr></thead>
          <tbody>
            <tr v-for="i in list" :key="i.id" class="click" :class="{ sel: selectedId === i.id }" @click="selectedId = i.id">
              <td>{{ i.date }}</td><td>{{ i.room }}</td><td><b>{{ i.item }}</b></td><td class="r">{{ i.amount ? money(i.amount) : '-' }}</td><td>{{ i.by }}</td>
              <td><span class="k-chip" :class="STATE[i.state][1]">{{ STATE[i.state][0] }}</span></td>
            </tr>
          </tbody>
        </table>
        <table v-else class="k-table">
          <thead><tr><th>Código</th><th>Objeto</th><th>Hab.</th><th>Hallado</th><th>Guardado en</th><th>Estado</th></tr></thead>
          <tbody><tr v-for="l in hotel.lost" :key="l.id"><td>{{ l.id }}</td><td><b>{{ l.item }}</b></td><td>{{ l.room }}</td><td>{{ l.found }}</td><td>{{ l.where }}</td><td><span class="k-chip" :class="l.state === 'Entregado' ? 'ok' : 'warn'">{{ l.state }}</span></td></tr></tbody>
        </table>
        <p v-if="tab !== 'lost' && !list.length" class="k-sub py-6 text-center">No hay incidentes en este filtro.</p>
      </div>

      <aside v-if="selected" class="k-card h-fit">
        <div class="flex items-center justify-between"><h3>{{ selected.id }}</h3><span class="k-chip" :class="STATE[selected.state][1]">{{ STATE[selected.state][0] }}</span></div>
        <p class="mt-1 text-[15px] font-bold">{{ selected.item }}</p>
        <p class="k-sub">Habitación {{ selected.room }}, {{ selected.date }}, reportó {{ selected.by }}</p>
        <p class="mt-3 text-[13px]">{{ selected.note }}</p>
        <div class="mt-4 rounded-xl bg-surface-alt p-3 text-[13px]">
          <div class="flex justify-between"><span class="k-sub">Precio del catálogo</span><b>{{ selected.amount ? money(selected.amount) : 'Sin cargo' }}</b></div>
          <div class="flex justify-between"><span class="k-sub">Cargo calculado</span><b>{{ money(selected.amount) }}</b></div>
        </div>
        <div v-if="selected.state === 'review'" class="mt-4 flex flex-col gap-2">
          <button class="k-btn primary" :disabled="!isAdmin" @click="hotel.resolveIncident(selected.id, true)">Aprobar cargo</button>
          <button class="k-btn danger" :disabled="!isAdmin" @click="hotel.resolveIncident(selected.id, false)">Rechazar</button>
          <p v-if="!isAdmin" class="k-sub text-center">Solo administración aprueba cargos.</p>
        </div>
        <div v-if="selected.state === 'closed'" class="mt-4 flex flex-col gap-2">
          <button class="k-btn ghost" @click="askBackend('Cargar el monto a la cuenta o al depósito se guardará en el servidor.')">Cargar a la cuenta</button>
        </div>
      </aside>
    </div>

    <ModalBox v-if="reporting" title="Reportar daño" @close="reporting = false">
      <label class="k-label" for="hab">Habitación</label>
      <select id="hab" v-model="form.room" class="k-input"><option v-for="r in hotel.rooms" :key="r.number" :value="r.number">{{ r.number }}</option></select>
      <label class="k-label mt-3" for="item">Ítem del catálogo</label>
      <select id="item" v-model="form.item" class="k-input"><option v-for="d in DAMAGE_CATALOG" :key="d.item" :value="d.item">{{ d.item }}</option></select>
      <div class="mt-3 flex items-center justify-between rounded-xl bg-surface-alt px-3 py-2.5 text-[13px]"><span class="k-sub">Cargo calculado</span><b>{{ money(price) }}</b></div>
      <label class="k-label mt-3" for="obs">Observación</label>
      <textarea id="obs" v-model="form.note" class="k-input" rows="2" placeholder="Qué pasó" />
      <div class="mt-5 flex justify-end gap-2"><button class="k-btn plain" @click="reporting = false">Cancelar</button><button class="k-btn primary" @click="submit">Enviar a aprobación</button></div>
    </ModalBox>
  </div>
</template>
