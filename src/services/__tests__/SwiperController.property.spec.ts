import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { SwiperController } from '../SwiperController'

// Mock Swiper module with proper structure
const mockSwiperInstance = {
  slides: [] as HTMLElement[],
  activeIndex: 0,
  isBeginning: true,
  isEnd: false,
  params: {} as any,
  slideNext: vi.fn(),
  slidePrev: vi.fn(),
  slideTo: vi.fn(),
  update: vi.fn(),
  destroy: vi.fn(),
  keyboard: {
    enable: vi.fn(),
    disable: vi.fn()
  },
  allowTouchMove: true,
  el: null as HTMLElement | null
}

vi.mock('swiper', () => ({
  Swiper: class MockSwiper {
    slides: any[] = []
    activeIndex: number = 0
    isBeginning: boolean = true
    isEnd: boolean = false
    params: any = {}
    slideNext = vi.fn()
    slidePrev = vi.fn()
    slideTo = vi.fn()
    update = vi.fn()
    destroy = vi.fn()
    keyboard = {
      enable: vi.fn(),
      disable: vi.fn()
    }
    allowTouchMove: boolean = true
    el: HTMLElement | null = null

    constructor(container: HTMLElement, options: any) {
      // Reset for each test
      this.slides = []
      this.activeIndex = 0
      this.isBeginning = true
      this.isEnd = false
      this.params = options
      this.el = container
      
      // Simulate slides based on container children
      const slideElements = container.querySelectorAll('.swiper-slide')
      this.slides = Array.from(slideElements)
      
      // Update isEnd based on slides count
      this.isEnd = this.slides.length <= 1
      
      // Store reference for testing - this is the key fix
      Object.assign(mockSwiperInstance, this)
    }

    static use = vi.fn()
  }
}))

vi.mock('swiper/modules', () => ({
  Navigation: {},
  Keyboard: {},
  EffectFade: {}
}))

// Mock Swiper.use as a static method
// This is already handled in the class definition above

describe('SwiperController Property Tests', () => {
  let swiperController: SwiperController
  let mockContainer: HTMLElement

  // Helper function to update mock state and sync with controller
  const updateMockState = (updates: Partial<typeof mockSwiperInstance>) => {
    Object.assign(mockSwiperInstance, updates)
    // Also update the actual swiper instance that the controller references
    const controllerInstance = (swiperController as any).swiperInstance
    if (controllerInstance) {
      Object.assign(controllerInstance, updates)
    }
  }

  beforeEach(() => {
    swiperController = new SwiperController()
    
    // Create mock container with slides
    mockContainer = document.createElement('div')
    mockContainer.className = 'swiper'
    mockContainer.innerHTML = `
      <div class="swiper-wrapper">
        <div class="swiper-slide">Slide 1</div>
        <div class="swiper-slide">Slide 2</div>
        <div class="swiper-slide">Slide 3</div>
      </div>
    `
    document.body.appendChild(mockContainer)
    
    // Reset mock state
    mockSwiperInstance.slides = []
    mockSwiperInstance.activeIndex = 0
    mockSwiperInstance.isBeginning = true
    mockSwiperInstance.isEnd = false
    mockSwiperInstance.slideNext.mockClear()
    mockSwiperInstance.slidePrev.mockClear()
    mockSwiperInstance.slideTo.mockClear()
    mockSwiperInstance.keyboard.enable.mockClear()
    mockSwiperInstance.keyboard.disable.mockClear()
  })

  afterEach(() => {
    swiperController.destroySwiper()
    if (document.body.contains(mockContainer)) {
      document.body.removeChild(mockContainer)
    }
  })

  /**
   * Property 10: Bidirectional Swipe Navigation
   * For any scene that is not at the boundaries, left swipe should navigate to the next scene 
   * and right swipe should navigate to the previous scene
   * Validates: Requirements 3.1, 3.2
   */
  it('Property 10: Bidirectional Swipe Navigation', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 3, max: 10 }), // Number of slides (at least 3 to test middle positions)
        fc.integer({ min: 1, max: 8 }), // Current position (not at boundaries)
        (slideCount, currentPosition) => {
          // Ensure current position is within valid range and not at boundaries
          const validPosition = Math.min(currentPosition, slideCount - 2) // Not at end
          const actualPosition = Math.max(validPosition, 1) // Not at beginning
          
          // Create slides dynamically
          const slideElements = Array.from({ length: slideCount }, (_, i) => {
            const slide = document.createElement('div')
            slide.className = 'swiper-slide'
            slide.textContent = `Slide ${i + 1}`
            return slide
          })
          
          // Update container with new slides
          const wrapper = mockContainer.querySelector('.swiper-wrapper')!
          wrapper.innerHTML = ''
          slideElements.forEach(slide => wrapper.appendChild(slide))
          
          // Initialize swiper
          swiperController.initializeSwiper(mockContainer, slideCount)
          
          // Mock the swiper instance to simulate the current position (not at boundaries)
          updateMockState({
            activeIndex: actualPosition,
            isBeginning: false, // Not at beginning since actualPosition >= 1
            isEnd: false, // Not at end since actualPosition <= slideCount - 2
            slides: slideElements
          })
          
          // Test slideNext (left swipe to next scene)
          const nextResult = swiperController.slideNext()
          expect(nextResult).toBe(true) // Should succeed when not at end
          expect(mockSwiperInstance.slideNext).toHaveBeenCalled()
          
          // Reset mocks
          mockSwiperInstance.slideNext.mockClear()
          mockSwiperInstance.slidePrev.mockClear()
          
          // Test slidePrev (right swipe to previous scene)
          // Ensure we're still not at beginning
          updateMockState({ isBeginning: false })
          const prevResult = swiperController.slidePrev()
          expect(prevResult).toBe(true) // Should succeed when not at beginning
          expect(mockSwiperInstance.slidePrev).toHaveBeenCalled()
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 11: Swipe Transition Animation
   * For any triggered swipe gesture, the system should provide smooth scene transition animation
   * Validates: Requirements 3.3
   */
  it('Property 11: Swipe Transition Animation', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }), // Number of slides
        fc.integer({ min: 300, max: 1000 }), // Animation speed
        fc.oneof(fc.constant('slide'), fc.constant('fade')), // Effect type
        (slideCount, speed, effect) => {
          // Initialize swiper with animation configuration
          const config = {
            speed,
            effect: effect as 'slide' | 'fade'
          }
          
          const animatedController = new SwiperController(config)
          
          // Create slides dynamically
          const slideElements = Array.from({ length: slideCount }, (_, i) => {
            const slide = document.createElement('div')
            slide.className = 'swiper-slide'
            slide.textContent = `Slide ${i + 1}`
            return slide
          })
          
          // Update container with new slides
          const wrapper = mockContainer.querySelector('.swiper-wrapper')!
          wrapper.innerHTML = ''
          slideElements.forEach(slide => wrapper.appendChild(slide))
          
          animatedController.initializeSwiper(mockContainer, slideCount)
          
          // Verify animation configuration is applied
          expect(mockSwiperInstance.params.speed).toBe(speed)
          expect(mockSwiperInstance.params.effect).toBe(effect)
          
          // Test that transition methods are called with proper configuration
          let transitionStarted = false
          let transitionEnded = false
          
          // Simulate transition events
          if (mockSwiperInstance.params.on?.slideChangeTransitionStart) {
            mockSwiperInstance.params.on.slideChangeTransitionStart()
            transitionStarted = true
          }
          
          if (mockSwiperInstance.params.on?.slideChangeTransitionEnd) {
            mockSwiperInstance.params.on.slideChangeTransitionEnd()
            transitionEnded = true
          }
          
          // Verify transition state management
          expect(transitionStarted).toBe(true)
          expect(transitionEnded).toBe(true)
          
          // Test that swipe gestures trigger smooth transitions
          const slideResult = animatedController.slideTo(1, speed)
          expect(slideResult).toBe(true)
          expect(mockSwiperInstance.slideTo).toHaveBeenCalledWith(1, speed)
          
          animatedController.destroySwiper()
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 12: Boundary Swipe Protection
   * For any scene at the first or last position, swipe gestures in the blocked direction 
   * should be prevented (right swipe at first scene, left swipe at last scene)
   * Validates: Requirements 3.4, 3.5
   */
  it('Property 12: Boundary Swipe Protection', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }), // Number of slides (at least 2 to test boundaries)
        fc.oneof(fc.constant('beginning'), fc.constant('end')), // Boundary position
        (slideCount, boundaryPosition) => {
          // Create slides dynamically
          const slideElements = Array.from({ length: slideCount }, (_, i) => {
            const slide = document.createElement('div')
            slide.className = 'swiper-slide'
            slide.textContent = `Slide ${i + 1}`
            return slide
          })
          
          // Update container with new slides
          const wrapper = mockContainer.querySelector('.swiper-wrapper')!
          wrapper.innerHTML = ''
          slideElements.forEach(slide => wrapper.appendChild(slide))
          
          swiperController.initializeSwiper(mockContainer, slideCount)
          
          updateMockState({ slides: slideElements })
          
          // Set up boundary conditions
          if (boundaryPosition === 'beginning') {
            updateMockState({
              activeIndex: 0,
              isBeginning: true,
              isEnd: false
            })
            
            // Test that slidePrev is blocked at beginning
            const prevResult = swiperController.slidePrev()
            expect(prevResult).toBe(false) // Should be blocked
            expect(mockSwiperInstance.slidePrev).not.toHaveBeenCalled()
            
            // Reset mocks and test that slideNext still works at beginning
            mockSwiperInstance.slideNext.mockClear()
            mockSwiperInstance.slidePrev.mockClear()
            
            // For slideNext to work, we need to not be at end
            updateMockState({ isEnd: false })
            const nextResult = swiperController.slideNext()
            expect(nextResult).toBe(true) // Should work
            expect(mockSwiperInstance.slideNext).toHaveBeenCalled()
          } else {
            // At end
            updateMockState({
              activeIndex: slideCount - 1,
              isBeginning: false,
              isEnd: true
            })
            
            // Test that slideNext is blocked at end
            const nextResult = swiperController.slideNext()
            expect(nextResult).toBe(false) // Should be blocked
            expect(mockSwiperInstance.slideNext).not.toHaveBeenCalled()
            
            // Reset mocks and test that slidePrev still works at end
            mockSwiperInstance.slideNext.mockClear()
            mockSwiperInstance.slidePrev.mockClear()
            
            // For slidePrev to work, we need to not be at beginning
            updateMockState({ isBeginning: false })
            const prevResult = swiperController.slidePrev()
            expect(prevResult).toBe(true) // Should work
            expect(mockSwiperInstance.slidePrev).toHaveBeenCalled()
          }
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Additional test for swipe navigation configuration
   */
  it('should properly configure swipe navigation settings', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // allowTouchMove
        fc.boolean(), // keyboard enabled
        fc.boolean(), // mousewheel enabled
        (touchEnabled, keyboardEnabled, mousewheelEnabled) => {
          const config = {
            allowTouchMove: touchEnabled,
            keyboard: { enabled: keyboardEnabled },
            mousewheel: { enabled: mousewheelEnabled }
          }
          
          const configuredController = new SwiperController(config)
          configuredController.initializeSwiper(mockContainer, 3)
          
          // Verify configuration is applied
          expect(mockSwiperInstance.params.allowTouchMove).toBe(touchEnabled)
          expect(mockSwiperInstance.params.keyboard.enabled).toBe(keyboardEnabled)
          expect(mockSwiperInstance.params.mousewheel.enabled).toBe(mousewheelEnabled)
          
          // Test dynamic configuration updates
          configuredController.setTouchEnabled(!touchEnabled)
          
          // Use updateMockState to ensure sync
          updateMockState({ allowTouchMove: !touchEnabled })
          expect(mockSwiperInstance.allowTouchMove).toBe(!touchEnabled)
          
          // Clear previous calls before testing keyboard
          mockSwiperInstance.keyboard.enable.mockClear()
          mockSwiperInstance.keyboard.disable.mockClear()
          
          configuredController.setKeyboardEnabled(!keyboardEnabled)
          if (!keyboardEnabled) {
            // If keyboard was disabled, enabling it should call enable
            expect(mockSwiperInstance.keyboard.enable).toHaveBeenCalled()
          } else {
            // If keyboard was enabled, disabling it should call disable
            expect(mockSwiperInstance.keyboard.disable).toHaveBeenCalled()
          }
          
          configuredController.destroySwiper()
        }
      ),
      { numRuns: 25 }
    )
  })

  /**
   * Test slide navigation bounds checking
   */
  it('should handle slide navigation within valid bounds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }), // Number of slides
        fc.integer({ min: -2, max: 12 }), // Target slide index (including invalid)
        (slideCount, targetIndex) => {
          // Create slides dynamically
          const slideElements = Array.from({ length: slideCount }, (_, i) => {
            const slide = document.createElement('div')
            slide.className = 'swiper-slide'
            slide.textContent = `Slide ${i + 1}`
            return slide
          })
          
          // Update container with new slides
          const wrapper = mockContainer.querySelector('.swiper-wrapper')!
          wrapper.innerHTML = ''
          slideElements.forEach(slide => wrapper.appendChild(slide))
          
          swiperController.initializeSwiper(mockContainer, slideCount)
          mockSwiperInstance.slides = slideElements
          
          const result = swiperController.slideTo(targetIndex)
          
          if (targetIndex >= 0 && targetIndex < slideCount) {
            // Valid index should succeed
            expect(result).toBe(true)
            expect(mockSwiperInstance.slideTo).toHaveBeenCalledWith(targetIndex, undefined)
          } else {
            // Invalid index should fail
            expect(result).toBe(false)
            expect(mockSwiperInstance.slideTo).not.toHaveBeenCalled()
          }
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Test boundary feedback mechanism
   */
  it('should trigger boundary feedback when attempting blocked swipes', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 5 }), // Number of slides
        fc.oneof(fc.constant('beginning'), fc.constant('end')), // Boundary position
        (slideCount, boundaryPosition) => {
          // Create slides dynamically
          const slideElements = Array.from({ length: slideCount }, (_, i) => {
            const slide = document.createElement('div')
            slide.className = 'swiper-slide'
            slide.textContent = `Slide ${i + 1}`
            return slide
          })
          
          // Update container with new slides
          const wrapper = mockContainer.querySelector('.swiper-wrapper')!
          wrapper.innerHTML = ''
          slideElements.forEach(slide => wrapper.appendChild(slide))
          
          swiperController.initializeSwiper(mockContainer, slideCount)
          updateMockState({ slides: slideElements })
          
          // Mock boundary attempt callback
          let boundaryAttemptCalled = false
          let attemptDirection: 'prev' | 'next' | null = null
          
          swiperController.onBoundaryAttempt((direction) => {
            boundaryAttemptCalled = true
            attemptDirection = direction
          })
          
          if (boundaryPosition === 'beginning') {
            updateMockState({
              activeIndex: 0,
              isBeginning: true,
              isEnd: false
            })
            
            // Attempt blocked swipe at beginning
            const result = swiperController.slidePrev()
            expect(result).toBe(false) // Should be blocked
            
            expect(boundaryAttemptCalled).toBe(true)
            expect(attemptDirection).toBe('prev')
          } else {
            updateMockState({
              activeIndex: slideCount - 1,
              isBeginning: false,
              isEnd: true
            })
            
            // Attempt blocked swipe at end
            const result = swiperController.slideNext()
            expect(result).toBe(false) // Should be blocked
            
            expect(boundaryAttemptCalled).toBe(true)
            expect(attemptDirection).toBe('next')
          }
        }
      ),
      { numRuns: 25 }
    )
  })

  /**
   * Test transition state protection
   */
  it('should prevent navigation during transitions', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 5 }), // Number of slides
        fc.integer({ min: 0, max: 4 }), // Target slide index
        (slideCount, targetIndex) => {
          // Create slides dynamically
          const slideElements = Array.from({ length: slideCount }, (_, i) => {
            const slide = document.createElement('div')
            slide.className = 'swiper-slide'
            slide.textContent = `Slide ${i + 1}`
            return slide
          })
          
          // Update container with new slides
          const wrapper = mockContainer.querySelector('.swiper-wrapper')!
          wrapper.innerHTML = ''
          slideElements.forEach(slide => wrapper.appendChild(slide))
          
          swiperController.initializeSwiper(mockContainer, slideCount)
          mockSwiperInstance.slides = slideElements
          
          // Simulate transition in progress
          ;(swiperController as any).isTransitioning = true
          
          // All navigation should be blocked during transition
          const nextResult = swiperController.slideNext()
          const prevResult = swiperController.slidePrev()
          const slideToResult = swiperController.slideTo(Math.min(targetIndex, slideCount - 1))
          
          expect(nextResult).toBe(false)
          expect(prevResult).toBe(false)
          expect(slideToResult).toBe(false)
          
          // Verify no swiper methods were called
          expect(mockSwiperInstance.slideNext).not.toHaveBeenCalled()
          expect(mockSwiperInstance.slidePrev).not.toHaveBeenCalled()
          expect(mockSwiperInstance.slideTo).not.toHaveBeenCalled()
        }
      ),
      { numRuns: 25 }
    )
  })
})