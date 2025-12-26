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
      
        <!-- Content Overlay Panel (Right Side, No Border) -->
        <div class="content-section absolute top-0 right-0 h-full w-[40%] max-w-[600px] z-10 flex flex-col pointer-events-none">
          <!-- Scrollable Content Area -->
          <div 
            class="w-full h-full pointer-events-auto overflow-y-auto px-6 py-6 md:px-8 md:py-8 overscroll-contain custom-scrollbar min-h-0"
            ref="scrollContainer"
          >
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
          'content-section p-6 md:p-8',
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
          'content-section p-6 swiper-no-swiping',
          isLandscape ? 'h-2/5' : 'h-1/2'
        ]"
        layout-mode="mobile"
        @touchstart.stop
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

// Use composable
import { useResponsiveLayout } from '@/composables/useResponsiveLayout'
const { 
  screenWidth, 
  screenHeight, 
  orientation, 
  isDesktop: rawIsDesktop, 
  isTablet: rawIsTablet, 
  isMobile: rawIsMobile, 
  isLandscape, 
  isPortrait, 
  layoutMode: rawLayoutMode 
} = useResponsiveLayout()

// Override computed properties to support forceLayout prop
const isDesktop = computed(() => {
  if (props.forceLayout) return props.forceLayout === 'desktop'
  return rawIsDesktop.value
})

const isTablet = computed(() => {
  if (props.forceLayout) return props.forceLayout === 'tablet'
  return rawIsTablet.value
})

const isMobile = computed(() => {
  if (props.forceLayout) return props.forceLayout === 'mobile'
  return rawIsMobile.value
})

const layoutMode = computed(() => {
  if (props.forceLayout) return props.forceLayout
  return rawLayoutMode.value
})

const layoutStyles = computed(() => {
  return {
    '--screen-width': `${screenWidth.value}px`,
    '--screen-height': `${screenHeight.value}px`,
    '--aspect-ratio': `${screenWidth.value / screenHeight.value}`
  }
})

// Watch for changes to emit events
import { watch } from 'vue'

watch([layoutMode, orientation], ([newMode, newOrientation], [oldMode, oldOrientation]) => {
  if (newMode !== oldMode || newOrientation !== oldOrientation) {
    emit('layout-change', {
      mode: newMode as 'desktop' | 'tablet' | 'mobile',
      orientation: newOrientation,
      dimensions: { width: screenWidth.value, height: screenHeight.value }
    })
  }

  if (newOrientation !== oldOrientation) {
    emit('orientation-change', newOrientation)
  }
})

const scrollContainer = ref<HTMLElement | null>(null)


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
  updateScreenDimensions: () => {}
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

/* Ensure proper overflow handling and touch scrolling */
.content-section {
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch; /* Enable smooth scrolling on iOS */
  touch-action: pan-y; /* Allow vertical scrolling */
  overscroll-behavior-y: contain; /* Prevent scroll chaining */
}

.image-section {
  overflow: hidden;
}
</style>