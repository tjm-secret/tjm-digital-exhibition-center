import { Swiper } from 'swiper'
import { Navigation, Keyboard, EffectFade } from 'swiper/modules'
import type { SwiperOptions } from 'swiper/types'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/effect-fade'

// Import boundary protection styles
import '@/assets/swiper-boundary.css'

export interface SwiperControllerConfig {
  slidesPerView: number
  spaceBetween: number
  allowTouchMove: boolean
  keyboard: { enabled: boolean }
  mousewheel: { enabled: boolean }
  effect: 'slide' | 'fade'
  speed: number
  loop: boolean
}

export class SwiperController {
  private swiperInstance: Swiper | null = null
  private isTransitioning = false
  private config: SwiperControllerConfig
  private onSlideChangeCallback?: (index: number) => void
  private onReachBeginningCallback?: () => void
  private onReachEndCallback?: () => void
  private onBoundaryAttemptCallback?: (direction: 'prev' | 'next') => void

  constructor(config?: Partial<SwiperControllerConfig>) {
    this.config = {
      slidesPerView: 1,
      spaceBetween: 0,
      allowTouchMove: true,
      keyboard: { enabled: true },
      mousewheel: { enabled: false },
      effect: 'slide',
      speed: 600,
      loop: false,
      ...config
    }
  }

  /**
   * 初始化 Swiper 實例
   */
  initializeSwiper(container: HTMLElement, totalSlides: number): void {
    if (this.swiperInstance) {
      this.destroySwiper()
    }

    // Configure Swiper modules
    Swiper.use([Navigation, Keyboard, EffectFade])

    const swiperOptions: SwiperOptions = {
      slidesPerView: this.config.slidesPerView,
      spaceBetween: this.config.spaceBetween,
      allowTouchMove: this.config.allowTouchMove,
      keyboard: this.config.keyboard,
      mousewheel: this.config.mousewheel,
      effect: this.config.effect,
      speed: this.config.speed,
      loop: this.config.loop,
      
      // 觸控優化配置
      touchRatio: 1,
      touchAngle: 45,
      // 啟用禁止滑動類名支持
      noSwiping: true,
      noSwipingSelector: '.swiper-no-swiping',
      longSwipes: true,
      longSwipesRatio: 0.5,
      longSwipesMs: 300,
      followFinger: true,
      shortSwipes: true,
      threshold: 5, // Lower threshold for easier swiping
      touchMoveStopPropagation: false,
      simulateTouch: true,
      grabCursor: true, // Show grab cursor to indicate swipeability
      touchStartPreventDefault: false,
      touchStartForcePreventDefault: false,
      touchReleaseOnEdges: true,
      
      // 邊界保護配置
      resistance: true,
      resistanceRatio: 0.85,
      
      // 事件處理
      on: {
        slideChange: () => {
          this.handleSlideChange()
        },
        slideChangeTransitionStart: () => {
          this.isTransitioning = true
        },
        slideChangeTransitionEnd: () => {
          this.isTransitioning = false
        },
        reachBeginning: () => {
          this.handleReachBeginning()
        },
        reachEnd: () => {
          this.handleReachEnd()
        },
        // 邊界滑動嘗試事件
        slideNextTransitionStart: () => {
          if (this.swiperInstance?.isEnd) {
            this.handleBoundaryAttempt('next')
          }
        },
        slidePrevTransitionStart: () => {
          if (this.swiperInstance?.isBeginning) {
            this.handleBoundaryAttempt('prev')
          }
        },
        // 觸控事件優化
        touchStart: (swiper, event) => {
          this.handleTouchStart(event)
        },
        touchMove: (swiper, event) => {
          this.handleTouchMove(event)
        },
        touchEnd: (swiper, event) => {
          this.handleTouchEnd(event)
        }
      }
    }

    this.swiperInstance = new Swiper(container, swiperOptions)
    
    // 添加邊界保護的觸控事件監聽
    this.addBoundaryProtectionListeners(container)
  }

  /**
   * 切換到下一個場景（帶邊界保護）
   */
  slideNext(): boolean {
    if (!this.swiperInstance || this.isTransitioning) {
      return false
    }

    // 檢查是否已在最後一個場景
    if (this.swiperInstance.isEnd && !this.config.loop) {
      this.handleBoundaryAttempt('next')
      this.showBoundaryFeedback('next')
      return false
    }

    this.swiperInstance.slideNext()
    return true
  }

  /**
   * 切換到上一個場景（帶邊界保護）
   */
  slidePrev(): boolean {
    if (!this.swiperInstance || this.isTransitioning) {
      return false
    }

    // 檢查是否已在第一個場景
    if (this.swiperInstance.isBeginning && !this.config.loop) {
      this.handleBoundaryAttempt('prev')
      this.showBoundaryFeedback('prev')
      return false
    }

    this.swiperInstance.slidePrev()
    return true
  }

  /**
   * 跳轉到指定場景
   */
  slideTo(index: number, speed?: number): boolean {
    if (!this.swiperInstance || this.isTransitioning) {
      return false
    }

    const slideCount = this.swiperInstance.slides.length
    if (index < 0 || index >= slideCount) {
      return false
    }

    this.swiperInstance.slideTo(index, speed)
    return true
  }

  /**
   * 獲取當前場景索引
   */
  getCurrentIndex(): number {
    return this.swiperInstance?.activeIndex ?? 0
  }

  /**
   * 獲取場景總數
   */
  getSlidesCount(): number {
    return this.swiperInstance?.slides.length ?? 0
  }

  /**
   * 檢查是否在第一個場景
   */
  isAtBeginning(): boolean {
    return this.swiperInstance?.isBeginning ?? true
  }

  /**
   * 檢查是否在最後一個場景
   */
  isAtEnd(): boolean {
    return this.swiperInstance?.isEnd ?? true
  }

  /**
   * 檢查是否正在轉換中
   */
  isTransitionInProgress(): boolean {
    return this.isTransitioning
  }

  /**
   * 設置場景變化回調
   */
  onSlideChange(callback: (index: number) => void): void {
    this.onSlideChangeCallback = callback
  }

  /**
   * 設置到達開始位置回調
   */
  onReachBeginning(callback: () => void): void {
    this.onReachBeginningCallback = callback
  }

  /**
   * 設置到達結束位置回調
   */
  onReachEnd(callback: () => void): void {
    this.onReachEndCallback = callback
  }

  /**
   * 設置邊界嘗試回調
   */
  onBoundaryAttempt(callback: (direction: 'prev' | 'next') => void): void {
    this.onBoundaryAttemptCallback = callback
  }

  /**
   * 更新 Swiper 配置
   */
  updateConfig(newConfig: Partial<SwiperControllerConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    if (this.swiperInstance) {
      // 更新現有實例的配置
      Object.assign(this.swiperInstance.params, {
        allowTouchMove: this.config.allowTouchMove,
        keyboard: this.config.keyboard,
        mousewheel: this.config.mousewheel,
        speed: this.config.speed
      })
      
      this.swiperInstance.update()
    }
  }

  /**
   * 更新 Swiper 實例
   */
  update(): void {
    if (this.swiperInstance) {
      this.swiperInstance.update()
    }
  }

  /**
   * 啟用/禁用觸控滑動
   */
  setTouchEnabled(enabled: boolean): void {
    if (this.swiperInstance) {
      this.swiperInstance.allowTouchMove = enabled
    }
    this.config.allowTouchMove = enabled
  }

  /**
   * 啟用/禁用鍵盤控制
   */
  setKeyboardEnabled(enabled: boolean): void {
    if (this.swiperInstance) {
      if (enabled) {
        this.swiperInstance.keyboard.enable()
      } else {
        this.swiperInstance.keyboard.disable()
      }
    }
    this.config.keyboard.enabled = enabled
  }

  /**
   * 銷毀 Swiper 實例
   */
  destroySwiper(): void {
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true)
      this.swiperInstance = null
    }
    this.isTransitioning = false
  }

  /**
   * 添加邊界保護的觸控事件監聽
   */
  private addBoundaryProtectionListeners(container: HTMLElement): void {
    let startX = 0
    let startY = 0
    
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0 && e.touches[0]) {
        startX = e.touches[0].clientX
        startY = e.touches[0].clientY
      }
    }, { passive: true })
    
    container.addEventListener('touchmove', (e) => {
      if (!this.swiperInstance || e.touches.length === 0 || !e.touches[0]) return
      
      const currentX = e.touches[0].clientX
      const currentY = e.touches[0].clientY
      const diffX = startX - currentX
      const diffY = startY - currentY
      
      // 檢查是否為水平滑動
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // 向左滑動（下一個場景）
        if (diffX > 50 && this.swiperInstance.isEnd && !this.config.loop) {
          this.handleBoundaryAttempt('next')
          this.showBoundaryFeedback('next')
        }
        // 向右滑動（上一個場景）
        else if (diffX < -50 && this.swiperInstance.isBeginning && !this.config.loop) {
          this.handleBoundaryAttempt('prev')
          this.showBoundaryFeedback('prev')
        }
      }
    }, { passive: true })
  }

  /**
   * 顯示邊界回饋效果
   */
  private showBoundaryFeedback(direction: 'prev' | 'next'): void {
    if (!this.swiperInstance) return
    
    const container = this.swiperInstance.el as HTMLElement
    const feedbackClass = direction === 'next' ? 'swiper-boundary-end' : 'swiper-boundary-start'
    
    // 添加邊界回饋樣式
    container.classList.add(feedbackClass)
    
    // 添加震動效果（如果支援）
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
    
    // 移除回饋樣式
    setTimeout(() => {
      container.classList.remove(feedbackClass)
    }, 300)
  }

  /**
   * 處理場景變化事件
   */
  private handleSlideChange(): void {
    if (this.onSlideChangeCallback && this.swiperInstance) {
      this.onSlideChangeCallback(this.swiperInstance.activeIndex)
    }
  }

  /**
   * 處理到達開始位置事件
   */
  private handleReachBeginning(): void {
    if (this.onReachBeginningCallback) {
      this.onReachBeginningCallback()
    }
  }

  /**
   * 處理到達結束位置事件
   */
  private handleReachEnd(): void {
    if (this.onReachEndCallback) {
      this.onReachEndCallback()
    }
  }

  /**
   * 處理邊界嘗試事件
   */
  private handleBoundaryAttempt(direction: 'prev' | 'next'): void {
    console.log(`Boundary attempt detected: ${direction}`)
    if (this.onBoundaryAttemptCallback) {
      this.onBoundaryAttemptCallback(direction)
    }
  }

  /**
   * 處理觸控開始事件
   */
  private handleTouchStart(event: TouchEvent | MouseEvent | PointerEvent): void {
    // Check if it's a touch event with touches
    if ('touches' in event && event.touches.length > 0) {
      // 記錄觸控開始時間
      // const touchStartTime = Date.now()
      
      // 在觸控裝置上提供觸覺回饋
      if ('vibrate' in navigator && event.touches.length === 1) {
        navigator.vibrate(10)
      }
    }
  }

  /**
   * 處理觸控移動事件
   */
  private handleTouchMove(event: TouchEvent | MouseEvent | PointerEvent): void {
    // Check if it's a touch event
    if ('touches' in event && event.touches.length > 1) {
      event.preventDefault()
    }
  }

  /**
   * 處理觸控結束事件
   */
  private handleTouchEnd(event: TouchEvent | MouseEvent | PointerEvent): void {
    // 觸控結束時的處理邏輯
    // 可以在這裡添加額外的觸控回饋
  }
}

// 創建全局 SwiperController 實例
export const globalSwiperController = new SwiperController()