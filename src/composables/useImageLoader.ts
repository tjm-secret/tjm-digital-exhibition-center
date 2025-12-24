import { ref, type Ref } from 'vue'
import { globalImageLoader, type ImageLoadState } from '@/services/ImageLoader'

export interface ImageLoadStateRef extends ImageLoadState {
  retryCount: number
}

export function useImageLoader() {
  const imageStates = ref<Map<string, ImageLoadState>>(new Map())
  
  const getImageState = (imageId: string): ImageLoadState => {
    return globalImageLoader.getImageState(imageId)
  }
  
  const observeImage = (element: HTMLImageElement, imageUrl: string): void => {
    globalImageLoader.observeImage(element, imageUrl)
  }
  
  const preloadImage = (url: string, priority: number = 0, sceneId: string = ''): void => {
    globalImageLoader.addToPreloadQueue(url, priority, sceneId)
  }
  
  const retryImageLoad = async (imageUrl: string, targetElement?: HTMLImageElement): Promise<void> => {
    await globalImageLoader.retryImageLoad(imageUrl, targetElement)
  }
  
  const preloadAdjacentScenes = (currentIndex: number, scenes: Array<{ image: { url: string, thumbnail?: string } }>): void => {
    globalImageLoader.preloadAdjacentScenes(currentIndex, scenes)
  }
  
  const getLoadingStats = () => {
    return globalImageLoader.getLoadingStats()
  }
  
  return {
    imageStates: imageStates as Ref<Map<string, ImageLoadState>>,
    getImageState,
    observeImage,
    preloadImage,
    retryImageLoad,
    preloadAdjacentScenes,
    getLoadingStats
  }
}