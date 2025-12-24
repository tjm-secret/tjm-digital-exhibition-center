// Exhibition state management composable

import { ref, computed } from 'vue'
import type { Scene, ExhibitionConfig } from '@/types'

export function useExhibition() {
  // State
  const exhibition = ref<ExhibitionConfig | null>(null)
  const currentSceneIndex = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const currentScene = computed(() => {
    if (!exhibition.value || !exhibition.value.scenes.length) return null
    return exhibition.value.scenes[currentSceneIndex.value] || null
  })

  const totalScenes = computed(() => {
    return exhibition.value?.scenes.length || 0
  })

  const isFirstScene = computed(() => {
    return currentSceneIndex.value === 0
  })

  const isLastScene = computed(() => {
    return currentSceneIndex.value === totalScenes.value - 1
  })

  // Methods
  const setExhibition = (config: ExhibitionConfig) => {
    exhibition.value = config
    currentSceneIndex.value = 0
    error.value = null
  }

  const navigateToScene = (index: number) => {
    if (index >= 0 && index < totalScenes.value) {
      currentSceneIndex.value = index
    }
  }

  const nextScene = () => {
    if (!isLastScene.value) {
      currentSceneIndex.value++
    }
  }

  const previousScene = () => {
    if (!isFirstScene.value) {
      currentSceneIndex.value--
    }
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  return {
    // State
    exhibition,
    currentSceneIndex,
    isLoading,
    error,
    
    // Computed
    currentScene,
    totalScenes,
    isFirstScene,
    isLastScene,
    
    // Methods
    setExhibition,
    navigateToScene,
    nextScene,
    previousScene,
    setLoading,
    setError
  }
}