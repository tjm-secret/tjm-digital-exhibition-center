<template>
  <div id="app">
    <ExhibitionApp />
  </div>
</template>

<script setup lang="ts">
import ExhibitionApp from '@/components/exhibition/ExhibitionApp.vue'
</script>

<style>
#app {
  @apply w-full h-screen m-0 p-0;
}

body {
  @apply m-0 p-0;
}
</style>