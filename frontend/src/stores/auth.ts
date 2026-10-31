import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { DEMO_PASSWORD, DEMO_USERS } from '../data/mock'
import type { Role } from '../data/nav'
import { resetPop } from '../directives/pop'

export interface SessionUser { email: string; name: string; role: Role }
const KEY = 'kuntur_session'

function restore(): SessionUser | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SessionUser) : null
  } catch {
    return null
  }
}

export const useAuth = defineStore('auth', () => {
  const user = ref<SessionUser | null>(restore())
  // true solo justo después de iniciar sesión: activa el saludo y la animación de ingreso
  const intro = ref(false)
  const firstName = computed(() => user.value?.name.split(' ')[0] ?? '')

  // Simula la respuesta del servidor. Cuando exista la API, se cambia solo esta función.
  async function login(email: string, password: string): Promise<{ ok: boolean; message?: string }> {
    await new Promise((r) => setTimeout(r, 1500))
    const found = DEMO_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (!found || password !== DEMO_PASSWORD) return { ok: false, message: 'Correo o contraseña incorrectos.' }
    user.value = found
    try { sessionStorage.setItem(KEY, JSON.stringify(found)) } catch { /* sin almacenamiento */ }
    resetPop()
    intro.value = true
    return { ok: true }
  }

  function logout(): void {
    user.value = null
    intro.value = false
    try { sessionStorage.removeItem(KEY) } catch { /* sin almacenamiento */ }
  }

  return { user, intro, firstName, login, logout }
})
