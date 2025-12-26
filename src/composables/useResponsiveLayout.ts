import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useResponsiveLayout() {
  const screenWidth = ref(window.innerWidth)
  const screenHeight = ref(window.innerHeight)
  const orientation = ref<'portrait' | 'landscape'>('portrait')

  // Computed properties
  const isDesktop = computed(() => screenWidth.value >= 1024)
  const isTablet = computed(() => screenWidth.value >= 768 && screenWidth.value < 1024)
  const isMobile = computed(() => screenWidth.value < 768)

  const isLandscape = computed(() => orientation.value === 'landscape')
  const isPortrait = computed(() => orientation.value === 'portrait')

  const layoutMode = computed(() => {
    if (isDesktop.value) return 'desktop'
    if (isTablet.value) return 'tablet'
    return 'mobile'
  })

  // Methods
  const updateScreenDimensions = () => {
    screenWidth.value = window.innerWidth
    screenHeight.value = window.innerHeight
    
    // Update orientation based on aspect ratio
    orientation.value = screenWidth.value > screenHeight.value ? 'landscape' : 'portrait'
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
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)
    
    // Listen for screen orientation API if available
    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleOrientationChange)
    }
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('orientationchange', handleOrientationChange)
    
    if (screen.orientation) {
      screen.orientation.removeEventListener('change', handleOrientationChange)
    }
  })

  return {
    screenWidth,
    screenHeight,
    orientation,
    isDesktop,
    isTablet,
    isMobile,
    isLandscape,
    isPortrait,
    layoutMode
  }
}
