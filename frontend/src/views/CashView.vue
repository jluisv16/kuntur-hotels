<script setup lang="ts">
import { computed, ref } from 'vue'
import { money, PAST_CASH } from '../data/mock'
import { useHotel } from '../stores/hotel'
import { askBackend } from '../composables/usePending'
import KpiCard from '../components/KpiCard.vue'

const hotel = useHotel()
const counted = ref(1055)
const diff = computed(() => counted.value - hotel.cashExpected)
const rows = computed(() => [...hotel.movements].reverse())
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="Total cobrado" :value="money(hotel.incomeTotal)" sub="Turno de hoy" icon="wallet" />
      <KpiCard label="Efectivo" :value="money(hotel.cashIn)" sub="Ingresos en efectivo" icon="card" tone="success" />
      <KpiCard label="Yape y Plin" :value="money(hotel.byMethod(['Yape', 'Plin']))" sub="Billeteras digitales" icon="trend" tone="info" />
      <KpiCard label="Tarjeta y transferencia" :value="money(hotel.byMethod(['Tarjeta', 'Transferencia']))" sub="Banco" icon="card" tone="warning" />
    </div>

    <div class="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
      <div class="k-card min-w-0">
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <h3>Movimientos del turno</h3><span class="k-chip ok">Caja abierta por María Rodríguez, 07:00</span>
          <div class="ml-auto flex gap-2">
            <button class="k-btn ghost sm" @click="askBackend('Registrar un egreso se guardará en el servidor.')">Registrar egreso</button>
            <button class="k-btn primary sm" @click="askBackend('Registrar un pago se guardará en el servidor.')">Registrar pago</button>
          </div>
        </div>
        <table class="k-table">
          <thead><tr><th>Hora</th><th>Concepto</th><th>Hab.</th><th>Medio</th><th class="r">Monto</th><th>Registró</th></tr></thead>
          <tbody>
            <tr v-for="(m, i) in rows" :key="i"><td>{{ m.time }}</td><td>{{ m.concept }}</td><td>{{ m.room }}</td><td><span class="k-chip">{{ m.method }}</span></td><td class="r font-bold" :style="m.amount < 0 ? 'color: rgb(var(--color-danger))' : ''">{{ m.amount < 0 ? '−' : '' }}{{ money(Math.abs(m.amount)) }}</td><td>{{ m.by }}</td></tr>
          </tbody>
        </table>
      </div>

      <div class="space-y-4">
        <div class="k-card">
          <h3 class="mb-3">Cierre del turno</h3>
          <dl class="space-y-2 text-[13px]">
            <div class="flex justify-between"><dt class="k-sub">Saldo inicial</dt><dd class="font-semibold">{{ money(hotel.OPENING) }}</dd></div>
            <div class="flex justify-between"><dt class="k-sub">Ingresos en efectivo</dt><dd class="font-semibold">{{ money(hotel.cashIn) }}</dd></div>
            <div class="flex justify-between"><dt class="k-sub">Egresos en efectivo</dt><dd class="font-semibold">−{{ money(hotel.cashOut) }}</dd></div>
            <div class="flex justify-between border-t border-line pt-2"><dt class="font-bold">Efectivo esperado</dt><dd class="font-extrabold">{{ money(hotel.cashExpected) }}</dd></div>
          </dl>
          <label class="k-label mt-4" for="contado">Efectivo contado</label>
          <input id="contado" v-model.number="counted" type="number" min="0" class="k-input" />
          <div class="mt-3 flex items-center justify-between rounded-xl bg-surface-alt px-3 py-2.5 text-[13px]"><span class="font-semibold">Diferencia</span><span class="k-chip" :class="diff === 0 ? 'ok' : diff < 0 ? 'bad' : 'warn'">{{ diff === 0 ? 'Cuadra' : (diff > 0 ? '+' : '−') + money(Math.abs(diff)) }}</span></div>
          <button class="k-btn primary mt-4 w-full" @click="askBackend('Cerrar la caja se guardará en el servidor.')">Cerrar caja</button>
        </div>

        <div class="k-card">
          <h3 class="mb-2">Cajas anteriores</h3>
          <ul class="divide-y divide-line">
            <li v-for="c in PAST_CASH" :key="c.date" class="flex items-center gap-3 py-2.5 text-[13px]">
              <div class="flex-1"><b>{{ c.date }}</b><div class="k-sub">{{ c.shift }}</div></div>
              <b>{{ money(c.total) }}</b>
              <span class="k-chip" :class="c.diff === 0 ? 'ok' : 'warn'">{{ c.diff === 0 ? 'Cuadró' : `−${money(Math.abs(c.diff))}` }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
