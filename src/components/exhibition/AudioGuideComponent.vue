<template>
  <div class="audio-guide">
    <!-- 語言選擇器 -->
    

    <!-- 音訊控制面板 (Redesigned) -->
    <div :class="[
      'audio-controls glass-panel rounded-2xl mb-6 hover:bg-black/70',
      layoutMode === 'mobile' ? 'p-4' : 'px-6 py-5'
    ]">
      <!-- 載入狀態 -->
      <div v-if="isLoading" class="flex items-center justify-center py-2 space-x-3">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-gold"></div>
        <span class="text-gold/80 text-sm font-serif tracking-widest">LOADING...</span>
      </div>

      <!-- 音訊播放器 -->
      <div v-else class="audio-player flex flex-col gap-4">
        <!-- 上半部：控制按鈕與資訊 -->
        <div class="flex items-center justify-between">
          <!-- 左側：播放控制 -->
          <div class="flex items-center gap-4">
            <button
              @click="togglePlayPause"
              :disabled="!hasAudio"
              :class="[
                'play-btn btn-gold flex items-center justify-center rounded-full',
                layoutMode === 'mobile' ? 'w-10 h-10' : 'w-12 h-12'
              ]"
            >
              <svg v-if="!isPlaying" class="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            </button>
            
            <button
              @click="replayAudio"
              :disabled="!hasAudio"
              class="btn-icon"
              title="重播"
            >
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
               </svg>
            </button>
          </div>

          <!-- 右側：音量 (Desktop) -->
          <div v-if="layoutMode !== 'mobile'" class="flex items-center gap-2 group">
             <button 
              class="text-zinc-500 group-hover:text-gold transition-colors"
              @click="volume = volume === 0 ? 0.8 : 0"
            >
              <svg v-if="volume > 0" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5.232v13.536c0 1.123-1.077 1.569-1.707.941L5.586 15z"/>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5.232v13.536c0 1.123-1.077 1.569-1.707.941L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/>
              </svg>
            </button>
            <div class="relative w-20 h-1 bg-white/10 rounded-full overflow-hidden group-hover:h-1.5 transition-all">
               <input
                v-model="volume"
                @input="handleVolumeChange"
                type="range"
                min="0"
                max="1"
                step="0.05"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div 
                class="absolute top-0 left-0 h-full bg-gold rounded-full transition-all duration-100"
                :style="{ width: `${volume * 100}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 下半部：進度條 -->
        <div class="flex items-center gap-3 text-xs font-serif text-zinc-500 tracking-wider">
          <span class="w-10 text-right">{{ formatTime(currentTime) }}</span>
          
          <div 
            class="group relative flex-1 h-1 bg-white/10 rounded-full cursor-pointer hover:h-1.5 transition-all duration-300" 
            @click="handleProgressClick"
          >
            <!-- 緩衝/背景 -->
            <div class="absolute inset-0 rounded-full bg-white/5"></div>
            
            <!-- 進度 -->
            <div
              class="absolute top-0 left-0 h-full bg-gold rounded-full transition-all duration-100 relative"
              :style="{ width: `${progress * 100}%` }"
            >
              <!-- 拖曳點 handles -->
               <div class="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-opacity"></div>
            </div>
          </div>
          
          <span class="w-10">{{ formatTime(duration) }}</span>
        </div>
      </div>
    </div>

    <!-- 文字內容顯示 (Gold Leaf Style) -->
    <div :class="[
      'text-content glass-panel rounded-xl flex-1 min-h-0 flex flex-col',
      'border-l-2 border-l-gold',
      layoutMode === 'mobile' ? 'p-4 mb-20' : 'p-6'
    ]">
      <h3 :class="[
        'font-serif text-gold tracking-wider mb-4 flex-shrink-0',
        layoutMode === 'mobile' ? 'text-lg' : 'text-2xl'
      ]">
        {{ getLocalizedText(scene?.title, currentLanguage) || '場景標題' }}
      </h3>
      <div :class="[
        'text-content-body pr-2 overflow-y-auto',
        layoutMode === 'mobile' ? 'flex-1' : 'max-h-[40vh]'
      ]">
        <p :class="[
          'text-gray-300 leading-relaxed font-light tracking-wide whitespace-pre-line',
          layoutMode === 'mobile' ? 'text-sm pb-8' : 'text-base'
        ]">
          {{ getLocalizedText(scene?.description, currentLanguage) }}
        </p>
      </div>
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="errorMessage" class="error-message mt-4 p-4 bg-red-900/20 border border-red-800/50 rounded-lg flex items-center justify-between">
      <p class="text-red-400 text-sm flex items-center">
        <span class="mr-2">⚠️</span> {{ errorMessage }}
      </p>
      <button
        @click="retryLoad"
        class="px-3 py-1 bg-red-800/30 text-red-200 text-xs rounded hover:bg-red-800/50 transition-colors border border-red-800/50"
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
import { getLocalizedText } from '@/utils/i18n'


interface Props {
  scene: Scene | null
  defaultLanguage?: string
  layoutMode?: 'desktop' | 'tablet' | 'mobile'
}

const props = withDefaults(defineProps<Props>(), {
  defaultLanguage: 'zh',
  layoutMode: 'desktop'
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

// 監聽外部語言變化
watch(() => props.defaultLanguage, (newLang) => {
  if (newLang !== currentLanguage.value) {
    handleLanguageChange(newLang)
  }
})

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
      const audioFile = props.scene?.audio?.[currentLanguage.value]
      if (!audioFile) {
        throw new Error('Audio file not found for current language')
      }
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
    const audioFile = props.scene?.audio?.[currentLanguage.value]
    if (!audioFile) {
       throw new Error('Audio file not found')
    }
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
    if (audioFile) {
      await audioManager.loadAudio(audioFile.url, newLanguage)
    }
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
    const audioFile = props.scene?.audio?.[currentLanguage.value]
    if (audioFile) {
      await audioManager.loadAudio(audioFile.url, currentLanguage.value)
    }
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
    
    if (preferredLang) {
      currentLanguage.value = preferredLang
    }
  }

  // 預載當前語言的音訊
  if (hasAudio.value) {
    try {
      isLoading.value = true
      const audioFile = newScene.audio?.[currentLanguage.value]
      if (audioFile) {
        await audioManager.loadAudio(audioFile.url, currentLanguage.value)
      }
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
.text-content-body::-webkit-scrollbar {
  width: 4px;
}

.text-content-body::-webkit-scrollbar-track {
  @apply bg-zinc-800 rounded;
}

.text-content-body::-webkit-scrollbar-thumb {
  @apply bg-zinc-600 rounded hover:bg-gold;
}
</style>