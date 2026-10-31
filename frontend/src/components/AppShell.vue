<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import '../assets/kuntur.css'
import { NAV, ROLE_LABEL } from '../data/nav'
import { fmtDay } from '../data/mock'
import { useAuth } from '../stores/auth'
import { vPop } from '../directives/pop'
import { askBackend } from '../composables/usePending'
import KunturLogo from './KunturLogo.vue'
import PendingModal from './PendingModal.vue'
import UiIcon from './UiIcon.vue'

const auth = useAuth()
const route = useRoute()
const router = useRouter()
const items = computed(() => NAV.filter((n) => auth.user && n.roles.includes(auth.user.role)))
const initials = computed(() => (auth.user?.name ?? '').split(' ').map((p) => p[0]).slice(0, 2).join(''))

const time = ref(new Date().toTimeString().slice(0, 5))
const showWelcome = ref(auth.intro)
let tick = 0
onMounted(() => {
  tick = window.setInterval(() => { time.value = new Date().toTimeString().slice(0, 5) }, 15000)
  if (auth.intro) {
    // Mientras corre el saludo, los componentes esperan y luego entran de uno en uno.
    document.documentElement.classList.add('intro')
    window.setTimeout(() => { showWelcome.value = false }, 2900)
    window.setTimeout(() => {
      document.documentElement.classList.remove('intro')
      auth.intro = false
    }, 5600)
  }
})
onBeforeUnmount(() => window.clearInterval(tick))

function logout(): void {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-app text-fg">
    <aside class="hidden w-[232px] shrink-0 flex-col border-r border-line bg-surface px-3 py-4 md:flex">
      <div v-pop.left class="px-2 pb-5 pt-1"><KunturLogo :size="30" /></div>
      <nav class="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        <RouterLink
          v-for="n in items" :key="n.name" v-pop.left :to="n.path"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-colors"
          :class="route.name === n.name ? 'bg-primary/15 text-primary' : 'text-fg-muted hover:bg-surface-alt hover:text-fg'"
        >
          <UiIcon :name="n.icon" />{{ n.label }}
        </RouterLink>
      </nav>
      <div v-pop.left class="mb-3 rounded-xl bg-surface-alt px-3 py-2.5">
        <div class="text-[13px] font-bold">Plan Starter</div>
        <div class="k-sub">18 de 20 habitaciones</div>
      </div>
      <div v-pop.left class="flex items-center gap-2.5 px-1">
        <div class="grid h-9 w-9 place-items-center rounded-full bg-primary/20 text-[12px] font-extrabold text-primary">{{ initials }}</div>
        <div class="min-w-0 flex-1 leading-tight">
          <div class="truncate text-[13px] font-bold">{{ auth.user?.name }}</div>
          <div class="k-sub">{{ auth.user && ROLE_LABEL[auth.user.role] }}</div>
        </div>
        <button class="grid h-8 w-8 place-items-center rounded-lg text-fg-muted hover:bg-surface-alt hover:text-fg" title="Cerrar sesión" aria-label="Cerrar sesión" @click="logout"><UiIcon name="logout" :size="17" /></button>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex flex-wrap items-center gap-2.5 px-6 pb-3 pt-5">
        <div v-pop class="mr-auto min-w-0">
          <h1 class="truncate text-[26px] font-extrabold leading-tight tracking-tight">{{ route.meta.title }}</h1>
          <p v-if="route.meta.subtitle" class="k-sub text-[13px]">{{ route.meta.subtitle }}</p>
        </div>
        <button v-pop class="k-btn plain" @click="askBackend('Cambiar de hotel estará disponible en el plan Advance.')"><UiIcon name="build" :size="16" />Hotel Demo Lima<UiIcon name="down" :size="15" /></button>
        <div v-pop class="k-btn plain pointer-events-none"><UiIcon name="calendar" :size="16" />{{ fmtDay(0) }} 2026</div>
        <div v-pop class="k-btn plain pointer-events-none"><UiIcon name="clock" :size="16" />{{ time }}</div>
        <button v-pop class="k-btn plain relative !px-2.5" aria-label="Notificaciones" @click="askBackend('Las notificaciones se conectarán al servidor.')">
          <UiIcon name="bell" /><span class="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
        </button>
      </header>

      <!-- Menú compacto en pantallas pequeñas -->
      <nav class="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
        <RouterLink v-for="n in items" :key="n.name" :to="n.path" class="k-tab whitespace-nowrap" :class="{ on: route.name === n.name }">{{ n.label }}</RouterLink>
      </nav>

      <main class="min-h-0 flex-1 overflow-y-auto px-6 pb-6"><RouterView /></main>
    </div>

    <PendingModal />

    <div v-if="showWelcome" class="welcome" aria-live="polite">
      <div class="txt"><small>Bienvenido</small><b>{{ auth.firstName }}</b></div>
    </div>
  </div>
</template>
