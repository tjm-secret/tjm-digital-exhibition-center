import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import * as fc from 'fast-check'
import NavigationComponent from '../NavigationComponent.vue'
import type { Scene } from '@/types'

// Mock DOM methods
beforeEach(() => {
  // Mock scrollTo method
  Element.prototype.scrollTo = vi.fn()
  
  // Mock scroll properties
  Object.defineProperty(Element.prototype, 'scrollLeft', {
    get: function() { return this._scrollLeft || 0 },
    set: function(value) { this._scrollLeft = value },
    configurable: true
  })
  
  Object.defineProperty(Element.prototype, 'scrollWidth', {
    get: function() { return this._scrollWidth || 1000 },
    configurable: true
  })
  
  Object.defineProperty(Element.prototype, 'clientWidth', {
    get: function() { return this._clientWidth || 500 },
    configurable: true
  })
  
  Object.defineProperty(Element.prototype, 'offsetLeft', {
    get: function() { return this._offsetLeft || 0 },
    configurable: true
  })
  
  Object.defineProperty(Element.prototype, 'offsetWidth', {
    get: function() { return this._offsetWidth || 60 },
    configurable: true
  })
})

// 簡化的場景生成器
const simpleSceneArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 10 }),
  title: fc.string({ minLength: 1, maxLength: 20 }),
  description: fc.record({
    zh: fc.string({ maxLength: 50 }),
    en: fc.string({ maxLength: 50 })
  }),
  image: fc.record({
    url: fc.constant('https://example.com/image.jpg'),
    alt: fc.string({ maxLength: 20 }),
    width: fc.constant(1920),
    height: fc.constant(1080),
    thumbnail: fc.option(fc.constant('https://example.com/thumb.jpg'), { nil: undefined })
  }),
  audio: fc.record({
    zh: fc.record({
      url: fc.constant('https://example.com/audio-zh.mp3'),
      duration: fc.integer({ min: 30, max: 300 }),
      format: fc.constant('mp3' as const),
      size: fc.integer({ min: 1000000, max: 5000000 })
    }),
    en: fc.record({
      url: fc.constant('https://example.com/audio-en.mp3'),
      duration: fc.integer({ min: 30, max: 300 }),
      format: fc.constant('mp3' as const),
      size: fc.integer({ min: 1000000, max: 5000000 })
    })
  }),
  order: fc.integer({ min: 1, max: 20 })
})

// 生成器：創建場景數組
const scenesArbitrary = fc.array(simpleSceneArbitrary, { minLength: 1, maxLength: 10 })

describe('NavigationComponent Property Tests', () => {
  describe('Property 13: Navigation Bar Scene Representation', () => {
    it('should display representations for all scenes in any loaded exhibition', () => {
      /**
       * Feature: online-exhibition, Property 13: Navigation Bar Scene Representation
       * For any loaded exhibition, the bottom navigation bar should display representations (thumbnails or indicators) for all scenes
       * Validates: Requirements 4.1
       */
      fc.assert(fc.property(
        scenesArbitrary,
        fc.integer({ min: 0, max: 9 }),
        (scenes: Scene[], currentIndex: number) => {
          // 確保 currentIndex 在有效範圍內
          const validCurrentIndex = Math.min(currentIndex, scenes.length - 1)
          
          const wrapper = mount(NavigationComponent, {
            props: {
              scenes,
              currentIndex: validCurrentIndex,
              showThumbnails: false
            }
          })

          // 檢查是否為每個場景都顯示了導覽項目
          const navigationItems = wrapper.findAll('.navigation-item')
          expect(navigationItems).toHaveLength(scenes.length)

          // 檢查每個導覽項目都有適當的標識
          scenes.forEach((_, index) => {
            const item = navigationItems[index]
            if (!item) return // 跳過不存在的項目
            
            // 檢查是否有點點指示器（簡潔設計只有點點，沒有編號）
            const indicator = item.find('div')
            expect(indicator.exists()).toBe(true)
            
            // 檢查 aria 標籤
            expect(item.attributes('aria-label')).toContain(`跳轉到場景 ${index + 1}`)
          })
        }
      ), { numRuns: 50 })
    })
  })

  describe('Property 14: Navigation Bar Jump Functionality', () => {
    it('should jump directly to the corresponding scene when any navigation bar item is clicked', () => {
      /**
       * Feature: online-exhibition, Property 14: Navigation Bar Jump Functionality
       * For any clicked navigation bar item, the system should jump directly to the corresponding scene
       * Validates: Requirements 4.2
       */
      fc.assert(fc.property(
        scenesArbitrary,
        fc.integer({ min: 0, max: 9 }),
        fc.integer({ min: 0, max: 9 }),
        (scenes: Scene[], currentIndex: number, targetIndex: number) => {
          // 確保索引在有效範圍內
          const validCurrentIndex = Math.min(currentIndex, scenes.length - 1)
          const validTargetIndex = Math.min(targetIndex, scenes.length - 1)
          
          const wrapper = mount(NavigationComponent, {
            props: {
              scenes,
              currentIndex: validCurrentIndex,
              showThumbnails: false
            }
          })

          // 點擊目標導覽項目
          const navigationItems = wrapper.findAll('.navigation-item')
          if (navigationItems.length > validTargetIndex) {
            const targetItem = navigationItems[validTargetIndex]
            if (targetItem) {
              targetItem.trigger('click')

              // 檢查是否發出了跳轉動畫開始事件（這個事件是立即發出的）
              const jumpStartEvents = wrapper.emitted('jump-animation-start')
              expect(jumpStartEvents).toBeDefined()
              if (jumpStartEvents) {
                expect(jumpStartEvents[0]).toEqual([validTargetIndex])
              }
            }
          }
        }
      ), { numRuns: 50 })
    })
  })

  describe('Property 15: Navigation Bar State Synchronization', () => {
    it('should highlight the current scene position', () => {
      /**
       * Feature: online-exhibition, Property 15: Navigation Bar State Synchronization
       * For any scene change, the navigation bar should highlight the current scene's position
       * Validates: Requirements 4.3
       */
      fc.assert(fc.property(
        scenesArbitrary,
        fc.integer({ min: 0, max: 9 }),
        (scenes: Scene[], currentIndex: number) => {
          // 確保 currentIndex 在有效範圍內
          const validCurrentIndex = Math.min(currentIndex, scenes.length - 1)
          
          const wrapper = mount(NavigationComponent, {
            props: {
              scenes,
              currentIndex: validCurrentIndex,
              showThumbnails: false
            }
          })

          const navigationItems = wrapper.findAll('.navigation-item')

          // 檢查當前場景的 aria-current 屬性
          scenes.forEach((_, index) => {
            const item = navigationItems[index]
            if (!item) return // 跳過不存在的項目
            
            const isCurrentScene = index === validCurrentIndex
            
            if (isCurrentScene) {
              expect(item.attributes('aria-current')).toBe('true')
              // 檢查當前場景的點點是否為藍色
              const dot = item.find('div')
              expect(dot.classes()).toContain('bg-blue-600')
            } else {
              expect(item.attributes('aria-current')).toBe('false')
              // 非當前場景的點點應該是灰色
              const dot = item.find('div')
              expect(dot.classes()).toContain('bg-gray-400')
            }
          })
        }
      ), { numRuns: 50 })
    })
  })

  describe('Edge Cases', () => {
    it('should handle single scene exhibitions correctly', () => {
      const singleScene: Scene = {
        id: 'single-scene',
        title: 'Single Scene',
        description: { zh: '單一場景', en: 'Single Scene' },
        image: {
          url: 'https://example.com/image.jpg',
          alt: 'Single scene image',
          width: 1920,
          height: 1080
        },
        audio: {
          zh: { url: 'https://example.com/audio-zh.mp3', duration: 60, format: 'mp3', size: 1000000 },
          en: { url: 'https://example.com/audio-en.mp3', duration: 60, format: 'mp3', size: 1000000 }
        },
        order: 1
      }

      const wrapper = mount(NavigationComponent, {
        props: {
          scenes: [singleScene],
          currentIndex: 0,
          showThumbnails: false
        }
      })

      // 應該顯示一個導覽項目
      const navigationItems = wrapper.findAll('.navigation-item')
      expect(navigationItems).toHaveLength(1)
      
      // 該項目應該被高亮
      if (navigationItems[0]) {
        const dot = navigationItems[0].find('div')
        expect(dot.classes()).toContain('bg-blue-600')
        expect(navigationItems[0].attributes('aria-current')).toBe('true')
      }
    })

    it('should handle empty scenes array gracefully', () => {
      const wrapper = mount(NavigationComponent, {
        props: {
          scenes: [],
          currentIndex: 0,
          showThumbnails: false
        }
      })

      // 不應該有任何導覽項目
      const navigationItems = wrapper.findAll('.navigation-item')
      expect(navigationItems).toHaveLength(0)
    })
  })
})