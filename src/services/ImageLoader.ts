/**
 * ImageLoader - 圖片延遲載入和漸進式載入服務
 * 使用 Intersection Observer API 實現高效能的圖片載入管理
 */

export interface ImageLoadOptions {
  rootMargin?: string
  threshold?: number
  enablePreload?: boolean
  preloadCount?: number
  enableProgressiveLoading?: boolean
  lowQualityPlaceholder?: string
}

export interface ImageLoadState {
  isLoading: boolean
  isLoaded: boolean
  hasError: boolean
  retryCount: number
  loadStartTime?: number
  loadEndTime?: number
}

export interface PreloadQueueItem {
  url: string
  priority: number
  sceneId: string
}

export class ImageLoader {
  private observer: IntersectionObserver | null = null
  private imageStates = new Map<string, ImageLoadState>()
  private preloadQueue: PreloadQueueItem[] = []
  private isPreloading = false
  private options: Required<ImageLoadOptions>

  constructor(options: ImageLoadOptions = {}) {
    this.options = {
      rootMargin: options.rootMargin || '50px',
      threshold: options.threshold || 0.1,
      enablePreload: options.enablePreload ?? true,
      preloadCount: options.preloadCount || 2,
      enableProgressiveLoading: options.enableProgressiveLoading ?? true,
      lowQualityPlaceholder: options.lowQualityPlaceholder || ''
    }

    this.initializeObserver()
  }

  /**
   * 初始化 Intersection Observer
   */
  private initializeObserver(): void {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      console.warn('IntersectionObserver not supported, falling back to immediate loading')
      return
    }

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold
      }
    )
  }

  /**
   * 處理元素進入視窗的回調
   */
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        const imageUrl = img.dataset.src || img.src
        
        if (imageUrl) {
          this.loadImage(imageUrl, img)
          this.observer?.unobserve(entry.target)
        }
      }
    })
  }

  /**
   * 觀察圖片元素，準備延遲載入
   */
  observeImage(element: HTMLImageElement, imageUrl: string): void {
    if (!this.observer) {
      // 如果不支援 IntersectionObserver，直接載入
      this.loadImage(imageUrl, element)
      return
    }

    // 設置 data-src 屬性用於延遲載入
    element.dataset.src = imageUrl
    
    // 如果啟用漸進式載入且有低品質佔位圖
    if (this.options.enableProgressiveLoading && this.options.lowQualityPlaceholder) {
      element.src = this.options.lowQualityPlaceholder
    }

    // 初始化圖片狀態
    this.setImageState(imageUrl, {
      isLoading: false,
      isLoaded: false,
      hasError: false,
      retryCount: 0
    })

    this.observer.observe(element)
  }

  /**
   * 載入單張圖片
   */
  private async loadImage(imageUrl: string, targetElement?: HTMLImageElement): Promise<void> {
    const state = this.getImageState(imageUrl)
    
    if (state.isLoaded || state.isLoading) {
      return
    }

    this.setImageState(imageUrl, {
      ...state,
      isLoading: true,
      loadStartTime: Date.now()
    })

    try {
      await this.preloadSingleImage(imageUrl)
      
      // 如果有目標元素，更新其 src
      if (targetElement) {
        targetElement.src = imageUrl
        targetElement.classList.add('loaded')
      }

      this.setImageState(imageUrl, {
        ...state,
        isLoading: false,
        isLoaded: true,
        hasError: false,
        loadEndTime: Date.now()
      })

      this.dispatchLoadEvent(imageUrl, 'loaded')
    } catch (error) {
      this.setImageState(imageUrl, {
        ...state,
        isLoading: false,
        hasError: true,
        retryCount: state.retryCount + 1
      })

      this.dispatchLoadEvent(imageUrl, 'error', error as Error)
      
      // 如果有目標元素，添加錯誤類別
      if (targetElement) {
        targetElement.classList.add('error')
      }
    }
  }

  /**
   * 預載單張圖片
   */
  private preloadSingleImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => resolve()
      img.onerror = (error) => reject(error)
      
      img.src = url
    })
  }

  /**
   * 添加圖片到預載佇列
   */
  addToPreloadQueue(url: string, priority: number = 0, sceneId: string = ''): void {
    if (!this.options.enablePreload) return

    // 檢查是否已在佇列中
    const exists = this.preloadQueue.some(item => item.url === url)
    if (exists) return

    this.preloadQueue.push({ url, priority, sceneId })
    
    // 按優先級排序（高優先級在前）
    this.preloadQueue.sort((a, b) => b.priority - a.priority)

    // 開始預載處理
    this.processPreloadQueue()
  }

  /**
   * 處理預載佇列
   */
  private async processPreloadQueue(): Promise<void> {
    if (this.isPreloading || this.preloadQueue.length === 0) return

    this.isPreloading = true

    // 取出前 N 個項目進行預載
    const itemsToPreload = this.preloadQueue.splice(0, this.options.preloadCount)

    try {
      await Promise.all(
        itemsToPreload.map(item => this.preloadSingleImage(item.url))
      )
    } catch (error) {
      console.warn('Some images failed to preload:', error)
    }

    this.isPreloading = false

    // 如果還有項目，繼續處理
    if (this.preloadQueue.length > 0) {
      setTimeout(() => this.processPreloadQueue(), 100)
    }
  }

  /**
   * 預載相鄰場景的圖片
   */
  preloadAdjacentScenes(currentSceneIndex: number, scenes: Array<{ image: { url: string, thumbnail?: string } }>): void {
    if (!this.options.enablePreload) return

    const adjacentIndices = [
      currentSceneIndex - 1,
      currentSceneIndex + 1
    ].filter(index => index >= 0 && index < scenes.length)

    adjacentIndices.forEach((index, priority) => {
      const scene = scenes[index]
      
      // 確保場景存在
      if (!scene) return
      
      // 預載主圖片
      this.addToPreloadQueue(scene.image.url, 10 - priority, `scene-${index}`)
      
      // 預載縮圖（如果存在）
      if (scene.image.thumbnail) {
        this.addToPreloadQueue(scene.image.thumbnail, 5 - priority, `scene-${index}-thumb`)
      }
    })
  }

  /**
   * 取得圖片載入狀態
   */
  getImageState(imageUrl: string): ImageLoadState {
    return this.imageStates.get(imageUrl) || {
      isLoading: false,
      isLoaded: false,
      hasError: false,
      retryCount: 0
    }
  }

  /**
   * 設置圖片載入狀態
   */
  private setImageState(imageUrl: string, state: ImageLoadState): void {
    this.imageStates.set(imageUrl, state)
  }

  /**
   * 重試載入失敗的圖片
   */
  async retryImageLoad(imageUrl: string, targetElement?: HTMLImageElement): Promise<void> {
    const state = this.getImageState(imageUrl)
    
    if (state.retryCount >= 3) {
      console.warn(`Max retry attempts reached for image: ${imageUrl}`)
      return
    }

    // 重置狀態
    this.setImageState(imageUrl, {
      ...state,
      isLoading: false,
      isLoaded: false,
      hasError: false
    })

    // 重新載入
    await this.loadImage(imageUrl, targetElement)
  }

  /**
   * 發送載入事件
   */
  private dispatchLoadEvent(imageUrl: string, type: 'loaded' | 'error', error?: Error): void {
    const event = new CustomEvent(`image-${type}`, {
      detail: { imageUrl, error }
    })
    window.dispatchEvent(event)
  }

  /**
   * 取得載入效能統計
   */
  getLoadingStats(): { totalImages: number, loadedImages: number, failedImages: number, averageLoadTime: number } {
    const states = Array.from(this.imageStates.values())
    const loadedStates = states.filter(state => state.isLoaded && state.loadStartTime && state.loadEndTime)
    
    const totalLoadTime = loadedStates.reduce((sum, state) => {
      return sum + (state.loadEndTime! - state.loadStartTime!)
    }, 0)

    return {
      totalImages: states.length,
      loadedImages: states.filter(state => state.isLoaded).length,
      failedImages: states.filter(state => state.hasError).length,
      averageLoadTime: loadedStates.length > 0 ? totalLoadTime / loadedStates.length : 0
    }
  }

  /**
   * 清理資源
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
    
    this.imageStates.clear()
    this.preloadQueue.length = 0
  }
}

// 單例模式的全域 ImageLoader 實例
export const globalImageLoader = new ImageLoader({
  rootMargin: '100px',
  threshold: 0.1,
  enablePreload: true,
  preloadCount: 3,
  enableProgressiveLoading: true
})