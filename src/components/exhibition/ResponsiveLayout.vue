<template>
  <div 
    :class="[
      'responsive-layout w-full h-full',
      'transition-all duration-300 ease-in-out',
      layoutClasses
    ]"
    :style="layoutStyles"
  >
    <!-- Desktop Layout: Left-Right Split -->
    <div 
      v-if="isDesktop"
      class="desktop-layout flex h-full"
    >
      <!-- Left Side: Image Display (70% width on lg, 75% on xl+) -->
      <div class="image-section lg:w-2/3 xl:w-3/4 2xl:w-4/5 h-full">
        <slot name="image" :layout-mode="'desktop'" />
      </div>
      
      <!-- Right Side: Content Panel (30% width on lg, 25% on xl+) -->
      <div class="content-section lg:w-1/3 xl:w-1/4 2xl:w-1/5 h-full bg-gray-50 border-l border-gray-200">
        <slot name="content" :layout-mode="'desktop'" />
      </div>
    </div>

    <!-- Tablet Layout: Top-Bottom Stack with adjusted proportions -->
    <div 
      v-else-if="isTablet"
      class="tablet-layout flex flex-col h-full"
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
      <div 
        :class="[
          'content-section bg-gray-50 border-t border-gray-200',
          isLandscape ? 'h-1/2' : 'h-2/5'
        ]"
      >
        <slot name="content" :layout-mode="'tablet'" />
      </div>
    </div>

    <!-- Mobile Layout: Top-Bottom Stack optimized for small screens -->
    <div 
      v-else
      class="mobile-layout flex flex-col h-full"
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
      <div 
        :class="[
          'content-section bg-gray-50 border-t border-gray-200',
          isLandscape ? 'h-2/5' : 'h-1/2'
        ]"
      >
        <slot name="content" :layout-mode="'mobile'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props
interface Props {
  /** Force a specific layout mode for testing */
  forceLayout?: 'desktop' | 'tablet' | 'mobile'
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'layout-change', layout: { mode: string; orientation: string; dimensions: { width: number; height: number } }): void
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

const layoutClasses = computed(() => {
  const classes = []
  
  // Base layout classes
  classes.push(`layout-${layoutMode.value}`)
  classes.push(`orientation-${orientation.value}`)
  
  // Responsive visibility classes
  if (isDesktop.value) {
    classes.push('hidden', 'lg:block')
  } else if (isTablet.value) {
    classes.push('hidden', 'md:block', 'lg:hidden')
  } else {
    classes.push('block', 'md:hidden')
  }
  
  return classes
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

/* Layout-specific styles */
.layout-desktop {
  /* Desktop-specific optimizations */
}

.layout-tablet {
  /* Tablet-specific optimizations */
}

.layout-mobile {
  /* Mobile-specific optimizations */
}

/* Orientation-specific styles */
.orientation-landscape {
  /* Landscape-specific adjustments */
}

.orientation-portrait {
  /* Portrait-specific adjustments */
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

/* Responsive breakpoint utilities */
@media (max-width: 767px) {
  .responsive-layout {
    /* Mobile-specific CSS */
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .responsive-layout {
    /* Tablet-specific CSS */
  }
}

@media (min-width: 1024px) {
  .responsive-layout {
    /* Desktop-specific CSS */
  }
}

/* Handle orientation changes smoothly */
@media (orientation: landscape) {
  .responsive-layout {
    /* Landscape-specific adjustments */
  }
}

@media (orientation: portrait) {
  .responsive-layout {
    /* Portrait-specific adjustments */
  }
}
</style>