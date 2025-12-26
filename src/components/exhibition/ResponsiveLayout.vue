<template>
  <div 
    class="responsive-layout w-full h-full transition-all duration-300 ease-in-out"
    :style="layoutStyles"
  >
    <!-- Desktop Layout: Full Screen Image with Overlay Content -->
    <!-- Visible on lg screens (>= 1024px) -->
    <div 
      class="desktop-layout relative w-full h-full overflow-hidden bg-black hidden lg:block"
    >
      <!-- Background Image Layer (Full Width/Height) -->
      <div class="image-section absolute inset-0 z-0 transition-transform duration-700 ease-in-out">
        <slot name="image" :layout-mode="'desktop'" />
      </div>
      
      <!-- Content Overlay Panel (Right Side, Semi-transparent) -->
      <div class="content-section absolute top-0 right-0 h-full w-[35%] max-w-[500px] z-10 transition-transform duration-500 ease-out translate-x-0">
        <!-- Gradient Shade behind text -->
        <div class="absolute inset-0 bg-linear-to-l from-black/90 via-black/70 to-transparent pointer-events-none"></div>
        
        <!-- Interactive Content Container -->
        <div class="relative h-full overflow-y-auto px-8 py-12 flex flex-col justify-center">
            <slot name="content" :layout-mode="'desktop'" />
        </div>
      </div>
    </div>

    <!-- Tablet Layout: Top-Bottom Stack with adjusted proportions -->
    <!-- Visible on md screens but hidden on lg screens (768px - 1023px) -->
    <div 
      class="tablet-layout flex flex-col h-full hidden md:block lg:hidden"
    >
      <!-- Top: Image Display (60% height in portrait, 50% in landscape) -->
      <div 
        :class="[
          'image-section',
          isLandscape ? 'h-1/2' : 'h-3/5'
        ]"
      >
        <slot name="image" :layout-mode="'tablet'" />
      </div>
      
      <!-- Bottom: Content Panel (40% height in portrait, 50% in landscape) -->
      <ExhibitionContentPanel 
        :class="[
          'content-section',
          isLandscape ? 'h-1/2' : 'h-2/5'
        ]"
        layout-mode="tablet"
      >
        <slot name="content" :layout-mode="'tablet'" />
      </ExhibitionContentPanel>
    </div>

    <!-- Mobile Layout: Top-Bottom Stack optimized for small screens -->
    <!-- Visible on small screens, hidden on md screens (< 768px) -->
    <div 
      class="mobile-layout flex flex-col h-full block md:hidden"
    >
      <!-- Top: Image Display (50% height in portrait, 60% in landscape) -->
      <div 
        :class="[
          'image-section',
          isLandscape ? 'h-3/5' : 'h-1/2'
        ]"
      >
        <slot name="image" :layout-mode="'mobile'" />
      </div>
      
      <!-- Bottom: Content Panel (50% height in portrait, 40% in landscape) -->
      <ExhibitionContentPanel 
        :class="[
          'content-section',
          isLandscape ? 'h-2/5' : 'h-1/2'
        ]"
        layout-mode="mobile"
      >
        <slot name="content" :layout-mode="'mobile'" />
      </ExhibitionContentPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ExhibitionContentPanel from './ExhibitionContentPanel.vue'

// Props
interface Props {
  /** Force a specific layout mode for testing */
  forceLayout?: 'desktop' | 'tablet' | 'mobile'
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'layout-change', layout: { mode: 'desktop' | 'tablet' | 'mobile'; orientation: string; dimensions: { width: number; height: number } }): void
  (e: 'orientation-change', orientation: 'portrait' | 'landscape'): void
}

const emit = defineEmits<Emits>()

// Reactive state
const screenWidth = ref(window.innerWidth)
const screenHeight = ref(window.innerHeight)
const orientation = ref<'portrait' | 'landscape'>('portrait')

// Computed properties
const isDesktop = computed(() => {
  if (props.forceLayout) return props.forceLayout === 'desktop'
  return screenWidth.value >= 1024 // lg breakpoint
})

const isTablet = computed(() => {
  if (props.forceLayout) return props.forceLayout === 'tablet'
  return screenWidth.value >= 768 && screenWidth.value < 1024 // md to lg
})

const isMobile = computed(() => {
  if (props.forceLayout) return props.forceLayout === 'mobile'
  return screenWidth.value < 768 // below md
})

const isLandscape = computed(() => {
  return orientation.value === 'landscape'
})

const isPortrait = computed(() => {
  return orientation.value === 'portrait'
})

const layoutMode = computed(() => {
  if (isDesktop.value) return 'desktop'
  if (isTablet.value) return 'tablet'
  return 'mobile'
})



const layoutStyles = computed(() => {
  return {
    '--screen-width': `${screenWidth.value}px`,
    '--screen-height': `${screenHeight.value}px`,
    '--aspect-ratio': `${screenWidth.value / screenHeight.value}`
  }
})

// Methods
const updateScreenDimensions = () => {
  const newWidth = window.innerWidth
  const newHeight = window.innerHeight
  const oldMode = layoutMode.value
  const oldOrientation = orientation.value
  
  screenWidth.value = newWidth
  screenHeight.value = newHeight
  
  // Update orientation based on aspect ratio
  const newOrientation = newWidth > newHeight ? 'landscape' : 'portrait'
  orientation.value = newOrientation
  
  // Emit events if layout or orientation changed
  const newMode = layoutMode.value
  if (oldMode !== newMode || oldOrientation !== newOrientation) {
    emit('layout-change', {
      mode: newMode,
      orientation: newOrientation,
      dimensions: { width: newWidth, height: newHeight }
    })
  }
  
  if (oldOrientation !== newOrientation) {
    emit('orientation-change', newOrientation)
  }
}

const handleResize = () => {
  updateScreenDimensions()
}

const handleOrientationChange = () => {
  // Use setTimeout to ensure dimensions are updated after orientation change
  setTimeout(() => {
    updateScreenDimensions()
  }, 100)
}

// Lifecycle
onMounted(() => {
  updateScreenDimensions()
  
  // Add event listeners
  window.addEventListener('resize', handleResize)
  window.addEventListener('orientationchange', handleOrientationChange)
  
  // Also listen for screen orientation API if available
  if (screen.orientation) {
    screen.orientation.addEventListener('change', handleOrientationChange)
  }
})

onUnmounted(() => {
  // Remove event listeners
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('orientationchange', handleOrientationChange)
  
  if (screen.orientation) {
    screen.orientation.removeEventListener('change', handleOrientationChange)
  }
})

// Expose reactive properties and methods
defineExpose({
  screenWidth: computed(() => screenWidth.value),
  screenHeight: computed(() => screenHeight.value),
  orientation: computed(() => orientation.value),
  layoutMode: computed(() => layoutMode.value),
  isDesktop,
  isTablet,
  isMobile,
  isLandscape,
  isPortrait,
  updateScreenDimensions
})
</script>

<style scoped>
.responsive-layout {
  /* CSS custom properties for dynamic values */
  --screen-width: 100vw;
  --screen-height: 100vh;
  --aspect-ratio: 1;
}

/* Smooth transitions for layout changes */
.image-section,
.content-section {
  transition: all 0.3s ease-in-out;
}

/* Ensure proper overflow handling */
.content-section {
  overflow-y: auto;
  overflow-x: hidden;
}

.image-section {
  overflow: hidden;
}
</style>