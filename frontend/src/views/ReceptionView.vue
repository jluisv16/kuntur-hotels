<script setup lang="ts">
import { computed, ref } from 'vue'
import { fmtDay, money, PAY_METHODS, type Reservation } from '../data/mock'
import { balance, total, useHotel } from '../stores/hotel'
import { useAuth } from '../stores/auth'
import { askBackend } from '../composables/usePending'
import KpiCard from '../components/KpiCard.vue'
import ModalBox from '../components/ModalBox.vue'

const hotel = useHotel()
const auth = useAuth()
const tab = ref<'arrivals' | 'departures'>('arrivals')
const msg = ref<{ ok: boolean; text: string } | null>(null)
const charging = ref<Reservation | null>(null)
const account = ref<Reservation | null>(null)
const amount = ref(0)
const method = ref(PAY_METHODS[0])

const arrivals = computed(() => hotel.arrivals)
const departures = computed(() => hotel.real.filter((r) => r.end === 0 && (r.status === 'inhouse' || r.status === 'done')))

function say(ok: boolean, text: string): void {
  msg.value = { ok, text }
  window.setTimeout(() => { msg.value = null }, 4500)
}
function doCheckIn(r: Reservation): void {
  const err = hotel.checkIn(r.id)
  err ? say(false, err) : say(true, `Check-in listo: ${r.guest} en la habitación ${r.room}.`)
}
function doCheckOut(r: Reservation): void {
  const err = hotel.checkOut(r.id)
  err ? say(false, err) : say(true, `Check-out listo. La habitación ${r.room} pasó a limpieza.`)
}
function openCharge(r: Reservation): void {
  charging.value = r
  amount.value = balance(r)
  method.value = PAY_METHODS[0]
}
function confirmCharge(): void {
  const r = charging.value
  if (!r || amount.value <= 0 || amount.value > balance(r)) return
  hotel.pay(r.id, amount.value, method.value, auth.user?.name ?? '')
  say(true, `Cobro de ${money(amount.value)} registrado en caja (${method.value}).`)
  charging.value = null
}
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="Huéspedes en casa" :value="hotel.peopleInHouse" :sub="`${hotel.inHouse.length} habitaciones`" icon="users" />
      <KpiCard label="Llegadas hoy" :value="arrivals.length" :sub="`${arrivals.filter((a) => a.status === 'inhouse').length} ya ingresaron`" icon="login" tone="info" />
      <KpiCard label="Salidas hoy" :value="departures.length" :sub="`${departures.filter((d) => d.status === 'done').length} completadas`" icon="logout" tone="warning" />
      <KpiCard label="Caja del turno" :value="money(hotel.incomeTotal)" sub="Cobrado hoy" icon="wallet" tone="success" />
    </div>

    <p v-if="msg" class="rounded-xl px-4 py-2.5 text-[13px] font-semibold" :style="msg.ok ? 'background: rgb(var(--color-success) / .14); color: rgb(var(--color-success))' : 'background: rgb(var(--color-danger) / .12); color: rgb(var(--color-danger))'" role="status">{{ msg.text }}</p>

    <div class="k-card">
      <div class="mb-3 flex flex-wrap items-center gap-3">
        <div class="k-tabs">
          <button class="k-tab" :class="{ on: tab === 'arrivals' }" @click="tab = 'arrivals'">Llegadas de hoy ({{ arrivals.length }})</button>
          <button class="k-tab" :class="{ on: tab === 'departures' }" @click="tab = 'departures'">Salidas de hoy ({{ departures.length }})</button>
        </div>
        <button class="k-btn primary ml-auto" @click="askBackend('Crear reservas necesita guardarse en el servidor.')">Nueva reserva</button>
      </div>

      <table v-if="tab === 'arrivals'" class="k-table">
        <thead><tr><th>Huésped</th><th>Hab.</th><th>Estadía</th><th>Origen</th><th>Garantía</th><th>Estado</th><th /></tr></thead>
        <tbody>
          <tr v-for="r in arrivals" :key="r.id">
            <td><b>{{ r.guest }}</b></td>
            <td>{{ r.room }}</td>
            <td>{{ fmtDay(r.start) }} a {{ fmtDay(r.end) }}</td>
            <td>{{ r.source }}</td>
            <td><span class="k-chip" :class="r.deposit ? 'ok' : ''">{{ r.deposit ? 'Depósito pagado' : 'Sin depósito' }}</span></td>
            <td>
              <span v-if="r.status === 'inhouse'" class="k-chip info">En casa</span>
              <span v-else-if="hotel.roomOf(r.room)?.status === 'cleaning'" class="k-chip warn">Hab. en limpieza</span>
              <span v-else class="k-chip pri">Por llegar</span>
            </td>
            <td class="r"><button v-if="r.status !== 'inhouse'" class="k-btn primary sm" @click="doCheckIn(r)">Check-in</button><button v-else class="k-btn plain sm" @click="account = r">Ver cuenta</button></td>
          </tr>
        </tbody>
      </table>

      <table v-else class="k-table">
        <thead><tr><th>Huésped</th><th>Hab.</th><th>Total</th><th>Saldo</th><th>Estado</th><th /></tr></thead>
        <tbody>
          <tr v-for="r in departures" :key="r.id">
            <td><b>{{ r.guest }}</b></td>
            <td>{{ r.room }}</td>
            <td>{{ money(total(r)) }}</td>
            <td><span class="k-chip" :class="balance(r) > 0 ? 'bad' : 'ok'">{{ balance(r) > 0 ? money(balance(r)) : 'Al día' }}</span></td>
            <td><span class="k-chip" :class="r.status === 'done' ? 'ok' : 'warn'">{{ r.status === 'done' ? 'Salió' : 'Por salir' }}</span></td>
            <td class="r">
              <template v-if="r.status !== 'done'">
                <button class="k-btn plain sm mr-2" @click="account = r">Cuenta</button>
                <button v-if="balance(r) > 0" class="k-btn primary sm" @click="openCharge(r)">Cobrar</button>
                <button v-else class="k-btn primary sm" @click="doCheckOut(r)">Check-out</button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="(tab === 'arrivals' ? arrivals : departures).length === 0" class="k-sub py-6 text-center">No hay movimientos.</p>
    </div>

    <ModalBox v-if="charging" title="Cobrar saldo" @close="charging = null">
      <p class="k-sub mb-3">{{ charging.guest }}, hab. {{ charging.room }}. Saldo: <b>{{ money(balance(charging)) }}</b></p>
      <label class="k-label">Monto</label>
      <input v-model.number="amount" type="number" min="1" :max="balance(charging)" class="k-input" />
      <label class="k-label mt-3">Medio de pago</label>
      <div class="flex flex-wrap gap-2"><button v-for="m in PAY_METHODS" :key="m" class="k-tab" :class="{ on: method === m }" @click="method = m">{{ m }}</button></div>
      <div class="mt-5 flex justify-end gap-2"><button class="k-btn plain" @click="charging = null">Cancelar</button><button class="k-btn primary" :disabled="amount <= 0 || amount > balance(charging)" @click="confirmCharge">Registrar cobro</button></div>
    </ModalBox>

    <ModalBox v-if="account" :title="`Cuenta de la habitación ${account.room}`" wide @close="account = null">
      <p class="k-sub mb-3">{{ account.guest }}, {{ fmtDay(account.start) }} a {{ fmtDay(account.end) }}</p>
      <table class="k-table">
        <tbody>
          <tr v-for="c in account.charges" :key="c.concept"><td>{{ c.concept }}</td><td class="r">{{ money(c.amount) }}</td></tr>
          <tr><td><b>Total</b></td><td class="r"><b>{{ money(total(account)) }}</b></td></tr>
          <tr><td>Pagado</td><td class="r">{{ money(account.paid) }}</td></tr>
          <tr><td><b>Saldo</b></td><td class="r"><span class="k-chip" :class="balance(account) > 0 ? 'bad' : 'ok'">{{ money(balance(account)) }}</span></td></tr>
        </tbody>
      </table>
      <div class="mt-4 flex justify-end gap-2"><button class="k-btn ghost" @click="askBackend('Agregar cargos a la cuenta se guardará en el servidor.')">Agregar cargo</button><button class="k-btn primary" @click="account = null">Cerrar</button></div>
    </ModalBox>
  </div>
</template>
