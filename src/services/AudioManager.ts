import { Howl, Howler } from 'howler'
import type { AudioFile } from '@/types'

export interface AudioProgressCallback {
  (progress: number): void
}

export interface AudioLoadCallback {
  (success: boolean): void
}

export class AudioManager {
  private howlerInstances: Map<string, Howl> = new Map()
  private currentAudio: Howl | null = null
  private currentLanguage: string = ''
  private progressCallbacks: Set<AudioProgressCallback> = new Set()
  private loadCallbacks: Set<AudioLoadCallback> = new Set()
  private progressInterval: number | null = null

  constructor() {
    // 設定全域音訊設定
    Howler.volume(0.8)
  }

  /**
   * 載入音訊檔案
   */
  async loadAudio(url: string, language: string): Promise<Howl> {
    const key = `${language}-${url}`
    
    // 如果已經載入過，直接返回
    if (this.howlerInstances.has(key)) {
      return this.howlerInstances.get(key)!
    }

    return new Promise((resolve, reject) => {
      const howl = new Howl({
        src: [url],
        html5: true, // 使用 HTML5 Audio 以支援串流
        preload: true,
        onload: () => {
          this.howlerInstances.set(key, howl)
          this.notifyLoadCallbacks(true)
          resolve(howl)
        },
        onloaderror: (id, error) => {
          console.error(`Failed to load audio: ${url}`, error)
          this.notifyLoadCallbacks(false)
          reject(new Error(`Failed to load audio: ${error}`))
        },
        onplay: () => {
          this.startProgressTracking()
        },
        onpause: () => {
          this.stopProgressTracking()
        },
        onstop: () => {
          this.stopProgressTracking()
        },
        onend: () => {
          this.stopProgressTracking()
        }
      })
    })
  }

  /**
   * 播放指定語言的音訊
   */
  async playAudio(url: string, language: string): Promise<void> {
    try {
      // 停止當前播放的音訊
      if (this.currentAudio && this.currentAudio.playing()) {
        this.currentAudio.stop()
      }

      // 載入並播放新音訊
      const howl = await this.loadAudio(url, language)
      this.currentAudio = howl
      this.currentLanguage = language
      
      howl.play()
    } catch (error) {
      console.error('Failed to play audio:', error)
      throw error
    }
  }

  /**
   * 暫停音訊播放
   */
  pauseAudio(): void {
    if (this.currentAudio && this.currentAudio.playing()) {
      this.currentAudio.pause()
    }
  }

  /**
   * 停止音訊播放
   */
  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.stop()
      this.stopProgressTracking()
    }
  }

  /**
   * 設定音量 (0-1)
   */
  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    Howler.volume(clampedVolume)
  }

  /**
   * 獲取當前音量
   */
  getVolume(): number {
    return Howler.volume()
  }

  /**
   * 跳轉到指定位置 (秒)
   */
  seek(position: number): void {
    if (this.currentAudio) {
      this.currentAudio.seek(position)
    }
  }

  /**
   * 獲取當前播放位置 (秒)
   */
  getCurrentTime(): number {
    if (this.currentAudio) {
      const time = this.currentAudio.seek() as number
      return (typeof time === 'number' && !isNaN(time)) ? time : 0
    }
    return 0
  }

  /**
   * 獲取音訊總長度 (秒)
   */
  getDuration(): number {
    if (this.currentAudio) {
      const duration = this.currentAudio.duration()
      return (typeof duration === 'number' && !isNaN(duration)) ? duration : 0
    }
    return 0
  }

  /**
   * 檢查是否正在播放
   */
  isPlaying(): boolean {
    return this.currentAudio ? this.currentAudio.playing() : false
  }

  /**
   * 獲取當前語言
   */
  getCurrentLanguage(): string {
    return this.currentLanguage
  }

  /**
   * 註冊進度回調
   */
  onProgress(callback: AudioProgressCallback): void {
    this.progressCallbacks.add(callback)
  }

  /**
   * 移除進度回調
   */
  offProgress(callback: AudioProgressCallback): void {
    this.progressCallbacks.delete(callback)
  }

  /**
   * 註冊載入回調
   */
  onLoad(callback: AudioLoadCallback): void {
    this.loadCallbacks.add(callback)
  }

  /**
   * 移除載入回調
   */
  offLoad(callback: AudioLoadCallback): void {
    this.loadCallbacks.delete(callback)
  }

  /**
   * 預載音訊檔案
   */
  async preloadAudio(audioFiles: Record<string, AudioFile>): Promise<void> {
    const loadPromises = Object.entries(audioFiles).map(([language, audioFile]) =>
      this.loadAudio(audioFile.url, language).catch(error => {
        console.warn(`Failed to preload audio for ${language}:`, error)
      })
    )

    await Promise.allSettled(loadPromises)
  }

  /**
   * 清理資源
   */
  cleanup(): void {
    // 停止所有音訊
    this.howlerInstances.forEach(howl => {
      howl.unload()
    })
    
    this.howlerInstances.clear()
    this.currentAudio = null
    this.currentLanguage = ''
    this.progressCallbacks.clear()
    this.loadCallbacks.clear()
    this.stopProgressTracking()
  }

  /**
   * 開始進度追蹤
   */
  private startProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval)
    }

    this.progressInterval = window.setInterval(() => {
      if (this.currentAudio && this.currentAudio.playing()) {
        const currentTime = this.getCurrentTime()
        const duration = this.getDuration()
        const progress = duration > 0 ? currentTime / duration : 0
        
        this.notifyProgressCallbacks(progress)
      }
    }, 100) // 每100ms更新一次進度
  }

  /**
   * 停止進度追蹤
   */
  private stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval)
      this.progressInterval = null
    }
  }

  /**
   * 通知進度回調
   */
  private notifyProgressCallbacks(progress: number): void {
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progress)
      } catch (error) {
        console.error('Error in progress callback:', error)
      }
    })
  }

  /**
   * 通知載入回調
   */
  private notifyLoadCallbacks(success: boolean): void {
    this.loadCallbacks.forEach(callback => {
      try {
        callback(success)
      } catch (error) {
        console.error('Error in load callback:', error)
      }
    })
  }
}

// 單例實例
export const audioManager = new AudioManager()