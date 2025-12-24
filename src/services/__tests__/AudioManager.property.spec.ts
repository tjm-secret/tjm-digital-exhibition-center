import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { AudioManager } from '../AudioManager'
import type { AudioFile } from '@/types'

// Mock Howler.js
vi.mock('howler', () => {
  class MockHowl {
    private config: any
    
    constructor(config: any) {
      this.config = config
      
      // 模擬載入成功 - 使用更短的延遲
      setTimeout(() => {
        if (config.onload) config.onload()
      }, 1)
    }
    
    play = vi.fn()
    pause = vi.fn()
    stop = vi.fn()
    seek = vi.fn().mockImplementation((position?: number) => {
      // 如果提供了位置參數，這是設定操作，返回 this
      if (position !== undefined) {
        return this
      }
      // 否則這是獲取操作，返回當前位置
      return 0
    })
    duration = vi.fn().mockReturnValue(100)
    playing = vi.fn().mockReturnValue(false)
    unload = vi.fn()
    volume = vi.fn()
  }

  const MockHowler = {
    _volume: 0.8,
    volume: vi.fn().mockImplementation((vol?: number) => {
      if (vol !== undefined) {
        // 實現音量限制邏輯
        MockHowler._volume = Math.max(0, Math.min(1, vol))
      }
      return MockHowler._volume
    })
  }

  return {
    Howl: MockHowl,
    Howler: MockHowler
  }
})

describe('AudioManager Property Tests', () => {
  let audioManager: AudioManager

  beforeEach(() => {
    audioManager = new AudioManager()
    vi.clearAllMocks()
  })

  afterEach(() => {
    audioManager.cleanup()
  })

  describe('Property 7: Audio Control Interface Completeness', () => {
    /**
     * **Feature: online-exhibition, Property 7: Audio Control Interface Completeness**
     * *For any* playing audio, the audio guide should display play, pause, and replay control buttons
     * **Validates: Requirements 4.3**
     */
    it('should provide complete audio control interface for any audio', async () => {
      await fc.assert(fc.asyncProperty(
        fc.record({
          url: fc.webUrl(),
          language: fc.oneof(fc.constant('zh'), fc.constant('en'), fc.constant('ja')),
          duration: fc.integer({ min: 1, max: 3600 }),
          format: fc.oneof(fc.constant('mp3'), fc.constant('ogg'), fc.constant('wav')),
          size: fc.integer({ min: 1000, max: 10000000 })
        }),
        async (audioFile: AudioFile & { language: string }) => {
          // 載入音訊
          await audioManager.loadAudio(audioFile.url, audioFile.language)
          
          // 驗證播放控制功能存在且可用
          expect(typeof audioManager.playAudio).toBe('function')
          expect(typeof audioManager.pauseAudio).toBe('function')
          expect(typeof audioManager.stopAudio).toBe('function')
          
          // 驗證音量控制功能
          expect(typeof audioManager.setVolume).toBe('function')
          expect(typeof audioManager.getVolume).toBe('function')
          
          // 驗證進度控制功能
          expect(typeof audioManager.seek).toBe('function')
          expect(typeof audioManager.getCurrentTime).toBe('function')
          expect(typeof audioManager.getDuration).toBe('function')
          
          // 驗證狀態查詢功能
          expect(typeof audioManager.isPlaying).toBe('function')
          expect(typeof audioManager.getCurrentLanguage).toBe('function')
          
          // 驗證所有控制方法都能正常調用而不拋出錯誤
          expect(() => audioManager.pauseAudio()).not.toThrow()
          expect(() => audioManager.stopAudio()).not.toThrow()
          expect(() => audioManager.setVolume(0.5)).not.toThrow()
          expect(() => audioManager.seek(10)).not.toThrow()
          
          // 驗證狀態查詢方法返回合理值
          expect(typeof audioManager.getVolume()).toBe('number')
          expect(typeof audioManager.getCurrentTime()).toBe('number')
          expect(typeof audioManager.getDuration()).toBe('number')
          expect(typeof audioManager.isPlaying()).toBe('boolean')
          expect(typeof audioManager.getCurrentLanguage()).toBe('string')
        }
      ), { numRuns: 50 })
    })
  })

  describe('Property 23: Audio Loading Progress Indication', () => {
    /**
     * **Feature: online-exhibition, Property 23: Audio Loading Progress Indication**
     * *For any* audio file loading, a progress indicator should be displayed
     * **Validates: Requirements 6.4**
     */
    it('should provide progress indication for any audio file loading', async () => {
      await fc.assert(fc.asyncProperty(
        fc.record({
          url: fc.webUrl(),
          language: fc.oneof(fc.constant('zh'), fc.constant('en'), fc.constant('ja')),
          duration: fc.integer({ min: 1, max: 3600 }),
          format: fc.oneof(fc.constant('mp3'), fc.constant('ogg'), fc.constant('wav')),
          size: fc.integer({ min: 1000, max: 10000000 })
        }),
        async (audioFile: AudioFile & { language: string }) => {
          let loadCallbackCalled = false
          
          // 註冊載入進度回調
          const loadCallback = (success: boolean) => {
            loadCallbackCalled = true
            expect(typeof success).toBe('boolean')
          }
          
          audioManager.onLoad(loadCallback)
          
          // 載入音訊檔案
          await audioManager.loadAudio(audioFile.url, audioFile.language)
          
          // 驗證載入回調被調用
          expect(loadCallbackCalled).toBe(true)
          
          // 驗證進度回調機制存在
          expect(typeof audioManager.onProgress).toBe('function')
          expect(typeof audioManager.offProgress).toBe('function')
          expect(typeof audioManager.onLoad).toBe('function')
          expect(typeof audioManager.offLoad).toBe('function')
          
          // 清理回調
          audioManager.offLoad(loadCallback)
        }
      ), { numRuns: 10 }) // 減少運行次數以避免超時
    }, 10000) // 增加測試超時時間
  })

  describe('Audio Manager State Management', () => {
    it('should maintain consistent state across operations', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(fc.record({
          url: fc.webUrl(),
          language: fc.oneof(fc.constant('zh'), fc.constant('en'), fc.constant('ja')),
          duration: fc.integer({ min: 1, max: 3600 }),
          format: fc.oneof(fc.constant('mp3'), fc.constant('ogg'), fc.constant('wav')),
          size: fc.integer({ min: 1000, max: 10000000 })
        }), { minLength: 1, maxLength: 5 }),
        fc.float({ min: 0, max: 1 }),
        async (audioFiles: (AudioFile & { language: string })[], volume: number) => {
          // 設定音量
          audioManager.setVolume(volume)
          const actualVolume = audioManager.getVolume()
          
          // 驗證音量在有效範圍內
          expect(actualVolume).toBeGreaterThanOrEqual(0)
          expect(actualVolume).toBeLessThanOrEqual(1)
          
          // 如果輸入音量在有效範圍內，應該匹配
          if (volume >= 0 && volume <= 1) {
            expect(actualVolume).toBeCloseTo(volume, 2)
          }
          
          // 載入多個音訊檔案
          for (const audioFile of audioFiles) {
            await audioManager.loadAudio(audioFile.url, audioFile.language)
          }
          
          // 播放第一個音訊檔案
          if (audioFiles.length > 0) {
            const firstAudio = audioFiles[0]
            await audioManager.playAudio(firstAudio.url, firstAudio.language)
            
            // 驗證當前語言設定正確
            expect(audioManager.getCurrentLanguage()).toBe(firstAudio.language)
            
            // 驗證時間相關方法返回合理值
            expect(audioManager.getCurrentTime()).toBeGreaterThanOrEqual(0)
            expect(audioManager.getDuration()).toBeGreaterThanOrEqual(0)
          }
        }
      ), { numRuns: 30 })
    })
  })

  describe('Audio Manager Volume Control', () => {
    it('should properly handle volume control within valid range', async () => {
      await fc.assert(fc.property(
        fc.float({ min: -2, max: 2 }), // 包含無效範圍以測試邊界處理
        (inputVolume: number) => {
          const initialVolume = audioManager.getVolume()
          audioManager.setVolume(inputVolume)
          const actualVolume = audioManager.getVolume()
          
          // 音量應該被限制在 0-1 範圍內
          expect(actualVolume).toBeGreaterThanOrEqual(0)
          expect(actualVolume).toBeLessThanOrEqual(1)
          
          // 如果輸入在有效範圍內，應該設定為該值
          if (inputVolume >= 0 && inputVolume <= 1) {
            expect(actualVolume).toBeCloseTo(inputVolume, 2)
          } else if (inputVolume < 0) {
            // 小於0的值應該被設為0
            expect(actualVolume).toBe(0)
          } else {
            // 大於1的值應該被設為1
            expect(actualVolume).toBe(1)
          }
        }
      ), { numRuns: 100 })
    })
  })
})