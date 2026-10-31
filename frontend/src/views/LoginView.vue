<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import '../assets/kuntur.css'
import { DEMO_PASSWORD, DEMO_USERS } from '../data/mock'
import { ROLE_LABEL } from '../data/nav'
import { useAuth } from '../stores/auth'
import KunturLogo from '../components/KunturLogo.vue'
import UiIcon from '../components/UiIcon.vue'

const auth = useAuth()
const router = useRouter()
const email = ref(DEMO_USERS[0].email)
const password = ref(DEMO_PASSWORD)
const show = ref(false)
const keep = ref(true)
const loading = ref(false)
const error = ref('')
const shake = ref(false)
const dim = ref(false)

async function submit(): Promise<void> {
  if (loading.value) return
  error.value = ''
  if (!email.value.trim() || !password.value) {
    error.value = 'Escribe tu correo y tu contraseña.'
    return
  }
  loading.value = true
  const res = await auth.login(email.value, password.value)
  if (!res.ok) {
    loading.value = false
    error.value = res.message ?? 'No se pudo iniciar sesión.'
    shake.value = false
    requestAnimationFrame(() => { shake.value = true })
    return
  }
  // Éxito: la pantalla se atenúa y recién entonces se pasa al sistema.
  dim.value = true
  await new Promise((r) => setTimeout(r, 650))
  await router.push('/')
}

function useDemo(i: number): void {
  email.value = DEMO_USERS[i].email
  password.value = DEMO_PASSWORD
  error.value = ''
}
</script>

<template>
  <div class="grid min-h-screen bg-app text-fg lg:grid-cols-[1.05fr_1fr]">
    <section class="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex" style="background: linear-gradient(160deg, #0b1626 0%, #11304a 55%, #0d6b66 100%)">
      <KunturLogo :size="44" light />
      <svg class="pointer-events-none absolute -right-24 bottom-10 opacity-[.07]" width="640" height="460" viewBox="0 0 56 40" aria-hidden="true">
        <path fill="#fff" d="M28 17L38 11L48 7L56 9L51 12L56 14L50 16L54 19L47 20L49 23L40 22L33 26L28 34L23 26L16 22L7 23L9 20L2 19L6 16L0 14L5 12L0 9L8 7L18 11Z" />
      </svg>
      <div class="relative">
        <h2 class="max-w-md text-[40px] font-extrabold leading-[1.1] tracking-tight">Reservas, caja y limpieza en un solo lugar.</h2>
        <ul class="mt-7 space-y-3 text-[15px] text-white/85">
          <li class="flex items-center gap-3"><UiIcon name="bed" />Habitaciones y check-in en tiempo real</li>
          <li class="flex items-center gap-3"><UiIcon name="wallet" />Caja del turno y pagos al día</li>
          <li class="flex items-center gap-3"><UiIcon name="sparkles" />Housekeeping avisa a recepción al terminar</li>
        </ul>
      </div>
    </section>

    <section class="flex flex-col items-center justify-center px-6 py-10">
      <div class="mb-8 lg:hidden"><KunturLogo :size="38" /></div>
      <form class="w-full max-w-[400px]" :class="{ 'k-shake': shake }" novalidate @submit.prevent="submit" @animationend="shake = false">
        <h1 class="text-[28px] font-extrabold tracking-tight">Iniciar sesión</h1>
        <p class="k-sub mt-1 text-[14px]">Ingresa con tu correo y contraseña.</p>

        <label class="k-label mt-7" for="email">Correo electrónico</label>
        <div class="relative">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted"><UiIcon name="mail" :size="17" /></span>
          <input id="email" v-model="email" class="k-input !h-11 !pl-10" type="email" autocomplete="username" :disabled="loading" />
        </div>

        <label class="k-label mt-4" for="pass">Contraseña</label>
        <div class="relative">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted"><UiIcon name="lock" :size="17" /></span>
          <input id="pass" v-model="password" class="k-input !h-11 !px-10" :type="show ? 'text' : 'password'" autocomplete="current-password" :disabled="loading" />
          <button type="button" class="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-fg-muted hover:bg-surface-alt" :aria-label="show ? 'Ocultar contraseña' : 'Mostrar contraseña'" @click="show = !show"><UiIcon :name="show ? 'eyeoff' : 'eye'" :size="17" /></button>
        </div>

        <div class="mt-4 flex items-center justify-between text-[13px]">
          <label class="flex cursor-pointer items-center gap-2 text-fg-muted"><input v-model="keep" type="checkbox" class="h-4 w-4 accent-[rgb(var(--color-primary))]" />Mantener sesión iniciada</label>
          <button type="button" class="font-semibold text-primary hover:underline" @click="error = 'La recuperación de contraseña se conectará al servidor.'">¿Olvidaste tu contraseña?</button>
        </div>

        <p v-if="error" class="mt-4 rounded-lg px-3 py-2 text-[13px] font-medium" style="background: rgb(var(--color-danger) / .12); color: rgb(var(--color-danger))" role="alert">{{ error }}</p>

        <button class="k-btn primary mt-5 !h-12 w-full !text-[15px]" type="submit" :disabled="loading">
          <svg v-if="loading" class="k-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity=".3" stroke-width="3" /><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round" /></svg>
          {{ loading ? 'Ingresando…' : 'Ingresar' }}
        </button>

        <div class="mt-8 rounded-xl border border-line bg-surface p-3.5">
          <div class="k-sub mb-2 text-[11.5px] font-bold uppercase tracking-wider">Usuarios de ejemplo</div>
          <div class="flex flex-wrap gap-2">
            <button v-for="(u, i) in DEMO_USERS" :key="u.email" type="button" class="k-btn plain sm" :disabled="loading" @click="useDemo(i)">{{ u.name.split(' ')[0] }}, {{ ROLE_LABEL[u.role] }}</button>
          </div>
          <p class="k-sub mt-2 text-[11.5px]">Contraseña de ejemplo: {{ DEMO_PASSWORD }}</p>
        </div>
      </form>
      <p class="k-sub mt-10 text-[12px]">Kuntur, sistema de gestión hotelera</p>
    </section>

    <div class="pointer-events-none fixed inset-0 z-50 transition-opacity duration-700" :class="dim ? 'opacity-100' : 'opacity-0'" style="background: rgb(5 10 20 / .94)" />
  </div>
</template>
