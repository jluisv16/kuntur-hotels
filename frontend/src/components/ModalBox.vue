<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'

defineProps<{ title: string; wide?: boolean }>()
const emit = defineEmits<{ close: [] }>()
const onKey = (e: KeyboardEvent): void => { if (e.key === 'Escape') emit('close') }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="k-backdrop" @click.self="emit('close')">
    <div class="k-modal" :style="wide ? 'max-width: 560px' : ''" role="dialog" aria-modal="true">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-bold">{{ title }}</h2>
        <button class="grid h-8 w-8 place-items-center rounded-lg text-fg-muted hover:bg-surface-alt" aria-label="Cerrar" @click="emit('close')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>
      <slot />
    </div>
  </div>
</template>
