<template>
  <div class="audio-guide-component flex flex-col gap-4">
    <!-- Audio Player Control -->
    <div v-if="hasAudio" class="flex-shrink-0">
      <AudioPlayer
        :is-playing="isPlaying"
        :current-time="currentTime"
        :duration="duration"
        :title="getLocalizedText(scene?.title, currentLanguage)"
        :is-muted="volume === 0"
        @play="handlePlay"
        @pause="handlePause"
        @seek="handleSeek"
        @toggle-mute="toggleMute"
      />
    </div>

    <!-- Text Information -->
    <ExhibitionTextInfo
      class=""
      :title="getLocalizedText(scene?.title, currentLanguage)"
      :description="getLocalizedText(scene?.description, currentLanguage)"
      :artist="scene?.metadata?.artist"
      :year="scene?.metadata?.year"
      :medium="scene?.metadata?.medium"
    />

    <!-- Error Message -->
    <div v-if="errorMessage" class="error-message mt-2 p-3 bg-red-900/20 border border-red-800/50 rounded-lg flex items-center justify-between">
      <p class="text-red-400 text-xs flex items-center">
        <span class="mr-2">⚠️</span> {{ errorMessage }}
      </p>
      <button
        @click="retryLoad"
        class="px-2 py-1 bg-red-800/30 text-red-200 text-xs rounded hover:bg-red-800/50 transition-colors border border-red-800/50"
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
import AudioPlayer from './AudioPlayer.vue'
import ExhibitionTextInfo from './ExhibitionTextInfo.vue'

interface Props {
  scene: Scene | null
  defaultLanguage?: string
  layoutMode?: 'desktop' | 'tablet' | 'mobile'
}

const props = withDefaults(defineProps<Props>(), {
  defaultLanguage: 'zh',
  layoutMode: 'desktop'
})

// State
const currentLanguage = ref<string>(props.defaultLanguage)
const isLoading = ref<boolean>(false)
const isPlaying = ref<boolean>(false)
const currentTime = ref<number>(0)
const duration = ref<number>(0)
const volume = ref<number>(0.8)
const errorMessage = ref<string>('')
const savedProgress = ref<number>(0)

// Computed
const hasAudio = computed(() => {
  return props.scene?.audio && currentLanguage.value in props.scene.audio
})

// Methods
const handlePlay = async () => {
  if (!hasAudio.value) return

  try {
    const audioFile = props.scene?.audio?.[currentLanguage.value]
    if (!audioFile) throw new Error('Audio not found')
    
    await audioManager.playAudio(audioFile.url, currentLanguage.value)
    
    // Restore progress if saved
    if (savedProgress.value > 0) {
      audioManager.seek(savedProgress.value * duration.value)
      savedProgress.value = 0
    }
  } catch (error) {
    console.error('Play failed:', error)
    errorMessage.value = '播放失敗'
  }
}

const handlePause = () => {
  audioManager.pauseAudio()
}

const handleSeek = (time: number) => {
  audioManager.seek(time)
}

const toggleMute = () => {
  if (volume.value > 0) {
    volume.value = 0
    audioManager.setVolume(0)
  } else {
    volume.value = 0.8
    audioManager.setVolume(0.8)
  }
}

const retryLoad = async () => {
  errorMessage.value = ''
  if (hasAudio.value) {
    try {
      const audioFile = props.scene?.audio?.[currentLanguage.value]
      if (audioFile) {
        await audioManager.loadAudio(audioFile.url, currentLanguage.value)
      }
    } catch (e) {
      errorMessage.value = '載入失敗'
    }
  }
}

// Watchers
watch(() => props.defaultLanguage, (newLang) => {
  if (newLang !== currentLanguage.value) {
    currentLanguage.value = newLang
  }
})


watch(() => props.scene, async (newScene) => {
  audioManager.stopAudio()
  savedProgress.value = 0
  errorMessage.value = ''
  
  if (newScene) {
    // Determine language (reuse existing logic or simplify)
    // Here we just keep currentLanguage if valid, or switch
     const available = Object.keys(newScene.audio || {})
     if (!available.includes(currentLanguage.value) && available.length > 0) {
       // Ensure we always assign a string
       currentLanguage.value = available.includes(props.defaultLanguage) 
         ? props.defaultLanguage 
         : (available[0] || props.defaultLanguage)
     }
  }
}, { immediate: true })

// Audio Manager Events
const updateState = () => {
  isPlaying.value = audioManager.isPlaying()
  currentTime.value = audioManager.getCurrentTime()
  duration.value = audioManager.getDuration()
}

onMounted(() => {
  audioManager.setVolume(volume.value)
  const interval = setInterval(updateState, 100)
  onUnmounted(() => clearInterval(interval))
})
</script>

<style scoped>
/* Scoped styles if needed */
</style>