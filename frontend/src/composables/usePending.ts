import { reactive } from 'vue'

// Ventana "Se está trabajando esta opción" para acciones que necesitan backend.
export const pending = reactive({ open: false, feature: '' })

export function askBackend(feature = ''): void {
  pending.feature = feature
  pending.open = true
}

export function closePending(): void {
  pending.open = false
}
