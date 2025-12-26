<template>
  <div class="exhibition-text-info space-y-4">
    <slot name="header"></slot>
    
    <h1 class="text-3xl md:text-4xl lg:text-5xl font-serif text-gold font-bold tracking-wide leading-tight drop-shadow-md">
       <span class="block bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
         {{ title }}
       </span>
    </h1>
    
    <div class="space-y-1">
      <p v-if="artist" class="text-sm md:text-base text-gray-300 font-medium tracking-wider uppercase opacity-90">
        {{ artist }}
      </p>
      <div v-if="year || medium" class="text-xs text-gray-500 font-mono flex items-center space-x-2">
         <span v-if="year">{{ year }}</span>
         <span v-if="year && medium" class="w-1 h-1 rounded-full bg-gray-600"></span>
         <span v-if="medium">{{ medium }}</span>
      </div>
    </div>

    <div class="relative py-4">
      <div class="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-gold/30 to-transparent"></div>
      <p class="pl-4 text-gray-300 leading-relaxed text-base md:text-lg font-light tracking-wide text-justify">
        {{ description }}
      </p>
    </div>
    
    <slot name="footer"></slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description?: string
  artist?: string
  year?: string
  medium?: string
}

withDefaults(defineProps<Props>(), {
  description: ''
})
</script>
