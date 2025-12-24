// Component interfaces for Vue components

import type { Scene, ExhibitionConfig } from './index'
import type { Swiper } from 'swiper'
import type { Howl } from 'howler'

export interface ExhibitionAppState {
  scenes: Scene[]
  currentSceneIndex: number
  isLoading: boolean
  
  // 方法
  initializeExhibition(): void
  navigateToScene(index: number): void
  preloadAdjacentScenes(): void
}

export interface SceneComponentProps {
  scene: Scene
  isActive: boolean
  isPreloaded: boolean
  
  // 方法
  loadContent(): Promise<void>
  unloadContent(): void
  handleImageLoad(): void
}

export interface AudioGuideComponentState {
  currentLanguage: string
  availableLanguages: string[]
  isPlaying: boolean
  progress: number
  
  // 方法
  switchLanguage(language: string): void
  play(): void
  pause(): void
  seek(position: number): void
}

export interface NavigationComponentProps {
  scenes: Scene[]
  currentIndex: number
  
  // 方法
  jumpToScene(index: number): void
  showThumbnails(): void
  hideThumbnails(): void
}

export interface SwiperControllerConfig {
  swiperInstance: Swiper | null
  isTransitioning: boolean
  
  // 配置
  config: {
    slidesPerView: number
    spaceBetween: number
    allowTouchMove: boolean
    keyboard: { enabled: boolean }
    mousewheel: { enabled: boolean }
    effect: string
    speed: number
  }
  
  // 方法
  initializeSwiper(): void
  slideNext(): void
  slidePrev(): void
  slideTo(index: number): void
  onSlideChange(callback: Function): void
}

export interface AudioManagerState {
  howlerInstances: Map<string, Howl>
  currentAudio: Howl | null
  
  // 方法
  loadAudio(url: string, language: string): Promise<Howl>
  playAudio(language: string): void
  pauseAudio(): void
  stopAudio(): void
  setVolume(volume: number): void
  onProgress(callback: Function): void
}