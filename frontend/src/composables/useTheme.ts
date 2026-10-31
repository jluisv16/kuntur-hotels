import { computed, ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'theme'

function readStoredMode(): ThemeMode {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'light' || value === 'dark' || value === 'system') return value
  } catch {
    // el almacenamiento puede estar bloqueado, se usa el valor por defecto
  }
  return 'system'
}

const media: MediaQueryList | null =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null

// Estado compartido por toda la aplicación (un solo tema, sin importar cuántos componentes lo usen)
const mode = ref<ThemeMode>(readStoredMode())
const systemPrefersDark = ref<boolean>(media?.matches ?? false)

media?.addEventListener('change', (event) => {
  systemPrefersDark.value = event.matches
})

const isDark = computed<boolean>(
  () => mode.value === 'dark' || (mode.value === 'system' && systemPrefersDark.value),
)

// Sincroniza la clase "dark" de <html>, que es la que activa las variables y las clases dark:
watch(
  isDark,
  (dark) => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', dark)
    }
  },
  { immediate: true },
)

export function useTheme() {
  function setMode(next: ThemeMode): void {
    mode.value = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // sin almacenamiento, el cambio vale solo para esta sesión
    }
  }

  function toggle(): void {
    setMode(isDark.value ? 'light' : 'dark')
  }

  return { mode, isDark, setMode, toggle }
}
