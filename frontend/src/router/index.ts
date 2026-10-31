import { createRouter, createWebHistory } from 'vue-router'
import AppShell from '../components/AppShell.vue'
import { NAV } from '../data/nav'
import { useAuth } from '../stores/auth'

const TITLES: Record<string, [string, string]> = {
  inicio: ['Inicio', 'Panel de control del hotel, hoy.'],
  recepcion: ['Recepción', 'Reservas, check-in y check-out del día.'],
  habitaciones: ['Habitaciones', 'Estado de cada habitación y tarifas.'],
  reservas: ['Reservas', 'Disponibilidad de los próximos días.'],
  huespedes: ['Huéspedes', 'Fichas e historial de estadías.'],
  caja: ['Caja', 'Turno, pagos y movimientos del día.'],
  housekeeping: ['Housekeeping', 'Limpieza y mantenimiento de habitaciones.'],
  incidentes: ['Incidentes', 'Catálogo de daños y objetos olvidados.'],
  reportes: ['Reportes', 'Ingresos, ocupación e incidencias.'],
  configuracion: ['Configuración', 'Datos del hotel, horarios, depósito y equipo.'],
}
const VIEWS: Record<string, () => Promise<unknown>> = {
  inicio: () => import('../views/DashboardView.vue'),
  recepcion: () => import('../views/ReceptionView.vue'),
  habitaciones: () => import('../views/RoomsView.vue'),
  reservas: () => import('../views/ReservationsView.vue'),
  huespedes: () => import('../views/GuestsView.vue'),
  caja: () => import('../views/CashView.vue'),
  housekeeping: () => import('../views/HousekeepingView.vue'),
  incidentes: () => import('../views/IncidentsView.vue'),
  reportes: () => import('../views/ReportsView.vue'),
  configuracion: () => import('../views/SettingsView.vue'),
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { public: true, title: 'Iniciar sesión' } },
    {
      path: '/',
      component: AppShell,
      children: NAV.map((n) => ({
        path: n.path === '/' ? '' : n.path.slice(1),
        name: n.name,
        component: VIEWS[n.name] as () => Promise<never>,
        meta: { title: TITLES[n.name][0], subtitle: TITLES[n.name][1], roles: n.roles },
      })),
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuth()
  if (!auth.user) return to.name === 'login' ? true : { name: 'login' }
  if (to.name === 'login') return { name: 'inicio' }
  if (to.meta.roles && !to.meta.roles.includes(auth.user.role)) return { name: 'inicio' }
  return true
})

// Precarga las demás pantallas cuando el navegador está libre, así el cambio entre ellas es inmediato.
router.afterEach((to) => {
  if (to.name === 'login') return
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500))
  idle(() => Object.values(VIEWS).forEach((load) => void load()))
})
