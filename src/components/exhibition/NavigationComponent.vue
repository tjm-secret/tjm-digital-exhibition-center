<template>
  <div class="navigation-container pb-6 pt-12 bg-linear-to-t from-black/90 to-transparent pointer-events-none transition-opacity duration-700">
    <div class="pointer-events-auto relative max-w-4xl mx-auto px-4">
      <!-- 滾動控制按鈕 (僅在有溢出時顯示) -->
      <div v-if="hasOverflow" class="absolute left-0 top-1/2 transform -translate-y-1/2 z-20">
        <button
          v-if="canScrollLeft"
          @click="scrollLeft"
          class="w-8 h-8 rounded-full bg-black/40 hover:bg-gold/80 text-white hover:text-black border border-white/20 hover:border-gold transition-all duration-300 items-center justify-center backdrop-blur-xs hidden sm:flex"
          aria-label="向左滾動導覽列"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
      </div>
      
      <div v-if="hasOverflow" class="absolute right-0 top-1/2 transform -translate-y-1/2 z-20">
        <button
          v-if="canScrollRight"
          @click="scrollRight"
          class="w-8 h-8 rounded-full bg-black/40 hover:bg-gold/80 text-white hover:text-black border border-white/20 hover:border-gold transition-all duration-300 items-center justify-center backdrop-blur-xs hidden sm:flex"
          aria-label="向右滾動導覽列"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>

      <!-- 基本導覽列 -->
      <div class="flex items-center justify-center py-4">
        <div 
          ref="navigationScrollContainer"
          class="flex items-center gap-4 px-6 py-3 glass-pill"
          :class="{ 
            'overflow-x-auto max-w-[80vw] justify-start': hasOverflow,
            'justify-center': !hasOverflow
          }"
          @scroll="handleScroll"
        >
          <button
            v-for="(scene, index) in scenes"
            :key="scene.id"
            ref="navigationItems"
            @click="handleSceneClick(index)"
            :class="[
              'navigation-item flex-shrink-0 transition-all duration-500 ease-out group relative',
              'flex items-center justify-center',
              'w-4 h-4 sm:min-w-0 sm:h-auto min-w-[50px] h-[40px] sm:min-w-auto sm:h-auto', // Mobile: larger touch area, Desktop: standard
            ]"
            :aria-label="`跳轉到場景 ${index + 1}: ${getLocalizedText(scene.title, currentLanguage)}`"
            :aria-current="currentIndex === index ? 'true' : 'false'"
          >
            <!-- 連結線 (裝飾) - 僅在非溢出模式下顯示 -->
            <div 
               v-if="!hasOverflow && index < scenes.length - 1"
               class="absolute left-1/2 top-1/2 h-px bg-white/10 -z-10"
               style="left: 100%; width: 1rem;"
            ></div>

            <!-- 純點點模式 - Gold Leaf Style -->
            <div 
              :class="[
                'rounded-full transition-all duration-500 relative',
                currentIndex === index 
                  ? 'w-2.5 h-2.5 bg-gold shadow-[0_0_8px_#CFB53B]' 
                  : 'w-1.5 h-1.5 bg-white/40 group-hover:bg-white/80 group-hover:scale-125'
              ]"
            >
               <!-- Active Indicator Ring -->
               <div v-if="currentIndex === index" class="absolute -inset-1.5 border border-gold/40 rounded-full"></div>
            </div>
            
            <!-- Tooltip on hover -->
            <div class="absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              <span class="bg-black/90 text-gold text-xs px-3 py-1.5 rounded-sm border border-gold/20 backdrop-blur-md font-serif tracking-widest min-w-max shadow-xl">
                {{ getLocalizedText(scene.title, currentLanguage) }}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import type { Scene } from '@/types'
import { getLocalizedText } from '@/utils/i18n'

// Props
interface Props {
  scenes: Scene[]
  currentIndex: number
  showThumbnails?: boolean
  currentLanguage?: string
}

const props = withDefaults(defineProps<Props>(), {
  showThumbnails: false,
  currentLanguage: 'zh'
})

// Emits
interface Emits {
  (e: 'scene-selected', index: number): void
  (e: 'navigation-scroll', direction: 'left' | 'right'): void
  (e: 'jump-animation-start', targetIndex: number): void
  (e: 'jump-animation-end', targetIndex: number): void
}

const emit = defineEmits<Emits>()

// 響應式狀態
const showExpandedThumbnails = ref(false)
const navigationContainer = ref<HTMLElement>()
const navigationScrollContainer = ref<HTMLElement>()
const navigationItems = ref<HTMLElement[]>([])
const isJumping = ref(false)
const jumpTargetIndex = ref(-1)
const scrollPosition = ref(0)

// 計算屬性
const hasOverflow = computed(() => {
  return props.scenes.length > 8 // 調整溢出判斷，讓小數量的場景也能正常顯示
})

const canScrollLeft = computed(() => {
  return scrollPosition.value > 0
})

const canScrollRight = computed(() => {
  if (!navigationScrollContainer.value) return false
  const container = navigationScrollContainer.value
  return scrollPosition.value < (container.scrollWidth - container.clientWidth)
})

// 方法
const handleSceneClick = async (index: number) => {
  if (index >= 0 && index < props.scenes.length) {
    // 開始跳轉動畫
    isJumping.value = true
    jumpTargetIndex.value = index
    emit('jump-animation-start', index)
    
    // 先滾動到目標項目
    await scrollToItem(index)
    
    // 延遲一點時間讓動畫效果更明顯
    setTimeout(() => {
      emit('scene-selected', index)
      
      // 結束跳轉動畫
      setTimeout(() => {
        isJumping.value = false
        jumpTargetIndex.value = -1
        emit('jump-animation-end', index)
      }, 300)
    }, 150)
  }
}

const jumpToScene = (index: number) => {
  handleSceneClick(index)
}

const showThumbnailsView = () => {
  showExpandedThumbnails.value = true
}

const hideThumbnailsView = () => {
  showExpandedThumbnails.value = false
}

const toggleThumbnailsView = () => {
  showExpandedThumbnails.value = !showExpandedThumbnails.value
}

// 滾動相關方法
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  scrollPosition.value = target.scrollLeft
  
  // 發出滾動方向事件
  const direction = scrollPosition.value > (target.scrollWidth / 2) ? 'right' : 'left'
  emit('navigation-scroll', direction)
}

const scrollToItem = async (index: number) => {
  await nextTick()
  
  const container = navigationScrollContainer.value
  const items = navigationItems.value
  
  if (!container || !items || !items[index]) return
  
  const targetItem = items[index]
  const containerWidth = container.clientWidth
  const itemLeft = targetItem.offsetLeft
  const itemWidth = targetItem.offsetWidth
  
  // 計算滾動位置，讓目標項目居中
  const scrollLeft = itemLeft - (containerWidth / 2) + (itemWidth / 2)
  
  container.scrollTo({
    left: Math.max(0, scrollLeft),
    behavior: 'smooth'
  })
}

// 滾動到當前場景的導覽項目
const scrollToCurrentItem = async () => {
  await scrollToItem(props.currentIndex)
}

// 手動滾動控制
const scrollLeft = () => {
  const container = navigationScrollContainer.value
  if (!container) return
  
  const scrollAmount = container.clientWidth * 0.8
  container.scrollTo({
    left: container.scrollLeft - scrollAmount,
    behavior: 'smooth'
  })
}

const scrollRight = () => {
  const container = navigationScrollContainer.value
  if (!container) return
  
  const scrollAmount = container.clientWidth * 0.8
  container.scrollTo({
    left: container.scrollLeft + scrollAmount,
    behavior: 'smooth'
  })
}

// 監聽當前索引變化，自動滾動到對應位置
watch(() => props.currentIndex, () => {
  if (hasOverflow.value) {
    scrollToCurrentItem()
  }
}, { immediate: true })

// 監聽場景數量變化，重新計算溢出狀態
watch(() => props.scenes.length, () => {
  nextTick(() => {
    if (navigationScrollContainer.value) {
      scrollPosition.value = navigationScrollContainer.value.scrollLeft
    }
  })
})

// 組件掛載後初始化滾動位置
onMounted(() => {
  console.log('NavigationComponent mounted with scenes:', props.scenes.length)
  console.log('Current index:', props.currentIndex)
  console.log('Show thumbnails:', props.showThumbnails)
  nextTick(() => {
    scrollToCurrentItem()
  })
})

// 暴露方法供父組件使用
defineExpose({
  jumpToScene,
  showThumbnails: showThumbnailsView,
  hideThumbnails: hideThumbnailsView,
  toggleThumbnails: toggleThumbnailsView,
  scrollToCurrentItem,
  scrollLeft,
  scrollRight,
  canScrollLeft,
  canScrollRight
})
</script>

<style scoped>
.navigation-container {
  /* 確保導覽列在最上層 */
  z-index: 100;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
}

.navigation-item {
  /* 防止按鈕被壓縮 */
  flex-shrink: 0;
  /* 添加更流暢的動畫 */
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.navigation-item:hover {
  /* 懸停時的微妙動畫 */
  transform: translateY(-2px);
}

.navigation-item.scale-110 {
  /* 當前項目的放大效果 */
  transform: scale(1.1) translateY(-2px);
}

.expanded-thumbnails {
  /* 最大高度限制，避免佔用太多空間 */
  max-height: 40vh;
  overflow-y: auto;
}

.thumbnail-item {
  /* 相對定位以支援絕對定位的標題 */
  position: relative;
}

/* 滾動條樣式優化 */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 跳轉動畫 */
@keyframes jump-pulse {
  0%, 100% {
    transform: scale(1.1) translateY(-2px);
  }
  50% {
    transform: scale(1.2) translateY(-4px);
  }
}

.animate-pulse {
  animation: jump-pulse 0.6s ease-in-out;
}

/* 滾動按鈕動畫 */
.scroll-button {
  transition: all 0.2s ease-in-out;
}

.scroll-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 平滑滾動增強 */
.scroll-smooth {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* 滾動容器的漸變遮罩效果 */
.navigation-scroll-container {
  position: relative;
}

.navigation-scroll-container::before,
.navigation-scroll-container::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 20px;
  pointer-events: none;
  z-index: 10;
}

.navigation-scroll-container::before {
  left: 0;
  background: linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
}

.navigation-scroll-container::after {
  right: 0;
  background: linear-gradient(to left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
}
</style>