// Resource loading interfaces

import type { ExhibitionConfig, Scene, AudioFile } from './index'

export interface ResourceLoader {
  loadExhibition(exhibitionId: string): Promise<ExhibitionConfig>
}

export interface StaticResourceLoader extends ResourceLoader {
  // 從靜態 JSON 檔案載入展覽配置
  // 路徑範例: /assets/exhibitions/exhibition-1/config.json
  loadFromStatic(path: string): Promise<ExhibitionConfig>
  
  // 圖片和音訊檔案直接從 CDN 或靜態路徑載入
  // 範例: /assets/exhibitions/exhibition-1/images/scene-1.jpg
  //      /assets/exhibitions/exhibition-1/audio/scene-1-zh.mp3
}

export interface APIResourceLoader extends ResourceLoader {
  // 從 REST API 載入展覽配置
  // 端點範例: GET /api/exhibitions/exhibition-1
  loadFromAPI(endpoint: string): Promise<ExhibitionConfig>
  
  // 媒體檔案可能來自 API 或 CDN
  // 範例: https://api.example.com/media/images/scene-1.jpg
  //      https://cdn.example.com/audio/scene-1-zh.mp3
}

export interface HybridResourceLoader extends ResourceLoader {
  // 配置從 API 載入，媒體檔案來自 CDN
  loadConfigFromAPI(endpoint: string): Promise<ExhibitionConfig>
  resolveMediaUrls(config: ExhibitionConfig, cdnBase: string): ExhibitionConfig
}

export interface ImageErrorHandler {
  handleImageError(scene: Scene): void
}

export interface AudioErrorHandler {
  handleAudioError(audioFile: AudioFile): void
}

export interface NetworkErrorHandler {
  handleNetworkError(): void
}