<script setup lang="ts">
withDefaults(defineProps<{ size?: number; light?: boolean; tagline?: boolean }>(), { size: 40, tagline: true })
</script>

<template>
  <div class="flex items-center gap-2.5" :style="{ color: light ? '#fff' : 'rgb(var(--color-fg))' }">
    <svg :width="size * 1.4" :height="size" viewBox="0 0 56 40" aria-hidden="true">
      <path fill="currentColor" d="M28 17L38 11L48 7L56 9L51 12L56 14L50 16L54 19L47 20L49 23L40 22L33 26L28 34L23 26L16 22L7 23L9 20L2 19L6 16L0 14L5 12L0 9L8 7L18 11Z" />
      <circle cx="28" cy="11.5" r="4.6" fill="#CA8A04" />
      <path d="M26 14.5L28.6 19L30.6 14.8Z" fill="#CA8A04" />
    </svg>
    <div class="leading-none">
      <div class="font-extrabold" :style="{ fontSize: size * 0.42 + 'px', letterSpacing: '.2em' }">KUNTUR</div>
      <div v-if="tagline" class="mt-1 font-semibold opacity-60" :style="{ fontSize: size * 0.2 + 'px', letterSpacing: '.24em' }">PMS HOTELERO</div>
    </div>
  </div>
</template>
