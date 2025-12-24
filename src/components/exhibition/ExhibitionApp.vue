<template>
  <div class="exhibition-container">
    <!-- Swiper 容器 -->
    <div ref="swiperContainer" class="swiper w-full" style="height: calc(100vh - 4rem);">
      <div class="swiper-wrapper">
        <div
          v-for="(scene, index) in scenes"
          :key="scene.id"
          class="swiper-slide"
        >
          <!-- 桌面版：左右分欄 -->
          <div class="hidden lg:flex" style="height: calc(100vh - 4rem);">
            <div class="lg:w-2/3 xl:w-3/4">
              <SceneComponent
                :scene="scene"
                :is-active="index === currentSceneIndex"
                @content-loaded="handleContentLoaded"
                @image-loaded="handleImageLoaded"
                @image-error="handleImageError"
              />
            </div>
            <div class="lg:w-1/3 xl:w-1/4 bg-gray-50 p-4 overflow-y-auto">
              <!-- Audio Guide Component -->
              <AudioGuideComponent
                :scene="scene"
                :default-language="'zh'"
              />
            </div>
          </div>
          
          <!-- 行動版：上下堆疊 -->
          <div class="lg:hidden flex flex-col h-screen">
            <div class="flex-1 md:h-3/5">
              <SceneComponent
                :scene="scene"
                :is-active="index === currentSceneIndex"
                @content-loaded="handleContentLoaded"
                @image-loaded="handleImageLoaded"
                @image-error="handleImageError"
              />
            </div>
            <div class="h-2/5 md:h-2/5 bg-gray-50 p-4 overflow-y-auto">
              <!-- Audio Guide Component -->
              <AudioGuideComponent
                :scene="scene"
                :default-language="'zh'"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 底部導覽列 -->
    <NavigationComponent
      :scenes="scenes"
      :current-index="currentSceneIndex"
      :show-thumbnails="false"
      @scene-selected="navigateToScene"
      @navigation-scroll="handleNavigationScroll"
    />
    
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
import type { Scene } from '@/types'
import SceneComponent from './SceneComponent.vue'
import NavigationComponent from './NavigationComponent.vue'
import AudioGuideComponent from './AudioGuideComponent.vue'
import { globalImageLoader } from '@/services/ImageLoader'
import { globalSwiperController } from '@/services/SwiperController'

// 基本狀態管理
const scenes = ref<Scene[]>([])
const currentSceneIndex = ref(0)
const swiperContainer = ref<HTMLElement>()
const boundaryMessage = ref('')
const showBoundaryHint = ref(false)

// 計算屬性
const currentScene = computed(() => {
  return scenes.value[currentSceneIndex.value] || null
})

// 基本方法定義
const initializeExhibition = async () => {
  console.log('Initializing exhibition...')
  // 載入示例場景數據
  loadSampleScenes()
  
  // 等待 DOM 更新後初始化 Swiper
  await nextTick()
  initializeSwiper()
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
    console.log(`Swiper slide changed to: ${index}`)
    currentSceneIndex.value = index
  })
  
  globalSwiperController.onReachBeginning(() => {
    console.log('Reached beginning of exhibition')
    showBoundaryMessage('已到達第一個場景')
  })
  
  globalSwiperController.onReachEnd(() => {
    console.log('Reached end of exhibition')
    showBoundaryMessage('已到達最後一個場景')
  })
  
  // 設置邊界嘗試回調
  globalSwiperController.onBoundaryAttempt((direction: 'prev' | 'next') => {
    const message = direction === 'prev' ? '已在第一個場景' : '已在最後一個場景'
    showBoundaryMessage(message)
  })
}

const loadSampleScenes = () => {
  // 示例場景數據
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

const navigateToScene = (index: number) => {
  if (index >= 0 && index < scenes.value.length) {
    console.log(`Navigating to scene ${index}`)
    
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
    console.log('Cannot navigate to next scene - already at end or transitioning')
  }
}

const navigatePrev = () => {
  const success = globalSwiperController.slidePrev()
  if (!success) {
    console.log('Cannot navigate to previous scene - already at beginning or transitioning')
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
  console.log('Preloading adjacent scenes...')
  // 使用 ImageLoader 預載相鄰場景
  globalImageLoader.preloadAdjacentScenes(currentSceneIndex.value, scenes.value)
}

// 監聽場景變化，觸發預載
watch(currentSceneIndex, () => {
  preloadAdjacentScenes()
})

// 事件處理器
const handleContentLoaded = (sceneId: string) => {
  console.log(`Content loaded for scene: ${sceneId}`)
}

const handleImageLoaded = (sceneId: string) => {
  console.log(`Image loaded for scene: ${sceneId}`)
}

const handleImageError = (sceneId: string, error: Event) => {
  console.error(`Image error for scene ${sceneId}:`, error)
}

const handleNavigationScroll = (direction: 'left' | 'right') => {
  console.log(`Navigation scroll: ${direction}`)
  // 可以在這裡添加額外的滾動邏輯
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

onMounted(() => {
  initializeExhibition()
  // 添加鍵盤事件監聽器作為備用
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  // 清理 Swiper 實例
  globalSwiperController.destroySwiper()
  // 移除鍵盤事件監聽器
  document.removeEventListener('keydown', handleKeydown)
})

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