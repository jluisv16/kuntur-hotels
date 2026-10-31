<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { closePending, pending } from '../composables/usePending'

const btn = ref<HTMLButtonElement | null>(null)

function onKey(e: KeyboardEvent): void {
  if (e.key === 'Escape') closePending()
}
watch(() => pending.open, async (open) => {
  if (open) {
    window.addEventListener('keydown', onKey)
    await nextTick()
    btn.value?.focus()
  } else window.removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div v-if="pending.open" class="k-backdrop" @click.self="closePending">
    <div class="k-modal text-center" role="dialog" aria-modal="true" aria-labelledby="pending-title" style="max-width: 380px">
      <div class="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full" style="background: rgb(var(--color-warning) / .15); color: rgb(var(--color-warning))">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z" /></svg>
      </div>
      <h2 id="pending-title" class="text-lg font-bold">Se está trabajando esta opción</h2>
      <p v-if="pending.feature" class="k-sub mt-1">{{ pending.feature }}</p>
      <button ref="btn" class="k-btn primary mt-5 w-full" @click="closePending">Aceptar</button>
    </div>
  </div>
</template>
