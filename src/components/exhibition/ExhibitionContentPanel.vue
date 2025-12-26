<template>
  <div 
    class="exhibition-content-panel h-full"
    :class="[
      // Base styles
      'bg-zinc-950 border-t border-gold/30',
      // Layout specific adjustments via props or utility classes from parent
      layoutMode === 'desktop' ? 'bg-transparent border-none' : ''
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  layoutMode?: 'desktop' | 'tablet' | 'mobile'
}

withDefaults(defineProps<Props>(), {
  layoutMode: 'mobile'
})
</script>

<style scoped>
/* 
  Future visual enhancements for the content panel can be added here
  without polluting the layout component
*/
.exhibition-content-panel {
  /* Ensure smooth transitions for any theme changes */
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
</style>
