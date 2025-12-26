<template>
  <div class="navigation-container pb-6 pt-12 bg-linear-to-t from-black/90 to-transparent pointer-events-none transition-opacity duration-700">
    <div class="pointer-events-auto relative max-w-4xl mx-auto px-4">


      <!-- Mac Dock Style Navigation -->
         <div 
           ref="dockWrapper"
           class="flex items-end justify-center pb-6 min-h-[100px]"
           @mousemove="handleMouseMove"
           @mouseleave="handleMouseLeave"
         >
           <div 
             class="px-4 py-2 flex items-end justify-center gap-2 transition-all duration-300 ease-out"
             :class="{ 'opacity-0 translate-y-10': !scenes.length }"
           >
             <div 
               class="flex items-end gap-1 sm:gap-2 h-10 px-2"
             >
               <button
                 v-for="(scene, index) in scenes"
                 :key="scene.id"
                 @click="handleSceneClick(index)"
                 class="group relative flex flex-col items-center justify-end transition-all duration-75 ease-out origin-bottom pointer-events-auto"
                 :style="getItemStyle(index)"
                 :aria-label="`Jump to scene ${index + 1}`"
               >
                  <!-- Tooltip (Only visible when magnified/hovered) -->
                  <div 
                    class="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 pointer-events-none px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-[10px] text-gold border border-gold/20"
                    :style="{ transform: 'scale(' + (1 / (getItemStyle(index).transform ? parseFloat(getItemStyle(index).transform!.replace('scale(', '').replace(')', '')) : 1)) + ')' }"
                  >
                    {{ getLocalizedText(scene.title, currentLanguage) }}
                  </div>
                  
                  <!-- Dock Item (Dot/Icon) -->
                  <div 
                    class="w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-[0_4px_6px_rgba(0,0,0,0.3)] transition-colors duration-300"
                    :class="currentIndex === index ? 'bg-gold shadow-[0_0_10px_#CFB53B]' : 'bg-white/40 hover:bg-white/80'"
                  ></div>
                  
                  <!-- Active Indicator (Reflection under the dock item) -->
                   <div 
                     v-if="currentIndex === index" 
                     class="absolute -bottom-2 w-1 h-1 bg-gold/50 rounded-full blur-[2px]"
                   ></div>
               </button>
             </div>
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
  (e: 'jump-animation-start', targetIndex: number): void
  (e: 'jump-animation-end', targetIndex: number): void
}

const emit = defineEmits<Emits>()

// 響應式狀態
const showExpandedThumbnails = ref(false)
const isJumping = ref(false)
const jumpTargetIndex = ref(-1)

// Mouse/Touch Tracking for Dock Effect
const mouseX = ref<number | null>(null)
const dockWrapper = ref<HTMLElement>()

// 方法
const handleSceneClick = async (index: number) => {
  if (index >= 0 && index < props.scenes.length) {
    // 開始跳轉動畫
    isJumping.value = true
    jumpTargetIndex.value = index
    emit('jump-animation-start', index)
    
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

const handleMouseMove = (e: MouseEvent) => {
  if (!dockWrapper.value) return
  const rect = dockWrapper.value.getBoundingClientRect()
  mouseX.value = e.clientX - rect.left
}

const handleMouseLeave = () => {
  mouseX.value = null
}

// Calculate scale for each item based on mouse position
const getItemStyle = (index: number) => {
  const baseScale = 1
  const maxScale = 2.0 // Slightly reduced max magnification for smoother feel
  const range = 150 // Increased range for better proximity detection
  
  if (mouseX.value === null || !dockWrapper.value) {
    return {
      transition: 'all 0.3s ease-out', // Ensure smooth reset
      transform: 'scale(1)',
      margin: '0 4px'
    }
  }

  // Estimate item position dynamically if possible, or use improved estimation
  const itemWidth = 40 // More realistic width including gap
  const totalWidth = props.scenes.length * itemWidth
  const startX = (dockWrapper.value.clientWidth - totalWidth) / 2
  const itemCenter = startX + (index * itemWidth) + (itemWidth / 2)
  
  const distance = Math.abs(mouseX.value - itemCenter)
  
  if (distance < range) {
    // Gaussian-like curve for smoother drop-off
    const scale = baseScale + (maxScale - baseScale) * Math.exp(-Math.pow(distance / (range / 2.5), 2))
    return {
      transform: `scale(${scale})`,
      margin: `0 ${8 * scale}px`, // Dynamic margin based on scale
      zIndex: 10 // Bring magnified items to front
    }
  }
  
  return {
    transform: 'scale(1)',
    margin: '0 4px'
  }
}

const extractScale = (style: any): number => {
  if (!style || !style.transform) return 1
  const match = style.transform.match(/scale\(([\d.]+)\)/)
  return match ? parseFloat(match[1]) : 1
}

onMounted(() => {
  console.log('NavigationComponent mounted')
})

// 暴露方法供父組件使用
defineExpose({
  jumpToScene,
  showThumbnails: showThumbnailsView,
  hideThumbnails: hideThumbnailsView,
  toggleThumbnails: toggleThumbnailsView
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