<script setup lang="ts">
import { computed, ref } from 'vue'
import { DAMAGE_CATALOG, ROOM_TYPES, TEAM, money } from '../data/mock'
import { useAuth } from '../stores/auth'
import { useTheme } from '../composables/useTheme'
import { askBackend } from '../composables/usePending'
import UiIcon from '../components/UiIcon.vue'
import KunturLogo from '../components/KunturLogo.vue'

const auth = useAuth()
const { isDark, setMode } = useTheme()
const isAdmin = computed(() => auth.user?.role === 'admin')
type Tab = 'general' | 'rates' | 'damages' | 'team'
const tab = ref<Tab>('general')
const deposit = ref(true)
const depositType = ref('Porcentaje')
const depositValue = ref(30)
const hotelName = ref('Hotel Demo Lima')
const checkIn = ref('14:00')
const checkOut = ref('12:00')
</script>

<template>
  <div class="space-y-4">
    <div v-if="isAdmin" class="flex flex-wrap items-center gap-2">
      <div class="k-tabs">
        <button v-for="t in ([['general', 'General'], ['rates', 'Tarifas'], ['damages', 'Catálogo de daños'], ['team', 'Usuarios y roles']] as const)" :key="t[0]" class="k-tab" :class="{ on: tab === t[0] }" @click="tab = t[0]">{{ t[1] }}</button>
      </div>
      <button class="k-btn primary ml-auto" @click="askBackend('Guardar la configuración se hará en el servidor.')">Guardar cambios</button>
    </div>

    <div v-if="tab === 'general' || !isAdmin" class="grid gap-4 xl:grid-cols-2">
      <div v-if="isAdmin" class="space-y-4">
        <div class="k-card">
          <h3 class="mb-3">Datos del hotel</h3>
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="sm:col-span-2"><label class="k-label" for="hn">Nombre del hotel</label><input id="hn" v-model="hotelName" class="k-input" /></div>
            <div><label class="k-label">Categoría</label><input class="k-input" value="3 estrellas" /></div>
            <div><label class="k-label">Ciudad</label><input class="k-input" value="Lima" /></div>
            <div><label class="k-label">País</label><input class="k-input" value="Perú" /></div>
            <div><label class="k-label">Moneda</label><input class="k-input" value="Sol peruano (PEN)" /></div>
          </div>
        </div>
        <div class="k-card">
          <div class="mb-3 flex items-center justify-between"><h3>Depósito de garantía</h3><button class="k-switch" :class="{ on: deposit }" role="switch" :aria-checked="deposit" aria-label="Activar depósito de garantía" @click="deposit = !deposit" /></div>
          <div class="grid gap-3 sm:grid-cols-2" :class="{ 'opacity-50': !deposit }">
            <div><label class="k-label">Tipo</label><select v-model="depositType" class="k-input" :disabled="!deposit"><option>Porcentaje</option><option>Monto fijo</option></select></div>
            <div><label class="k-label">Valor</label><input v-model.number="depositValue" type="number" class="k-input" :disabled="!deposit" /></div>
          </div>
          <p class="k-sub mt-3">Los cargos por daños se descuentan del depósito y el resto se libera en el check-out.</p>
        </div>
      </div>

      <div class="space-y-4">
        <div v-if="isAdmin" class="k-card">
          <h3 class="mb-3">Horarios del hotel</h3>
          <div class="grid gap-3 sm:grid-cols-2">
            <div><label class="k-label">Check-in desde</label><input v-model="checkIn" type="time" class="k-input" /></div>
            <div><label class="k-label">Check-out hasta</label><input v-model="checkOut" type="time" class="k-input" /></div>
          </div>
          <p class="k-sub mt-3">Se aplica a todas las reservas del hotel.</p>
        </div>
        <div v-if="isAdmin" class="k-card">
          <h3 class="mb-3">Logo del hotel</h3>
          <div class="flex items-center gap-4">
            <div class="grid h-[72px] w-[72px] place-items-center rounded-xl border-2 border-dashed border-line bg-surface-alt"><KunturLogo :size="22" :tagline="false" class="[&_div.leading-none]:hidden" /></div>
            <div class="flex-1"><b class="text-[14px]">Logo de Kuntur</b><p class="k-sub">Predeterminado. Sube el logo del hotel para mostrarlo arriba a la izquierda.</p></div>
            <button class="k-btn plain" @click="askBackend('Subir el logo necesita guardarse en el servidor.')"><UiIcon name="up" :size="16" />Subir logo</button>
          </div>
        </div>

        <div class="k-card">
          <div class="mb-3 flex items-center justify-between"><h3>Mis preferencias</h3><span class="k-chip info">Solo para mi usuario</span></div>
          <div class="flex items-center gap-3">
            <div class="grid h-10 w-10 place-items-center rounded-xl bg-surface-alt text-fg-muted"><UiIcon :name="isDark ? 'sun' : 'moon'" :size="20" /></div>
            <div class="flex-1"><b class="text-[14px]">Modo oscuro</b><p class="k-sub">Cambia los colores de la pantalla para tu cuenta. No afecta a los demás usuarios.</p></div>
            <button class="k-switch" :class="{ on: isDark }" role="switch" :aria-checked="isDark" aria-label="Modo oscuro" @click="setMode(isDark ? 'light' : 'dark')" />
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="tab === 'rates'" class="k-card">
      <div class="mb-3 flex items-center justify-between"><h3>Tarifas por tipo de habitación</h3><button class="k-btn ghost sm" @click="askBackend('Agregar tipos de habitación se guardará en el servidor.')">Nuevo tipo</button></div>
      <table class="k-table">
        <thead><tr><th>Tipo</th><th>Capacidad</th><th class="r">Tarifa base</th><th /></tr></thead>
        <tbody><tr v-for="t in ROOM_TYPES" :key="t.id"><td><b>{{ t.name }}</b></td><td>{{ t.capacity }} personas</td><td class="r">{{ money(t.rate) }}</td><td class="r"><button class="k-btn ghost sm" @click="askBackend('Editar tarifas se guardará en el servidor.')">Editar</button></td></tr></tbody>
      </table>
    </div>

    <div v-else-if="tab === 'damages'" class="k-card">
      <div class="mb-3 flex items-center justify-between"><h3>Catálogo de daños</h3><button class="k-btn ghost sm" @click="askBackend('Agregar ítems al catálogo se guardará en el servidor.')">Nuevo ítem</button></div>
      <table class="k-table">
        <thead><tr><th>Ítem</th><th class="r">Precio</th><th /></tr></thead>
        <tbody><tr v-for="d in DAMAGE_CATALOG" :key="d.item"><td><b>{{ d.item }}</b></td><td class="r">{{ money(d.price) }}</td><td class="r"><button class="k-btn ghost sm" @click="askBackend('Editar precios del catálogo se guardará en el servidor.')">Editar</button></td></tr></tbody>
      </table>
    </div>

    <div v-else class="k-card">
      <div class="mb-3 flex items-center justify-between"><h3>Equipo</h3><button class="k-btn ghost sm" @click="askBackend('Invitar usuarios se enviará desde el servidor.')"><UiIcon name="plus" :size="15" />Invitar usuario</button></div>
      <table class="k-table">
        <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Hotel</th><th>Estado</th><th /></tr></thead>
        <tbody><tr v-for="u in TEAM" :key="u.email"><td><b>{{ u.name }}</b></td><td>{{ u.email }}</td><td><span class="k-chip pri">{{ u.role }}</span></td><td>Hotel Demo Lima</td><td><span class="k-chip" :class="u.status === 'Activo' ? 'ok' : 'warn'">{{ u.status }}</span></td><td class="r"><button class="k-btn ghost sm" @click="askBackend('Editar usuarios se guardará en el servidor.')">Editar</button></td></tr></tbody>
      </table>
    </div>
  </div>
</template>
