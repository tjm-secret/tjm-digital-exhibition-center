// Exhibition system configuration

import type { ResourceConfig } from '@/types'

// Default resource configuration for development
export const defaultResourceConfig: ResourceConfig = {
  mode: 'static',
  staticPath: '/assets/exhibitions/',
  fallbackStrategy: 'none'
}

// Exhibition system settings
export const exhibitionSettings = {
  defaultLanguage: 'zh',
  availableLanguages: ['zh', 'en', 'ja'],
  autoplay: false,
  showThumbnails: true,
  enableKeyboard: true,
  preloadCount: 2
}

// Responsive breakpoints (matching Tailwind CSS)
export const breakpoints = {
  sm: 640,   // 手機橫向
  md: 768,   // 平板直向
  lg: 1024,  // 平板橫向/小筆電
  xl: 1280,  // 桌面
  '2xl': 1536 // 大螢幕
}

// Performance settings
export const performanceConfig = {
  imageLoadTimeout: 10000, // 10 seconds
  audioLoadTimeout: 15000, // 15 seconds
  maxPreloadImages: 3,
  maxPreloadAudio: 2,
  lazyLoadThreshold: 50 // pixels
}