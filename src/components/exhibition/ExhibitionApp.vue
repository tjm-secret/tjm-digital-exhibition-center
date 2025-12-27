<template>
  <div class="exhibition-container relative bg-black">
    <!-- Global Language Switcher -->
    <div 
      class="fixed top-6 right-6 z-50 transition-opacity duration-700 ease-in-out"
      :class="{ 'opacity-0 pointer-events-none': isUserIdle && currentLayoutMode === 'desktop' }"
    >
      <LanguageSwitcher
        :model-value="currentLanguage"
        :available-languages="globalAvailableLanguages"
        @update:model-value="handleGlobalLanguageChange"
      />
    </div>

    <!-- Swiper 容器 -->
    <div ref="swiperContainer" class="swiper w-full h-full">
      <div class="swiper-wrapper">
        <div
          v-for="(scene, index) in scenes"
          :key="scene.id"
          class="swiper-slide"
        >
          <!-- 使用響應式佈局組件 -->
          <ResponsiveLayout
            @layout-change="handleLayoutChange"
            @orientation-change="handleOrientationChange"
          >
            <!-- 圖片顯示區域 -->
            <template #image="{ layoutMode }">
              <SceneComponent
                :scene="scene"
                :is-active="index === currentSceneIndex"
                :layout-mode="layoutMode as 'desktop' | 'tablet' | 'mobile'"
                :current-language="currentLanguage"
                @content-loaded="handleContentLoaded"
                @image-loaded="handleImageLoaded"
                @image-error="handleImageError"
              />
            </template>
            
            <!-- 內容面板區域 -->
            <template #content="{ layoutMode }">
              <div 
                class="transition-opacity duration-700 ease-in-out"
                :class="{ 'opacity-0 pointer-events-none': isUserIdle && layoutMode === 'desktop' }"
              >
                <AudioGuideComponent
                  :scene="scene"
                  :default-language="currentLanguage"
                  :layout-mode="layoutMode as 'desktop' | 'tablet' | 'mobile'"
                />
              </div>
            </template>
          </ResponsiveLayout>
        </div>
      </div>
    </div>
    
    <!-- 底部導覽列 -->
    <div class="transition-opacity duration-700 ease-in-out" :class="{ 'opacity-0 pointer-events-none': isUserIdle && currentLayoutMode !== 'desktop' }">
      <NavigationComponent
        :scenes="scenes"
        :current-index="currentSceneIndex"
        :show-thumbnails="false"
        :current-language="currentLanguage"
        @scene-selected="navigateToScene"
        @navigation-scroll="handleNavigationScroll"
      />
    </div>
    
    <!-- 邊界提示 -->
    <div
      v-if="showBoundaryHint"
      :class="[
        'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
        'bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg',
        'text-sm font-medium z-50 pointer-events-none',
        'transition-opacity duration-300',
        showBoundaryHint ? 'opacity-100' : 'opacity-0'
      ]"
    >
      {{ boundaryMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import type { Scene, ExhibitionConfig, ResourceConfig } from '@/types'
import SceneComponent from './SceneComponent.vue'
import NavigationComponent from './NavigationComponent.vue'
import AudioGuideComponent from './AudioGuideComponent.vue'
import ResponsiveLayout from './ResponsiveLayout.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import { globalImageLoader } from '@/services/ImageLoader'
import { globalSwiperController } from '@/services/SwiperController'
import { ResourceManager } from '@/services/ResourceManager'
import { audioManager } from '@/services/AudioManager'

// 基本狀態管理
const scenes = ref<Scene[]>([])
const currentSceneIndex = ref(0)
const swiperContainer = ref<HTMLElement>()
const boundaryMessage = ref('')
const showBoundaryHint = ref(false)
const exhibitionConfig = ref<ExhibitionConfig | null>(null)
const isLoading = ref(true)
const loadError = ref<string>('')
const currentLanguage = ref('zh')
const currentLayoutMode = ref<'desktop' | 'tablet' | 'mobile'>('desktop')

// ResourceManager 實例
const resourceConfig: ResourceConfig = {
  mode: 'static',
  staticPath: 'assets/exhibitions/',
  fallbackStrategy: 'none'
}
const resourceManager = new ResourceManager(resourceConfig)

// 計算屬性

// 計算屬性
const currentScene = computed(() => {
  return scenes.value[currentSceneIndex.value] || null
})

const globalAvailableLanguages = computed(() => {
  if (exhibitionConfig.value?.availableLanguages) {
    return exhibitionConfig.value.availableLanguages
  }
  return ['zh', 'en'] // Fallback
})

const handleGlobalLanguageChange = (lang: string) => {
  currentLanguage.value = lang
  localStorage.setItem('exhibition-language', lang)
}

// Immersive Mode (Auto-hide UI)
const isUserIdle = ref(false)
let idleTimer: number | null = null

const resetIdleTimer = () => {
  isUserIdle.value = false
  if (idleTimer) window.clearTimeout(idleTimer)
  idleTimer = window.setTimeout(() => {
    isUserIdle.value = true
  }, 5000) // 5 seconds idle
}

const updateGlobalLayoutMode = () => {
  const width = window.innerWidth
  // Consider mobile (<768) and tablet (<1024) as "mobile" layout mode for global UI persistence
  if (width < 1024) {
    currentLayoutMode.value = 'mobile'
  } else {
    currentLayoutMode.value = 'desktop'
  }
}

onMounted(() => {
  initializeExhibition()
  // 添加鍵盤事件監聽器作為備用
  document.addEventListener('keydown', handleKeydown)
  
  // Update global layout mode separately to ensure UI persistence
  updateGlobalLayoutMode()
  window.addEventListener('resize', updateGlobalLayoutMode)
  
  // Idle tracking
  window.addEventListener('mousemove', resetIdleTimer)
  window.addEventListener('click', resetIdleTimer)
  window.addEventListener('touchstart', resetIdleTimer)
  window.addEventListener('scroll', resetIdleTimer)
  resetIdleTimer()
})

onUnmounted(() => {
  // 清理 Swiper 實例
  globalSwiperController.destroySwiper()
  // 移除鍵盤事件監聽器
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', updateGlobalLayoutMode)
  
  // Cleanup idle tracking
  if (idleTimer) window.clearTimeout(idleTimer)
  window.removeEventListener('mousemove', resetIdleTimer)
  window.removeEventListener('click', resetIdleTimer)
  window.removeEventListener('touchstart', resetIdleTimer)
  window.removeEventListener('scroll', resetIdleTimer)
})

// 基本方法定義
const initializeExhibition = async () => {

  
  try {
    isLoading.value = true
    loadError.value = ''
    
    // 載入展覽配置
    await loadExhibitionConfig('sample') // 使用 'sample' 作為展覽 ID
    
    // 等待 DOM 更新後初始化 Swiper
    await nextTick()
    initializeSwiper()
  } catch (error) {
    console.error('Failed to initialize exhibition:', error)
    loadError.value = error instanceof Error ? error.message : '載入展覽失敗'
    
    // 如果載入失敗，使用備用場景
    loadFallbackScenes()
    await nextTick()
    initializeSwiper()
  } finally {
    isLoading.value = false
  }
}

const loadExhibitionConfig = async (exhibitionId: string) => {

  
  try {
    const config = await resourceManager.loadExhibition(exhibitionId)
    exhibitionConfig.value = config
    scenes.value = config.scenes
    
    

    
  } catch (error) {
    console.error('Failed to load exhibition config:', error)
    throw error
  }
}

const loadFallbackScenes = () => {

  // 備用場景數據（保留原有的硬編碼場景作為備用）
  scenes.value = [
    {
      id: 'scene-1',
      title: '金箔藝術作品',
      description: {
        zh: '這是一件精美的金箔藝術作品，展現了傳統工藝的精湛技術。',
        en: 'This is an exquisite gold leaf artwork showcasing traditional craftsmanship.'
      },
      image: {
        url: '/assets/exhibitions/sample/images/scene-1.svg',
        alt: '金箔藝術作品',
        width: 1920,
        height: 1080,
        thumbnail: '/assets/exhibitions/sample/images/scene-1.svg'
      },
      audio: {
        zh: {
          url: '/assets/exhibitions/sample/audio/scene-1-zh.mp3',
          duration: 120,
          format: 'mp3',
          size: 2048000
        }
      },
      order: 1,
      metadata: {
        artist: '傳統工藝師',
        year: '2023',
        medium: '金箔、木材',
        dimensions: '60 x 40 cm'
      }
    },
    {
      id: 'scene-2',
      title: '現代抽象畫',
      description: {
        zh: '這幅現代抽象畫運用了豐富的色彩和動感的線條。',
        en: 'This modern abstract painting uses rich colors and dynamic lines.'
      },
      image: {
        url: '/assets/exhibitions/sample/images/scene-2.svg',
        alt: '現代抽象畫',
        width: 1920,
        height: 1080,
        thumbnail: '/assets/exhibitions/sample/images/scene-2.svg'
      },
      audio: {
        zh: {
          url: '/assets/exhibitions/sample/audio/scene-2-zh.mp3',
          duration: 90,
          format: 'mp3',
          size: 1536000
        }
      },
      order: 2,
      metadata: {
        artist: '現代藝術家',
        year: '2024',
        medium: '油彩、畫布',
        dimensions: '80 x 60 cm'
      }
    }
  ]
}

const initializeSwiper = () => {
  if (!swiperContainer.value || scenes.value.length === 0) {
    console.warn('Swiper container not found or no scenes available')
    return
  }

  // 初始化 Swiper
  globalSwiperController.initializeSwiper(swiperContainer.value, scenes.value.length)
  
  // 設置事件監聽器
  globalSwiperController.onSlideChange((index: number) => {

    // 切換場景時停止所有音訊播放
    audioManager.stopAudio()
    currentSceneIndex.value = index
  })
  
  globalSwiperController.onReachBeginning(() => {

    showBoundaryMessage('已到達第一個場景')
  })
  
  globalSwiperController.onReachEnd(() => {

    showBoundaryMessage('已到達最後一個場景')
  })
  
  // 設置邊界嘗試回調
  globalSwiperController.onBoundaryAttempt((direction: 'prev' | 'next') => {
    const message = direction === 'prev' ? '已在第一個場景' : '已在最後一個場景'
    showBoundaryMessage(message)
  })
}



const navigateToScene = (index: number) => {
  if (index >= 0 && index < scenes.value.length) {

    
    // 使用 SwiperController 進行導航
    const success = globalSwiperController.slideTo(index)
    if (success) {
      currentSceneIndex.value = index
    } else {
      // 如果 Swiper 導航失敗，直接更新索引
      currentSceneIndex.value = index
    }
  }
}

const navigateNext = () => {
  const success = globalSwiperController.slideNext()
  if (!success) {

  }
}

const navigatePrev = () => {
  const success = globalSwiperController.slidePrev()
  if (!success) {

  }
}

const showBoundaryMessage = (message: string) => {
  boundaryMessage.value = message
  showBoundaryHint.value = true
  
  // 自動隱藏提示
  setTimeout(() => {
    showBoundaryHint.value = false
  }, 2000)
}

const preloadAdjacentScenes = () => {

  // 使用 ImageLoader 預載相鄰場景
  globalImageLoader.preloadAdjacentScenes(currentSceneIndex.value, scenes.value)
}

// 監聽場景變化，觸發預載
watch(currentSceneIndex, () => {
  preloadAdjacentScenes()
})

// 事件處理器
const handleContentLoaded = (sceneId: string) => {

}

const handleImageLoaded = (sceneId: string) => {

}

const handleImageError = (sceneId: string, error: Event) => {
  console.error(`Image error for scene ${sceneId}:`, error)
}

const handleNavigationScroll = (direction: 'left' | 'right') => {

  // 可以在這裡添加額外的滾動邏輯
}

// 響應式佈局事件處理器
const handleLayoutChange = (layout: { mode: 'desktop' | 'tablet' | 'mobile'; orientation: string; dimensions: { width: number; height: number } }) => {

  currentLayoutMode.value = layout.mode
  
  // 當佈局改變時，可能需要重新初始化 Swiper
  globalSwiperController.update()
  
  // 觸發相鄰場景預載，因為佈局改變可能影響載入策略
  preloadAdjacentScenes()
}

const handleOrientationChange = (orientation: 'portrait' | 'landscape') => {

  
  // 方向改變時更新 Swiper
  setTimeout(() => {
    globalSwiperController.update()
  }, 300) // 等待 CSS 轉換完成
}

// 鍵盤事件處理（作為備用）
const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      navigatePrev()
      break
    case 'ArrowRight':
      event.preventDefault()
      navigateNext()
      break
  }
}

// 暴露方法供外部使用
defineExpose({
  navigateToScene,
  navigateNext,
  navigatePrev,
  getCurrentSceneIndex: () => currentSceneIndex.value,
  getScenesCount: () => scenes.value.length
})
</script>

<style scoped>
.exhibition-container {
  @apply w-full h-screen overflow-hidden;
}
</style>