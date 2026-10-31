import type { Directive } from 'vue'

// Entrada animada de componentes. Solo se ve cuando <html> tiene la clase "intro",
// que se activa únicamente justo después de iniciar sesión.
let counter = 0

export function resetPop(): void {
  counter = 0
}

export const vPop: Directive<HTMLElement, undefined, 'left'> = {
  mounted(el, binding) {
    el.classList.add('pop')
    if (binding.modifiers.left) el.classList.add('left')
    el.style.setProperty('--i', String(Math.min(counter++, 32)))
  },
}
