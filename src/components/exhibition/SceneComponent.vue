<template>
  <div class="scene-component w-full h-full relative">
    <!-- Loading State -->
    <div 
      v-if="isLoading" 
      class="absolute inset-0 bg-gray-100 flex items-center justify-center z-10"
    >
      <div class="flex flex-col items-center space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="text-gray-600">載入場景中...</p>
      </div>
    </div>

    <!-- Scene Content -->
    <div v-else class="w-full h-full">
      <!-- Image Display -->
      <div class="scene-image-container w-full h-full relative overflow-hidden">
        <img
          ref="sceneImageRef"
          :src="scene.image.url"
          :alt="scene.image.alt"
          :class="[
            'scene-image w-full h-full object-contain transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          ]"
          @load="handleImageLoad"
          @error="handleImageError"
        />
        
        <!-- Image Loading Placeholder -->
        <div 
          v-if="!imageLoaded && !imageError"
          class="absolute inset-0 bg-gray-200 flex items-center justify-center"
        >
          <div class="text-center">
            <div class="animate-pulse bg-gray-300 rounded w-16 h-16 mx-auto mb-2"></div>
            <p class="text-gray-500 text-sm">載入圖片中...</p>
          </div>
        </div>

        <!-- Image Error State -->
        <div 
          v-if="imageError"
          class="absolute inset-0 bg-gray-100 flex items-center justify-center"
        >
          <div class="text-center">
            <div class="text-red-500 text-4xl mb-2">⚠️</div>
            <p class="text-gray-600">圖片載入失敗</p>
            <button 
              @click="retryImageLoad"
              class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              重新載入
            </button>
          </div>
        </div>

        <!-- Scene Metadata Overlay (optional) -->
        <div 
          v-if="scene.metadata && showMetadata"
          class="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-3 rounded-lg max-w-sm"
        >
          <h3 class="font-semibold text-lg mb-1">{{ scene.title }}</h3>
          <div v-if="scene.metadata.artist" class="text-sm opacity-90">
            藝術家: {{ scene.metadata.artist }}
          </div>
          <div v-if="scene.metadata.year" class="text-sm opacity-90">
            年份: {{ scene.metadata.year }}
          </div>
          <div v-if="scene.metadata.medium" class="text-sm opacity-90">
            媒材: {{ scene.metadata.medium }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { Scene } from '@/types'
import { globalImageLoader } from '@/services/ImageLoader'

// Props
interface Props {
  scene: Scene
  isActive?: boolean
  isPreloaded?: boolean
  showMetadata?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
  isPreloaded: false,
  showMetadata: true
})

// Emits
const emit = defineEmits<{
  contentLoaded: [sceneId: string]
  contentUnloaded: [sceneId: string]
  imageLoaded: [sceneId: string]
  imageError: [sceneId: string, error: Event]
}>()

// Reactive state
const isLoading = ref(true)
const imageLoaded = ref(false)
const imageError = ref(false)
const sceneImageRef = ref<HTMLImageElement>()

// Computed properties
// const currentLanguage = computed(() => 'zh') // Default to Chinese, will be managed by parent

// Methods
const loadContent = async (): Promise<void> => {
  try {
    isLoading.value = true
    imageError.value = false
    imageLoaded.value = false
    
    // 直接設置圖片 src，不使用 ImageLoader 的 observe 方法
    // ImageLoader 的延遲載入會在圖片進入視窗時自動處理
    
    // 模擬載入完成，讓頁面可以顯示
    setTimeout(() => {
      if (isLoading.value) {
        isLoading.value = false
      }
    }, 500)
    
    emit('contentLoaded', props.scene.id)
  } catch (error) {
    console.error('Failed to load scene content:', error)
    isLoading.value = false
  }
}

const unloadContent = (): void => {
  imageLoaded.value = false
  imageError.value = false
  isLoading.value = true
  emit('contentUnloaded', props.scene.id)
}

const handleImageLoad = (): void => {
  console.log('Image loaded successfully:', props.scene.image.url)
  imageLoaded.value = true
  imageError.value = false
  isLoading.value = false
  emit('imageLoaded', props.scene.id)
}

const handleImageError = (event: Event): void => {
  console.error('Image failed to load:', props.scene.image.url, event)
  imageLoaded.value = false
  imageError.value = true
  isLoading.value = false
  emit('imageError', props.scene.id, event)
}

const retryImageLoad = async (): Promise<void> => {
  imageError.value = false
  imageLoaded.value = false
  isLoading.value = true
  
  try {
    await globalImageLoader.retryImageLoad(props.scene.image.url, sceneImageRef.value)
  } catch (error) {
    console.error('Retry failed:', error)
    handleImageError(error as Event)
  }
}

// 監聽全域圖片載入事件
const handleGlobalImageLoaded = (event: CustomEvent) => {
  if (event.detail.imageUrl === props.scene.image.url) {
    handleImageLoad()
  }
}

const handleGlobalImageError = (event: CustomEvent) => {
  if (event.detail.imageUrl === props.scene.image.url) {
    handleImageError(event.detail.error)
  }
}

// Watch for scene changes
watch(() => props.scene, (newScene, oldScene) => {
  if (newScene.id !== oldScene?.id) {
    console.log('Scene changed to:', newScene.id)
    loadContent()
  }
}, { immediate: true })

// Watch for active state changes
watch(() => props.isActive, (isActive) => {
  console.log('Scene active state changed:', isActive)
  if (isActive) {
    loadContent()
  }
})

// Lifecycle
onMounted(() => {
  // 註冊全域事件監聽器
  window.addEventListener('image-loaded', handleGlobalImageLoaded as EventListener)
  window.addEventListener('image-error', handleGlobalImageError as EventListener)
  
  if (props.isActive || props.isPreloaded) {
    loadContent()
  }
})

onUnmounted(() => {
  // 清理事件監聽器
  window.removeEventListener('image-loaded', handleGlobalImageLoaded as EventListener)
  window.removeEventListener('image-error', handleGlobalImageError as EventListener)
  
  unloadContent()
})

// Expose methods for parent components
defineExpose({
  loadContent,
  unloadContent,
  handleImageLoad,
  retryImageLoad
})
</script>

<style scoped>
.scene-component {
  /* Ensure proper aspect ratio handling */
  min-height: 0;
}

.scene-image-container {
  /* Ensure images maintain aspect ratio */
  display: flex;
  align-items: center;
  justify-content: center;
}

.scene-image {
  /* Prevent image distortion */
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .scene-image {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
}
</style>