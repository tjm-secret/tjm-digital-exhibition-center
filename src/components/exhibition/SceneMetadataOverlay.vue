<template>
  <div 
    v-if="visible"
    class="scene-metadata-overlay absolute bg-black/70 backdrop-blur-sm text-white rounded-lg transition-all duration-300 pointer-events-none select-none max-w-sm"
    :class="[
      layoutMode === 'mobile' ? 'bottom-2 left-2 p-2' : 'bottom-6 left-6 p-4',
      shouldBeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    ]"
  >
    <div class="flex flex-col gap-1">
      <h3 :class="['font-serif font-semibold text-gold', layoutMode === 'mobile' ? 'text-base' : 'text-xl']">
        {{ title }}
      </h3>
      
      <div v-if="metadata" class="flex flex-col gap-0.5">
        <div v-if="metadata.artist" :class="['font-light opacity-90', layoutMode === 'mobile' ? 'text-xs' : 'text-sm']">
          <span class="text-zinc-400">Artist:</span> {{ metadata.artist }}
        </div>
        <div v-if="metadata.year" :class="['font-light opacity-90', layoutMode === 'mobile' ? 'text-xs' : 'text-sm']">
          <span class="text-zinc-400">Year:</span> {{ metadata.year }}
        </div>
        <div v-if="metadata.medium" :class="['font-light opacity-90', layoutMode === 'mobile' ? 'text-xs' : 'text-sm']">
          <span class="text-zinc-400">Medium:</span> {{ metadata.medium }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface Metadata {
  artist?: string
  year?: string
  medium?: string
  [key: string]: any
}

interface Props {
  title: string
  metadata?: Metadata
  layoutMode?: 'desktop' | 'tablet' | 'mobile'
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  layoutMode: 'desktop',
  visible: true
})

const localHidden = ref(false)
let hideTimer: number | null = null

const shouldBeVisible = computed(() => {
  return props.visible && !localHidden.value
})

const startAutoHideTimer = () => {
  if (hideTimer) clearTimeout(hideTimer)
  localHidden.value = false
  
  if (props.layoutMode === 'mobile') {
    hideTimer = window.setTimeout(() => {
      localHidden.value = true
    }, 5000) // Hide after 5 seconds on mobile
  }
}

// Reset timer when relevant props change
watch(() => props.layoutMode, (newMode) => {
  if (newMode === 'mobile') {
    startAutoHideTimer()
  } else {
    // Desktop/Tablet: Always show
    if (hideTimer) clearTimeout(hideTimer)
    localHidden.value = false
  }
}, { immediate: true })

watch(() => props.visible, (newVal) => {
  if (newVal) {
    startAutoHideTimer()
  }
})

// Also restart timer on title change (new scene)
watch(() => props.title, () => {
  startAutoHideTimer()
})

const handleInteraction = () => {
  if (props.layoutMode === 'mobile') {
    startAutoHideTimer()
  }
}

onMounted(() => {
  window.addEventListener('click', handleInteraction)
  window.addEventListener('touchstart', handleInteraction)
})

onUnmounted(() => {
  if (hideTimer) clearTimeout(hideTimer)
  window.removeEventListener('click', handleInteraction)
  window.removeEventListener('touchstart', handleInteraction)
})
</script>

<style scoped>
.scene-metadata-overlay {
  z-index: 20;
}
</style>
