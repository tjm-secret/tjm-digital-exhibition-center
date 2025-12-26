import { ref, computed, watch } from 'vue'
import { audioManager } from '@/services/AudioManager'
import type { Scene } from '@/types'

export interface AudioGuideState {
  currentLanguage: string
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  volume: number
  progress: number
  errorMessage: string
}

export function useAudioGuide(defaultLanguage: string = 'zh') {
  // 響應式狀態
  const currentLanguage = ref<string>(defaultLanguage)
  const isPlaying = ref<boolean>(false)
  const isLoading = ref<boolean>(false)
  const currentTime = ref<number>(0)
  const duration = ref<number>(0)
  const volume = ref<number>(0.8)
  const errorMessage = ref<string>('')
  const currentScene = ref<Scene | null>(null)

  // 計算屬性
  const progress = computed(() => {
    return duration.value > 0 ? currentTime.value / duration.value : 0
  })

  const availableLanguages = computed(() => {
    if (!currentScene.value?.audio) return [defaultLanguage]
    return Object.keys(currentScene.value.audio)
  })

  const hasAudio = computed(() => {
    return currentScene.value?.audio && currentLanguage.value in currentScene.value.audio
  })

  const currentDescription = computed(() => {
    if (!currentScene.value?.description) return ''
    return currentScene.value.description[currentLanguage.value] || 
           currentScene.value.description[defaultLanguage] || 
           Object.values(currentScene.value.description)[0] || ''
  })

  // 狀態管理
  const state = computed<AudioGuideState>(() => ({
    currentLanguage: currentLanguage.value,
    isPlaying: isPlaying.value,
    isLoading: isLoading.value,
    currentTime: currentTime.value,
    duration: duration.value,
    volume: volume.value,
    progress: progress.value,
    errorMessage: errorMessage.value
  }))

  // 語言切換時的進度保存
  let savedProgress = 0

  // 初始化
  const initialize = (): (() => void) => {
    // 註冊回調
    audioManager.onProgress(handleProgress)
    audioManager.onLoad(handleLoad)
    
    // 設定初始音量
    audioManager.setVolume(volume.value)
    
    // 定期更新播放狀態
    const interval = setInterval(updatePlaybackState, 100)
    
    // 返回清理函數
    return () => {
      clearInterval(interval)
      audioManager.offProgress(handleProgress)
      audioManager.offLoad(handleLoad)
    }
  }

  // Helper to safely get audio file
  const getAudioFile = (scene: Scene, lang: string) => {
    return scene.audio?.[lang]
  }

  // 音訊控制方法
  const playAudio = async (): Promise<void> => {
    if (!hasAudio.value || !currentScene.value) return

    try {
      const audioFile = getAudioFile(currentScene.value, currentLanguage.value)
      if (!audioFile) throw new Error('Audio file not found')
      
      await audioManager.playAudio(audioFile.url, currentLanguage.value)
      
      // 如果有保存的進度，跳轉到該位置
      if (savedProgress > 0) {
        audioManager.seek(savedProgress * duration.value)
        savedProgress = 0
      }
    } catch (error) {
      console.error('播放音訊失敗:', error)
      errorMessage.value = '播放音訊失敗，請檢查網路連線或重試'
      throw error
    }
  }

  // Helper functions
  const handleProgress = (val: number) => {
    if (duration.value > 0) {
      currentTime.value = val * duration.value
    }
  }

  const handleLoad = (success: boolean) => {
    isLoading.value = false
    if (!success) errorMessage.value = 'Failed to load audio'
  }

  const updatePlaybackState = () => {
    isPlaying.value = audioManager.isPlaying()
    currentTime.value = audioManager.getCurrentTime()
    duration.value = audioManager.getDuration()
  }

  // Implementation of missing methods
  const pauseAudio = () => audioManager.pauseAudio()
  
  const stopAudio = () => {
    audioManager.stopAudio()
    currentTime.value = 0
    isPlaying.value = false
    savedProgress = 0
  }

  const togglePlayPause = async () => {
    if (isPlaying.value) {
      pauseAudio()
    } else {
      await playAudio()
    }
  }

  const replayAudio = async () => {
    stopAudio()
    await playAudio()
  }

  const setVolume = (val: number) => {
    volume.value = val
    audioManager.setVolume(val)
  }

  const seekTo = (time: number) => {
    audioManager.seek(time)
    currentTime.value = time
  }

  const seekToProgress = (pct: number) => {
    if (duration.value > 0) {
      seekTo(pct * duration.value)
    }
  }

  const switchLanguage = async (lang: string) => {
    if (lang === currentLanguage.value) return
    
    // Save progress
    if (duration.value > 0) {
      savedProgress = currentTime.value / duration.value
    }
    
    currentLanguage.value = lang
    
    if (isPlaying.value) {
      await playAudio()
    }
  }

  const loadScene = (scene: Scene) => {
    currentScene.value = scene
    stopAudio()
  }

  const preloadLanguages = async (scene: Scene) => {
    // preload logic
  }

  const retryLoad = async () => {
    await playAudio()
  }
  
  // Clean up
  const cleanup = (): void => {
    audioManager.cleanup()
  }

  return {
    // 狀態
    state,
    currentLanguage: computed(() => currentLanguage.value),
    isPlaying: computed(() => isPlaying.value),
    isLoading: computed(() => isLoading.value),
    currentTime: computed(() => currentTime.value),
    duration: computed(() => duration.value),
    volume: computed(() => volume.value),
    progress,
    errorMessage: computed(() => errorMessage.value),
    availableLanguages,
    hasAudio,
    currentDescription,
    currentScene: computed(() => currentScene.value),

    // 方法
    playAudio,
    pauseAudio,
    stopAudio,
    togglePlayPause,
    replayAudio,
    setVolume,
    seekTo,
    seekToProgress,
    switchLanguage,
    loadScene,
    preloadLanguages,
    retryLoad,
    initialize,
    cleanup
  }
}