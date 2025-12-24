// Core data models for the online exhibition system

export interface Scene {
  id: string
  title: string
  description: Record<string, string> // 多語言描述
  image: {
    url: string
    alt: string
    width: number
    height: number
    thumbnail?: string
  }
  audio: Record<string, AudioFile> // 多語言音訊
  order: number
  metadata?: {
    artist?: string
    year?: string
    medium?: string
    dimensions?: string
  }
}

export interface AudioFile {
  url: string
  duration: number
  format: 'mp3' | 'ogg' | 'wav'
  size: number
}

export interface ResourceConfig {
  mode: 'static' | 'api' | 'hybrid'
  staticPath?: string // 靜態檔案路徑 (如: '/assets/exhibitions/')
  apiEndpoint?: string // API 端點 (如: '/api/exhibitions')
  cdnBaseUrl?: string // CDN 基礎 URL (如: 'https://cdn.example.com/')
  fallbackStrategy: 'static' | 'api' | 'none'
}

export interface ExhibitionConfig {
  id: string
  title: string
  description: string
  scenes: Scene[]
  defaultLanguage: string
  availableLanguages: string[]
  resourceConfig: ResourceConfig
  settings: {
    autoplay: boolean
    showThumbnails: boolean
    enableKeyboard: boolean
    preloadCount: number
  }
}