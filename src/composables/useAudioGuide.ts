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

  // 音訊控制方法
  const playAudio = async (): Promise<void> => {
    if (!hasAudio.value) return

    try {
      const audioFile = currentScene.value!.audio[currentLanguage.value]
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

  const pauseAudio = (): void => {
    audioManager.pauseAudio()
  }

  const stopAudio = (): void => {
    audioManager.stopAudio()
    savedProgress = 0
  }

  const togglePlayPause = async (): Promise<void> => {
    if (isPlaying.value) {
      pauseAudio()
    } else {
      await playAudio()
    }
  }

  const replayAudio = async (): Promise<void> => {
    if (!hasAudio.value) return
    
    try {
      stopAudio()
      await playAudio()
    } catch (error) {
      console.error('重播音訊失敗:', error)
      errorMessage.value = '重播音訊失敗，請重試'
      throw error
    }
  }

  const setVolume = (newVolume: number): void => {
    volume.value = Math.max(0, Math.min(1, newVolume))
    audioManager.setVolume(volume.value)
  }

  const seekTo = (position: number): void => {
    if (duration.value > 0) {
      const clampedPosition = Math.max(0, Math.min(duration.value, position))
      audioManager.seek(clampedPosition)
    }
  }

  const seekToProgress = (progressValue: number): void => {
    const clampedProgress = Math.max(0, Math.min(1, progressValue))
    seekTo(clampedProgress * duration.value)
  }

  // 語言切換
  const switchLanguage = async (newLanguage: string): Promise<void> => {
    if (!currentScene.value?.audio || !(newLanguage in currentScene.value.audio)) {
      throw new Error(`Language ${newLanguage} not available`)
    }

    // 保存當前播放進度
    if (isPlaying.value) {
      savedProgress = progress.value
      pauseAudio()
    }

    const oldLanguage = currentLanguage.value
    currentLanguage.value = newLanguage
    errorMessage.value = ''

    // 保存語言選擇到 localStorage
    localStorage.setItem('exhibition-language', newLanguage)

    try {
      isLoading.value = true
      const audioFile = currentScene.value.audio[newLanguage]
      await audioManager.loadAudio(audioFile.url, newLanguage)
    } catch (error) {
      console.error('載入新語言音訊失敗:', error)
      errorMessage.value = '載入音訊失敗，請檢查網路連線'
      // 回滾到原語言
      currentLanguage.value = oldLanguage
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 場景切換
  const loadScene = async (scene: Scene | null): Promise<void> => {
    if (!scene) {
      currentScene.value = null
      return
    }

    // 停止當前播放
    stopAudio()
    errorMessage.value = ''
    currentScene.value = scene

    // 重置語言為預設語言或第一個可用語言
    const availableLangs = Object.keys(scene.audio || {})
    if (availableLangs.length > 0) {
      // 嘗試使用保存的語言偏好
      const savedLanguage = localStorage.getItem('exhibition-language')
      let preferredLang = defaultLanguage
      
      if (savedLanguage && availableLangs.includes(savedLanguage)) {
        preferredLang = savedLanguage
      } else if (!availableLangs.includes(defaultLanguage)) {
        preferredLang = availableLangs[0]
      }
      
      currentLanguage.value = preferredLang
    }

    // 預載當前語言的音訊
    if (hasAudio.value) {
      try {
        isLoading.value = true
        const audioFile = scene.audio[currentLanguage.value]
        await audioManager.loadAudio(audioFile.url, currentLanguage.value)
      } catch (error) {
        console.error('預載音訊失敗:', error)
        errorMessage.value = '載入音訊失敗'
        throw error
      } finally {
        isLoading.value = false
      }
    }
  }

  // 預載多個語言的音訊
  const preloadLanguages = async (languages?: string[]): Promise<void> => {
    if (!currentScene.value?.audio) return

    const langsToPreload = languages || availableLanguages.value
    const preloadPromises = langsToPreload
      .filter(lang => lang in currentScene.value!.audio)
      .map(async (lang) => {
        try {
          const audioFile = currentScene.value!.audio[lang]
          await audioManager.loadAudio(audioFile.url, lang)
        } catch (error) {
          console.warn(`預載語言 ${lang} 失敗:`, error)
        }
      })

    await Promise.allSettled(preloadPromises)
  }

  // 重試載入
  const retryLoad = async (): Promise<void> => {
    if (!hasAudio.value) return
    
    errorMessage.value = ''
    isLoading.value = true
    
    try {
      const audioFile = currentScene.value!.audio[currentLanguage.value]
      await audioManager.loadAudio(audioFile.url, currentLanguage.value)
    } catch (error) {
      console.error('重試載入失敗:', error)
      errorMessage.value = '載入失敗，請檢查網路連線'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 更新播放狀態的內部方法
  const updatePlaybackState = (): void => {
    isPlaying.value = audioManager.isPlaying()
    currentTime.value = audioManager.getCurrentTime()
    duration.value = audioManager.getDuration()
  }

  // 進度回調
  const handleProgress = (progressValue: number): void => {
    if (!isPlaying.value) return
    currentTime.value = progressValue * duration.value
  }

  // 載入回調
  const handleLoad = (success: boolean): void => {
    isLoading.value = false
    if (!success) {
      errorMessage.value = '音訊載入失敗'
    } else {
      updatePlaybackState()
    }
  }

  // 初始化
  const initialize = (): void => {
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

  // 清理資源
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