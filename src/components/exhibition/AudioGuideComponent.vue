<template>
  <div class="audio-guide">
    <!-- 語言選擇器 -->
    <LanguageSwitcher
      v-model="currentLanguage"
      :available-languages="availableLanguages"
      :default-language="defaultLanguage"
      @language-changed="handleLanguageChange"
    />

    <!-- 音訊控制面板 -->
    <div class="audio-controls bg-gray-50 rounded-lg p-4 mb-4">
      <!-- 載入狀態 -->
      <div v-if="isLoading" class="flex items-center justify-center py-4">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span class="ml-2 text-sm text-gray-600">載入音訊中...</span>
      </div>

      <!-- 音訊控制按鈕 -->
      <div v-else class="audio-player">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-2">
            <!-- 播放/暫停按鈕 -->
            <button
              @click="togglePlayPause"
              :disabled="!hasAudio"
              class="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white transition-colors"
            >
              <svg v-if="!isPlaying" class="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 5v10l8-5-8-5z"/>
              </svg>
              <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z"/>
              </svg>
            </button>

            <!-- 停止按鈕 -->
            <button
              @click="stopAudio"
              :disabled="!hasAudio"
              class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white transition-colors"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4h12v12H4V4z"/>
              </svg>
            </button>

            <!-- 重播按鈕 -->
            <button
              @click="replayAudio"
              :disabled="!hasAudio"
              class="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white transition-colors"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1z"/>
              </svg>
            </button>
          </div>

          <!-- 音量控制 -->
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.793a1 1 0 011.617.793z"/>
              <path d="M12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"/>
            </svg>
            <input
              v-model="volume"
              @input="handleVolumeChange"
              type="range"
              min="0"
              max="1"
              step="0.1"
              class="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <!-- 進度條 -->
        <div class="progress-container">
          <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 cursor-pointer" @click="handleProgressClick">
            <div
              class="bg-blue-500 h-2 rounded-full transition-all duration-100"
              :style="{ width: `${progress * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 文字內容顯示 -->
    <div class="text-content bg-white rounded-lg p-4 border border-gray-200">
      <h3 class="text-lg font-semibold mb-2 text-gray-800">
        {{ scene?.title || '場景標題' }}
      </h3>
      <div class="text-content-body">
        <p class="text-gray-700 leading-relaxed">
          {{ currentDescription }}
        </p>
      </div>
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="errorMessage" class="error-message mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-red-700 text-sm">{{ errorMessage }}</p>
      <button
        @click="retryLoad"
        class="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
      >
        重試
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { audioManager } from '@/services/AudioManager'
import type { Scene } from '@/types'
import LanguageSwitcher from './LanguageSwitcher.vue'

interface Props {
  scene: Scene | null
  defaultLanguage?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultLanguage: 'zh'
})

// 響應式狀態
const currentLanguage = ref<string>(props.defaultLanguage)
const isLoading = ref<boolean>(false)
const isPlaying = ref<boolean>(false)
const currentTime = ref<number>(0)
const duration = ref<number>(0)
const volume = ref<number>(0.8)
const errorMessage = ref<string>('')
const savedProgress = ref<number>(0) // 保存切換語言時的進度

// 計算屬性
const availableLanguages = computed(() => {
  if (!props.scene?.audio) return [props.defaultLanguage]
  return Object.keys(props.scene.audio)
})

const hasAudio = computed(() => {
  return props.scene?.audio && currentLanguage.value in props.scene.audio
})

const currentDescription = computed(() => {
  if (!props.scene?.description) return ''
  return props.scene.description[currentLanguage.value] || 
         props.scene.description[props.defaultLanguage] || 
         Object.values(props.scene.description)[0] || ''
})

const progress = computed(() => {
  return duration.value > 0 ? currentTime.value / duration.value : 0
})

// 音訊控制方法
const togglePlayPause = async () => {
  if (!hasAudio.value) return

  try {
    if (isPlaying.value) {
      audioManager.pauseAudio()
    } else {
      const audioFile = props.scene!.audio[currentLanguage.value]
      await audioManager.playAudio(audioFile.url, currentLanguage.value)
      
      // 如果有保存的進度，跳轉到該位置
      if (savedProgress.value > 0) {
        audioManager.seek(savedProgress.value * duration.value)
        savedProgress.value = 0
      }
    }
  } catch (error) {
    console.error('播放音訊失敗:', error)
    errorMessage.value = '播放音訊失敗，請檢查網路連線或重試'
  }
}

const stopAudio = () => {
  audioManager.stopAudio()
  savedProgress.value = 0
}

const replayAudio = async () => {
  if (!hasAudio.value) return
  
  try {
    audioManager.stopAudio()
    const audioFile = props.scene!.audio[currentLanguage.value]
    await audioManager.playAudio(audioFile.url, currentLanguage.value)
  } catch (error) {
    console.error('重播音訊失敗:', error)
    errorMessage.value = '重播音訊失敗，請重試'
  }
}

const handleVolumeChange = () => {
  audioManager.setVolume(volume.value)
}

const handleProgressClick = (event: MouseEvent) => {
  if (!hasAudio.value || duration.value === 0) return
  
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const newProgress = clickX / rect.width
  const newTime = newProgress * duration.value
  
  audioManager.seek(newTime)
}

const handleLanguageChange = async (newLanguage: string) => {
  if (!props.scene?.audio || !(newLanguage in props.scene.audio)) return

  // 保存當前播放進度
  if (isPlaying.value) {
    savedProgress.value = progress.value
    audioManager.pauseAudio()
  }

  currentLanguage.value = newLanguage
  errorMessage.value = ''

  // 預載新語言的音訊
  try {
    isLoading.value = true
    const audioFile = props.scene.audio[newLanguage]
    await audioManager.loadAudio(audioFile.url, newLanguage)
  } catch (error) {
    console.error('載入新語言音訊失敗:', error)
    errorMessage.value = '載入音訊失敗，請檢查網路連線'
  } finally {
    isLoading.value = false
  }
}

const retryLoad = async () => {
  if (!hasAudio.value) return
  
  errorMessage.value = ''
  isLoading.value = true
  
  try {
    const audioFile = props.scene!.audio[currentLanguage.value]
    await audioManager.loadAudio(audioFile.url, currentLanguage.value)
  } catch (error) {
    console.error('重試載入失敗:', error)
    errorMessage.value = '載入失敗，請檢查網路連線'
  } finally {
    isLoading.value = false
  }
}

// 工具函數
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 更新播放狀態
const updatePlaybackState = () => {
  isPlaying.value = audioManager.isPlaying()
  currentTime.value = audioManager.getCurrentTime()
  duration.value = audioManager.getDuration()
}

// 進度回調
const handleProgress = (progressValue: number) => {
  if (!isPlaying.value) return
  currentTime.value = progressValue * duration.value
}

// 載入回調
const handleLoad = (success: boolean) => {
  isLoading.value = false
  if (!success) {
    errorMessage.value = '音訊載入失敗'
  } else {
    updatePlaybackState()
  }
}

// 監聽場景變化
watch(() => props.scene, async (newScene) => {
  if (!newScene) return

  // 停止當前播放
  audioManager.stopAudio()
  savedProgress.value = 0
  errorMessage.value = ''

  // 重置語言為預設語言或第一個可用語言
  const availableLangs = Object.keys(newScene.audio || {})
  if (availableLangs.length > 0) {
    const preferredLang = availableLangs.includes(props.defaultLanguage) 
      ? props.defaultLanguage 
      : availableLangs[0]
    currentLanguage.value = preferredLang
  }

  // 預載當前語言的音訊
  if (hasAudio.value) {
    try {
      isLoading.value = true
      const audioFile = newScene.audio[currentLanguage.value]
      await audioManager.loadAudio(audioFile.url, currentLanguage.value)
    } catch (error) {
      console.error('預載音訊失敗:', error)
      errorMessage.value = '載入音訊失敗'
    } finally {
      isLoading.value = false
    }
  }
}, { immediate: true })

// 組件生命週期
onMounted(() => {
  // 註冊回調
  audioManager.onProgress(handleProgress)
  audioManager.onLoad(handleLoad)
  
  // 設定初始音量
  audioManager.setVolume(volume.value)
  
  // 定期更新播放狀態
  const interval = setInterval(updatePlaybackState, 100)
  
  onUnmounted(() => {
    clearInterval(interval)
    audioManager.offProgress(handleProgress)
    audioManager.offLoad(handleLoad)
  })
})
</script>

<style scoped>
.audio-guide {
  @apply w-full;
}

.audio-controls {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-container {
  @apply mt-3;
}

.text-content {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.text-content-body {
  @apply max-h-64 overflow-y-auto;
}

/* 自定義滾動條樣式 */
.text-content-body::-webkit-scrollbar {
  @apply w-2;
}

.text-content-body::-webkit-scrollbar-track {
  @apply bg-gray-100 rounded;
}

.text-content-body::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded hover:bg-gray-400;
}

/* 音量滑桿樣式 */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  @apply w-4 h-4 bg-blue-500 rounded-full cursor-pointer;
}

input[type="range"]::-moz-range-thumb {
  @apply w-4 h-4 bg-blue-500 rounded-full cursor-pointer border-0;
}

/* 進度條點擊區域 */
.progress-container > div:last-child {
  position: relative;
}

.progress-container > div:last-child::after {
  content: '';
  position: absolute;
  top: -4px;
  left: 0;
  right: 0;
  bottom: -4px;
  cursor: pointer;
}
</style>