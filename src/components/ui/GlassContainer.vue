<template>
  <div 
    class="glass-container backdrop-blur-md bg-black/40 border border-white/10 shadow-lg text-white transition-all duration-300"
    :class="[
      rounded ? 'rounded-full' : 'rounded-lg',
      interactive ? 'hover:bg-black/60 hover:border-gold/50 cursor-pointer' : ''
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  rounded?: boolean
  interactive?: boolean
}

withDefaults(defineProps<Props>(), {
  rounded: true,
  interactive: false
})
</script>

<style scoped>
.glass-container {
  /* Optional: explicit backdrop-filter support for older browsers if needed, 
     though Tailwind's backdrop-blur usually handles it well. */
}
</style>
