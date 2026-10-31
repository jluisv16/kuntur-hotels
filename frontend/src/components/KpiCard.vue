<script setup lang="ts">
import UiIcon from './UiIcon.vue'

withDefaults(defineProps<{ label: string; value: string | number; sub?: string; icon: string; tone?: 'primary' | 'info' | 'warning' | 'success' | 'danger' }>(), { tone: 'primary' })
</script>

<template>
  <div class="k-card k-kpi" :style="{ '--c': `var(--color-${tone})` }">
    <div class="bub"><UiIcon :name="icon" :size="22" /></div>
    <div>
      <div class="l">{{ label }}</div>
      <div class="v">{{ value }}</div>
      <div v-if="sub" class="s">{{ sub }}</div>
    </div>
  </div>
</template>
